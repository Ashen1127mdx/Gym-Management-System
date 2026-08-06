<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/MembershipPlan.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $plans = MembershipPlan::fetchAll($db);
    echo json_encode($plans);
} else if ($method === 'POST') {
    if (!empty($data['name']) && !empty($data['price'])) {
        $id = 'plan-' . uniqid();

        $plan = new MembershipPlan(
            $id,
            $data['name'],
            $data['price'],
            $data['billingCycle'] ?? 'Monthly',
            $data['tier'] ?? 'Standard',
            !empty($data['isPopular']) ? 1 : 0,
            $data['features'] ?? []
        );

        if ($plan->create($db)) {
            echo json_encode(['success' => true, 'message' => 'Plan added successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add plan.']);
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

    $plan = new MembershipPlan(
        $id,
        $data['name'] ?? '',
        $data['price'] ?? 0,
        $data['billingCycle'] ?? 'Monthly',
        $data['tier'] ?? 'Standard',
        !empty($data['isPopular']) ? 1 : 0,
        $data['features'] ?? []
    );

    if ($plan->update($db)) {
        echo json_encode(['success' => true, 'message' => 'Plan updated successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update plan.']);
    }
} else if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID is required for delete.']);
        exit();
    }

    if (MembershipPlan::delete($db, $id)) {
        echo json_encode(['success' => true, 'message' => 'Plan deleted successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete plan.']);
    }
}
?>
