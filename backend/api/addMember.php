<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. Use POST with JSON or form-encoded data.',
        'payload' => null,
    ]);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $rawInput = file_get_contents('php://input');
    $body = null;

    if (!empty($rawInput)) {
        $body = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $parsed = [];
            parse_str($rawInput, $parsed);
            if (!empty($parsed) && is_array($parsed)) {
                $body = $parsed;
            } else {
                $body = null;
            }
        }
    }

    if (!is_array($body) || empty($body)) {
        if (!empty($_POST) && is_array($_POST)) {
            $body = $_POST;
        } elseif (!empty($_REQUEST) && is_array($_REQUEST)) {
            $body = $_REQUEST;
        }
    }

    if (!is_array($body) || empty($body)) {
        throw new InvalidArgumentException('Invalid request payload. Expected JSON body or form-encoded POST data.');
    }

    $required = ['full_name', 'nic', 'dob', 'gender', 'email', 'contact', 'join_date', 'status', 'plan_label'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            throw new InvalidArgumentException(sprintf('Missing required field: %s', $field));
        }
    }

    $database = new Database();
    $database->ensureSchema();
    $db = $database->connect();

    $sql = "INSERT INTO members (
            full_name,
            nic,
            dob,
            gender,
            contact,
            email,
            address,
            emergency_contact,
            plan_label,
            join_date,
            photo,
            status
        ) VALUES (
            :full_name,
            :nic,
            :dob,
            :gender,
            :contact,
            :email,
            :address,
            :emergency_contact,
            :plan_label,
            :join_date,
            :photo,
            :status
        )";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':full_name' => trim($body['full_name']),
        ':nic' => trim($body['nic']),
        ':dob' => $body['dob'],
        ':gender' => trim($body['gender']),
        ':contact' => trim($body['contact']),
        ':email' => trim($body['email']),
        ':address' => !empty($body['address']) ? trim($body['address']) : null,
        ':emergency_contact' => !empty($body['emergency_contact']) ? trim($body['emergency_contact']) : null,
        ':plan_label' => !empty($body['plan_label']) ? trim($body['plan_label']) : null,
        ':join_date' => $body['join_date'],
        ':photo' => !empty($body['photo']) ? trim($body['photo']) : null,
        ':status' => trim($body['status']),
    ]);

    $memberId = $db->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Member added successfully.',
        'member' => [
            'member_id' => $memberId,
            'full_name' => trim($body['full_name']),
            'nic' => trim($body['nic']),
            'dob' => $body['dob'],
            'gender' => trim($body['gender']),
            'contact' => trim($body['contact']),
            'email' => trim($body['email']),
            'address' => !empty($body['address']) ? trim($body['address']) : null,
            'emergency_contact' => !empty($body['emergency_contact']) ? trim($body['emergency_contact']) : null,
            'plan_label' => !empty($body['plan_label']) ? trim($body['plan_label']) : null,
            'join_date' => $body['join_date'],
            'photo' => !empty($body['photo']) ? trim($body['photo']) : null,
            'status' => trim($body['status']),
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Database error saving member.',
        'error' => $e->getMessage(),
        'payload' => $body,
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'payload' => isset($body) ? $body : null,
    ]);
}
