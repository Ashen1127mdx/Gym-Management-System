<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method. Use DELETE or POST.',
    ]);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if (!is_array($body)) {
        parse_str($rawInput, $parsed);
        $body = is_array($parsed) ? $parsed : [];
    }

    $memberId = null;
    if (!empty($body['member_id'])) {
        $memberId = $body['member_id'];
    } elseif (!empty($_GET['member_id'])) {
        $memberId = $_GET['member_id'];
    }

    if (empty($memberId) || !is_numeric($memberId)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing or invalid member_id.',
        ]);
        exit;
    }

    $memberId = (int) $memberId;

    $database = new Database();
    $db = $database->connect();

    $stmt = $db->prepare('SELECT member_id FROM members WHERE member_id = :member_id');
    $stmt->execute([':member_id' => $memberId]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Member not found.',
        ]);
        exit;
    }

    $deleteStmt = $db->prepare('DELETE FROM members WHERE member_id = :member_id');
    $deleteStmt->execute([':member_id' => $memberId]);

    echo json_encode([
        'success' => true,
        'message' => 'Member deleted successfully.',
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error while deleting member: ' . $e->getMessage(),
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error while deleting member: ' . $e->getMessage(),
    ]);
}
