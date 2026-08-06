<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/Booking.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $trainerId = $_GET['trainerId'] ?? '';
    $memberId = $_GET['memberId'] ?? '';

    if ($trainerId) {
        $bookings = Booking::fetchByTrainer($db, $trainerId);
    } else if ($memberId) {
        $bookings = Booking::fetchByMember($db, $memberId);
    } else {
        $bookings = Booking::fetchAll($db);
    }
    echo json_encode($bookings);
} else if ($method === 'POST') {
    if (!empty($data['memberId']) && !empty($data['classId'])) {
        // Check capacity
        $capacityQuery = "SELECT capacity, (SELECT COUNT(*) FROM bookings WHERE class_id = :class_id AND status != 'Rejected') as current_bookings 
                          FROM gym_classes WHERE class_id = :class_id";
        $stmt = $db->prepare($capacityQuery);
        $stmt->execute([':class_id' => $data['classId']]);
        $classInfo = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($classInfo && $classInfo['current_bookings'] >= $classInfo['capacity']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Class is already at full capacity.']);
            exit();
        }

        $bookingId = 'book-' . uniqid();
        $booking = new Booking(
            $bookingId,
            $data['memberId'],
            $data['classId'],
            'Pending',
            0
        );

        if ($booking->create($db)) {
            echo json_encode(['success' => true, 'message' => 'Booking request submitted. Awaiting trainer approval.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create booking request.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    }
} else if ($method === 'PUT') {
    // Approve or Reject booking
    $bookingId = $_GET['id'] ?? '';
    $status = $data['status'] ?? ''; // Confirmed or Rejected

    if (!$bookingId || !$status) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Booking ID and status are required.']);
        exit();
    }

    if (Booking::updateStatus($db, $bookingId, $status)) {
        echo json_encode(['success' => true, 'message' => "Booking status updated to {$status}."]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update booking status.']);
    }
}
?>
