<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/Trainer.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $trainers = Trainer::fetchAll($db);
    echo json_encode($trainers);
} else if ($method === 'POST') {
    if (!empty($data['name']) && !empty($data['email'])) {
        $id = 'tr-' . uniqid();
        $hashedPassword = password_hash('trainer123', PASSWORD_DEFAULT);

        $trainer = new Trainer(
            $id,
            $data['name'],
            $data['email'],
            $hashedPassword,
            $data['phone'] ?? '',
            'Active',
            $data['specialization'] ?? 'Strength',
            0,
            $data['avatarUrl'] ?? '', // No default avatar
            $data['role'] ?? 'Trainer',
            0
        );

        if ($trainer->create($db)) {
            echo json_encode(['success' => true, 'message' => 'Trainer added successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add trainer.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    }
} else if ($method === 'PUT') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID is required for update.']);
        exit();
    }

    // Fetch existing trainer so we don't clobber fields the client didn't send
    $stmt = $db->prepare(
        "SELECT u.name, u.email, u.phone, u.status, t.specialization, t.assigned_members_count, t.avatar_url, t.role_title, t.archived
         FROM users u JOIN trainers t ON u.id = t.id
         WHERE u.id = :id"
    );
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Trainer not found.']);
        exit();
    }

    $trainer = new Trainer(
        $id,
        $data['name'] ?? $existing['name'],
        $data['email'] ?? $existing['email'],
        null,
        $data['phone'] ?? $existing['phone'],
        $data['status'] ?? $existing['status'],
        $data['specialization'] ?? $existing['specialization'],
        $data['assignedMembersCount'] ?? (int)$existing['assigned_members_count'],
        $data['avatarUrl'] ?? $existing['avatar_url'],
        $data['role'] ?? $existing['role_title'],
        $data['archived'] ?? (int)$existing['archived']
    );

    if ($trainer->update($db)) {
        echo json_encode(['success' => true, 'message' => 'Trainer updated successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update trainer.']);
    }
} else if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID is required for delete.']);
        exit();
    }

    if (Trainer::delete($db, $id)) {
        echo json_encode(['success' => true, 'message' => 'Trainer archived/deleted successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete trainer.']);
    }
}
?>
