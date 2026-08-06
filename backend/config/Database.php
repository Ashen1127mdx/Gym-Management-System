<?php
class Database {
    private $host = "localhost";
    private $db_name = "fitzone_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // If connection fails, try without database name to allow creating it or fallback gracefully
            try {
                $this->conn = new PDO("mysql:host=" . $this->host, $this->username, $this->password);
                $this->conn->exec("CREATE DATABASE IF NOT EXISTS " . $this->db_name);
                $this->conn->exec("use " . $this->db_name);
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch(PDOException $e) {
                echo "Connection error: " . $e->getMessage();
            }
        }
        return $this->conn;
    }
}
?>
