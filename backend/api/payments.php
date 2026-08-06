<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/Payment.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $payments = Payment::fetchAll($db);
    echo json_encode($payments);
} else if ($method === 'POST') {
    if (!empty($data['memberId']) && !empty($data['planId']) && !empty($data['amount'])) {
        $paymentId = 'pay-' . uniqid();
        $today = date('M d, Y');

        $payment = new Payment(
            $paymentId,
            $data['memberId'],
            $data['planId'],
            (float)$data['amount'],
            $today
        );

        if ($payment->create($db)) {
            // Also update user membership status to Active
            $updateUser = "UPDATE users SET status = 'Active' WHERE id = :id";
            $stmt = $db->prepare($updateUser);
            $stmt->execute([':id' => $data['memberId']]);

            echo json_encode(['success' => true, 'message' => 'Payment processed successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to process payment.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    }
}
?>
