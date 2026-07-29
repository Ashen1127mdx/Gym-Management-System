<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. Use POST.',
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

    if (!empty($_POST) && is_array($_POST)) {
        $body = array_merge($body ?? [], $_POST);
    }

    if (!empty($_REQUEST) && is_array($_REQUEST)) {
        $body = array_merge($body ?? [], $_REQUEST);
    }

    $memberId = null;
    if (!empty($body['member_id']) && is_numeric($body['member_id'])) {
        $memberId = (int) $body['member_id'];
    }

    if ($memberId === null) {
        throw new InvalidArgumentException('Missing or invalid member_id.');
    }

    $required = ['full_name', 'nic', 'dob', 'gender', 'email', 'contact', 'join_date', 'status', 'plan_label'];
    $errors = [];

    foreach ($required as $field) {
        if (empty($body[$field]) || !is_string($body[$field]) || trim($body[$field]) === '') {
            $errors[] = sprintf('Missing required field: %s.', $field);
        }
    }

    if (!empty($body['email']) && !filter_var(trim($body['email']), FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email address.';
    }

    if (!empty($body['contact'])) {
        $contact = preg_replace('/[^0-9]/', '', $body['contact']);
        if (strlen($contact) < 7 || strlen($contact) > 15) {
            $errors[] = 'Contact number must be 7-15 digits.';
        }
    }

    if (!empty($body['nic'])) {
        $nic = trim($body['nic']);
        if (!preg_match('/^[A-Za-z0-9-]{5,20}$/', $nic)) {
            $errors[] = 'NIC/ID must be 5-20 characters and can include letters, numbers, or dashes.';
        }
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors,
        ]);
        exit;
    }

    $database = new Database();
    $db = $database->connect();

    $stmt = $db->prepare('SELECT member_id FROM members WHERE (nic = :nic OR email = :email) AND member_id != :member_id');
    $stmt->execute([
        ':nic' => trim($body['nic']),
        ':email' => trim($body['email']),
        ':member_id' => $memberId,
    ]);
    $duplicate = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($duplicate) {
        $errors[] = 'NIC or email already exists for another member.';
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors,
        ]);
        exit;
    }

    $photoUrl = null;
    if (!empty($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
        $photoFile = $_FILES['photo'];
        $allowedTypes = [
            'image/png' => 'png',
            'image/jpeg' => 'jpg',
            'image/webp' => 'webp',
        ];

        if ($photoFile['error'] !== UPLOAD_ERR_OK) {
            throw new InvalidArgumentException('Photo upload failed with error code: ' . $photoFile['error']);
        }

        if (!isset($allowedTypes[$photoFile['type']])) {
            throw new InvalidArgumentException('Uploaded photo must be PNG, JPG, or WEBP.');
        }

        if ($photoFile['size'] > 5 * 1024 * 1024) {
            throw new InvalidArgumentException('Uploaded photo must be 5MB or smaller.');
        }

        $uploadDir = __DIR__ . '/../uploads';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
            throw new RuntimeException('Unable to create upload directory.');
        }

        $extension = $allowedTypes[$photoFile['type']];
        $filename = 'member_' . $memberId . '_' . uniqid('', true) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $filename;

        if (!move_uploaded_file($photoFile['tmp_name'], $destination)) {
            throw new RuntimeException('Failed to save uploaded photo.');
        }

        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['SERVER_PORT'] ?? '') === '443') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $basePath = dirname(dirname($_SERVER['SCRIPT_NAME']));
        $photoUrl = sprintf('%s://%s%s/uploads/%s', $scheme, $host, $basePath, $filename);
    } elseif (!empty($body['photo_url'])) {
        $photoUrl = trim($body['photo_url']);
    }

    $sql = "UPDATE members SET
            full_name = :full_name,
            nic = :nic,
            dob = :dob,
            gender = :gender,
            contact = :contact,
            email = :email,
            address = :address,
            emergency_contact = :emergency_contact,
            plan_label = :plan_label,
            join_date = :join_date,
            status = :status";

    if ($photoUrl !== null) {
        $sql .= ", photo = :photo";
    }
    $sql .= " WHERE member_id = :member_id";

    $params = [
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
        ':status' => trim($body['status']),
        ':member_id' => $memberId,
    ];

    if ($photoUrl !== null) {
        $params[':photo'] = $photoUrl;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'success' => true,
        'message' => 'Member updated successfully',
    ]);
} catch (PDOException $e) {
    error_log('updateMember.php DB error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error updating member.',
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}
