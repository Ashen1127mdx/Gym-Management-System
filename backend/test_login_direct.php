<?php
require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "✅ Database connection successful!\n";
    
    // Test query
    $stmt = $db->query("SELECT * FROM users WHERE email = 'admin@fitzone.com'");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "\nAdmin user found:\n";
        echo "Name: " . $user['name'] . "\n";
        echo "Email: " . $user['email'] . "\n";
        echo "Role: " . $user['role'] . "\n";
        echo "Status: " . $user['status'] . "\n";
        echo "Password hash: " . $user['password'] . "\n";
        
        // Test password verification
        $testPassword = 'Admin@123';
        $verified = password_verify($testPassword, $user['password']);
        echo "\nPassword verification: " . ($verified ? "SUCCESS ✅" : "FAILED ❌") . "\n";
    } else {
        echo "\n❌ Admin user not found!";
    }
} else {
    echo "❌ Database connection failed!";
}
?>