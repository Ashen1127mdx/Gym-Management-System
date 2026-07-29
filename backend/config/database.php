<?php

class Database
{
    private string $db_name;
    private string $username;
    private string $password;
    private array $hosts;
    private array $ports;
    private string $charset;

    public function __construct()
    {
        $this->loadEnv(__DIR__ . '/.env');

        $this->db_name = getenv('DB_NAME') ?: 'fitzone_gym';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') ?: '';
        $this->hosts = $this->parseList(getenv('DB_HOSTS') ?: getenv('DB_HOST'), ['127.0.0.1', 'localhost']);
        $this->ports = $this->parsePorts(getenv('DB_PORTS') ?: getenv('DB_PORT'), [3306, 3308]);
        $this->charset = getenv('DB_CHARSET') ?: 'utf8mb4';
    }

    private function loadEnv(string $path): void
    {
        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || str_starts_with($line, ';')) {
                continue;
            }

            if (!str_contains($line, '=')) {
                continue;
            }

            [$name, $value] = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            if ($name === '') {
                continue;
            }

            if ((str_starts_with($value, '"') && str_ends_with($value, '"')) || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                $value = substr($value, 1, -1);
            }

            putenv($name . '=' . $value);
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }

    private function parseList(?string $envValue, array $default): array
    {
        if (empty($envValue)) {
            return $default;
        }

        $items = array_filter(array_map('trim', explode(',', $envValue)), fn ($item) => $item !== '');
        return !empty($items) ? array_values($items) : $default;
    }

    private function parsePorts(?string $envValue, array $default): array
    {
        if (empty($envValue)) {
            return $default;
        }

        $ports = array_filter(array_map('intval', explode(',', $envValue)), fn ($port) => $port > 0);
        return !empty($ports) ? array_values($ports) : $default;
    }

    public function connect()
    {
        $lastException = null;

        foreach ($this->hosts as $host) {
            foreach ($this->ports as $port) {
                $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $this->db_name, $this->charset);

                try {
                    $pdo = new PDO($dsn, $this->username, $this->password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]);

                    return $pdo;
                } catch (PDOException $e) {
                    $lastException = $e;
                }
            }
        }

        throw new RuntimeException(
            'Database connection error: ' . ($lastException ? $lastException->getMessage() : 'Unable to connect to MySQL'),
            $lastException ? (int) $lastException->getCode() : 0,
            $lastException
        );
    }

    public function getDebugInfo(): array
    {
        return [
            'db_name' => $this->db_name,
            'db_user' => $this->username,
            'db_hosts' => $this->hosts,
            'db_ports' => $this->ports,
            'db_charset' => $this->charset,
        ];
    }

    private function columnExists(PDO $pdo, string $table, string $column): bool
    {
        $tableName = str_replace('`', '``', $table);
        $quotedColumn = $pdo->quote($column);
        $stmt = $pdo->query("SHOW COLUMNS FROM `{$tableName}` LIKE {$quotedColumn}");
        return $stmt !== false && (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function ensureSchema(): void
    {
        $pdo = $this->connect();

        $pdo->exec("CREATE TABLE IF NOT EXISTS membership_plans (
            plan_id INT NOT NULL AUTO_INCREMENT,
            plan_name VARCHAR(100) NOT NULL,
            PRIMARY KEY (plan_id),
            UNIQUE KEY (plan_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $pdo->exec("INSERT IGNORE INTO membership_plans (plan_name) VALUES
            ('Monthly'),
            ('Quarterly'),
            ('Annual'),
            ('Day Pass')");

        $pdo->exec("CREATE TABLE IF NOT EXISTS members (
            member_id INT NOT NULL AUTO_INCREMENT,
            full_name VARCHAR(100) NOT NULL,
            nic VARCHAR(20) NOT NULL,
            dob DATE NOT NULL,
            gender VARCHAR(20) NOT NULL,
            contact VARCHAR(15) NOT NULL,
            email VARCHAR(100) NOT NULL,
            address TEXT DEFAULT NULL,
            emergency_contact VARCHAR(15) DEFAULT NULL,
            plan_id INT DEFAULT NULL,
            plan_label VARCHAR(100) DEFAULT NULL,
            join_date DATE NOT NULL,
            photo VARCHAR(255) DEFAULT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'Active',
            PRIMARY KEY (member_id),
            UNIQUE KEY (nic),
            UNIQUE KEY (email),
            KEY fk_member_plan (plan_id),
            CONSTRAINT fk_member_plan FOREIGN KEY (plan_id) REFERENCES membership_plans (plan_id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        if (!$this->columnExists($pdo, 'members', 'plan_label')) {
            $pdo->exec("ALTER TABLE members ADD COLUMN plan_label VARCHAR(100) DEFAULT NULL AFTER plan_id");
        }
    }
}
