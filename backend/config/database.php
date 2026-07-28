<?php

class Database
{
    private $host = '127.0.0.1';
    private $db_name = 'fitzone_gym';
    private $username = 'root';
    private $password = '';
    private $port = 3306;
    private $charset = 'utf8mb4';

    public function connect()
    {
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $this->host, $this->port, $this->db_name, $this->charset);

        try {
            $pdo = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            return $pdo;
        } catch (PDOException $e) {
            throw new RuntimeException('Database connection error: ' . $e->getMessage(), (int) $e->getCode(), $e);
        }
    }
}
