<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/Complaint.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $complaints = Complaint::fetchAll($db);
    echo json_encode($complaints);
} else if ($method === 'POST') {
    if (!empty($data['filedById']) && !empty($data['filedByRole']) && !empty($data['subject']) && !empty($data['description'])) {
        $complaintId = 'comp-' . uniqid();

        $complaint = new Complaint(
            $complaintId,
            $data['filedById'],
            $data['filedByRole'],
            $data['againstId'] ?? null,
            $data['subject'],
            $data['description'],
            'Pending'
        );

        if ($complaint->create($db)) {
            echo json_encode(['success' => true, 'message' => 'Complaint filed successfully. Admin will review it.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to file complaint.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    }
} else if ($method === 'PUT') {
    $complaintId = $_GET['id'] ?? '';
    if (!$complaintId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Complaint ID is required.']);
        exit();
    }

    if (Complaint::resolve($db, $complaintId)) {
        echo json_encode(['success' => true, 'message' => 'Complaint marked as resolved.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to resolve complaint.']);
    }
}
?>
