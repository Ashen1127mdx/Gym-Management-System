<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/GymClass.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $classes = GymClass::fetchAll($db);
    echo json_encode($classes);
} else if ($method === 'POST') {
    if (!empty($data['className']) && !empty($data['scheduleTime']) && !empty($data['capacity'])) {
        $classId = 'class-' . uniqid();

        $gymClass = new GymClass(
            $classId,
            $data['className'],
            $data['trainerId'] ?? null,
            $data['scheduleTime'],
            (int)$data['capacity'],
            $data['status'] ?? 'Active'
        );

        if ($gymClass->create($db)) {
            echo json_encode(['success' => true, 'message' => 'Gym class schedule added successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add gym class.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    }
}
?>
