<?php
require_once __DIR__ . '/header.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit();
}

$user_id = $_SESSION['userId'];

if ($method === 'GET') {
    // Get notifications for logged-in user
    $stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 50");
    $stmt->execute([':user_id' => $user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);

} else if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'mark_read') {
        $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :user_id");
        $ok = $stmt->execute([':user_id' => $user_id]);
        echo json_encode(['success' => $ok]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    }
}
?>
