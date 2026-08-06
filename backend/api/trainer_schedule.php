<?php
require_once __DIR__ . '/header.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $trainer_id = $_GET['trainer_id'] ?? null;
    $today = date('Y-m-d');
    $nowTime = date('H:i');
    if ($trainer_id) {
        $stmt = $db->prepare(
            "SELECT ts.id, ts.trainer_id, ts.session_date, ts.session_time, 
                    COALESCE(u.name, ts.member_name) AS member_name, 
                    ts.session_type, ts.created_at
             FROM trainer_schedule ts
             LEFT JOIN users u ON u.name = ts.member_name AND u.role = 'member'
             WHERE ts.trainer_id = :trainer_id 
               AND (ts.session_date > :today OR (ts.session_date = :today2 AND ts.session_time >= :now_time))
             ORDER BY ts.session_date ASC, ts.session_time ASC"
        );
        $stmt->execute([
            ':trainer_id' => $trainer_id,
            ':today' => $today,
            ':today2' => $today,
            ':now_time' => $nowTime
        ]);
    } else {
        $stmt = $db->prepare(
            "SELECT ts.id, ts.trainer_id, ts.session_date, ts.session_time, 
                    COALESCE(u.name, ts.member_name) AS member_name, 
                    ts.session_type, ts.created_at
             FROM trainer_schedule ts
             LEFT JOIN users u ON u.name = ts.member_name AND u.role = 'member'
             WHERE (ts.session_date > :today OR (ts.session_date = :today2 AND ts.session_time >= :now_time))
             ORDER BY ts.session_date ASC, ts.session_time ASC"
        );
        $stmt->execute([
            ':today' => $today,
            ':today2' => $today,
            ':now_time' => $nowTime
        ]);
    }
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);

} else if ($method === 'POST') {
    if (!empty($data['trainer_id']) && !empty($data['session_time']) && !empty($data['member_name'])) {
        $id = 'sch-' . uniqid();
        $stmt = $db->prepare(
            "INSERT INTO trainer_schedule (id, trainer_id, session_date, session_time, member_name, session_type, created_at)
             VALUES (:id, :trainer_id, :session_date, :session_time, :member_name, :session_type, NOW())"
        );
        $ok = $stmt->execute([
            ':id'           => $id,
            ':trainer_id'   => $data['trainer_id'],
            ':session_date' => $data['session_date'] ?? date('Y-m-d'),
            ':session_time' => $data['session_time'],
            ':member_name'  => $data['member_name'],
            ':session_type' => $data['session_type'] ?? 'General Training',
        ]);
        if ($ok) {
            // Find member user id by name
            $memStmt = $db->prepare("SELECT id FROM users WHERE name = :name AND role = 'member' LIMIT 1");
            $memStmt->execute([':name' => $data['member_name']]);
            $memberUserId = $memStmt->fetchColumn();

            if ($memberUserId) {
                // Find Trainer name
                $trStmt = $db->prepare("SELECT name FROM users WHERE id = :tid");
                $trStmt->execute([':tid' => $data['trainer_id']]);
                $trainerName = $trStmt->fetchColumn() ?: 'Trainer';

                // Insert notification
                $notifId = 'nt-' . uniqid();
                $nStmt = $db->prepare(
                    "INSERT INTO notifications (id, user_id, title, message, created_at)
                     VALUES (:nid, :uid, :title, :msg, NOW())"
                );
                $sessionDate = $data['session_date'] ?? date('Y-m-d');
                $nStmt->execute([
                    ':nid'   => $notifId,
                    ':uid'   => $memberUserId,
                    ':title' => 'New Training Session Scheduled',
                    ':msg'   => "Coach {$trainerName} scheduled a {$data['session_type']} session with you for {$sessionDate} at {$data['session_time']}."
                ]);
            }

            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Session scheduled.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to schedule session.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    }

} else if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID required.']);
        exit();
    }
    $stmt = $db->prepare("DELETE FROM trainer_schedule WHERE id = :id");
    if ($stmt->execute([':id' => $id])) {
        echo json_encode(['success' => true, 'message' => 'Session removed.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to remove session.']);
    }
}
?>
