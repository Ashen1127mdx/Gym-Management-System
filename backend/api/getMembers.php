<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $database->ensureSchema();
    $db = $database->connect();

    $query = "SELECT
            m.member_id,
            m.full_name,
            m.nic,
            m.dob,
            m.gender,
            m.contact,
            m.email,
            m.address,
            m.emergency_contact,
            m.plan_id,
            m.plan_label,
            m.join_date,
            m.photo,
            m.status
        FROM members m
        ORDER BY m.join_date DESC, m.member_id DESC";

    $stmt = $db->query($query);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $members,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to load members.',
        'error' => $e->getMessage(),
    ]);
}
