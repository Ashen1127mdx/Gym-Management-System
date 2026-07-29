<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if ($db instanceof PDO) {
        echo json_encode([
            'success' => true,
            'message' => 'Database connected successfully',
            'config' => $database->getDebugInfo(),
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Connection object is not a valid PDO instance.',
            'config' => $database->getDebugInfo(),
        ]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    $response = [
        'success' => false,
        'message' => 'Database connection failed.',
        'error' => $e->getMessage(),
    ];

    if (isset($database) && method_exists($database, 'getDebugInfo')) {
        $response['config'] = $database->getDebugInfo();
    }

    echo json_encode($response);
}
