<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/Attendance.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $attendance = Attendance::fetchAll($db);
    echo json_encode($attendance);
} else if ($method === 'POST') {
    if (!empty($data['memberNameOrId'])) {
        $search = $data['memberNameOrId'];
        
        // Search strictly in users and members tables (Inner Join)
        $query = "SELECT u.id, u.name, u.status, u.role, m.member_id, m.initials,
                         COALESCE(u.avatar_url, m.avatar_url, '') AS avatar_url 
                  FROM users u 
                  JOIN members m ON u.id = m.id 
                  WHERE u.name = :exact_name OR u.name LIKE :search OR m.member_id = :member_id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':exact_name' => $search,
            ':search' => '%' . $search . '%',
            ':member_id' => $search
        ]);
        
        $found = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$found || $found['role'] !== 'member') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Only registered members are allowed to check in.']);
            exit();
        }

        $now = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        $timeString = $now->format('h:i A');
        $dateString = $_GET['date'] ?? $now->format('M d, Y');
        
        $id = 'att-' . uniqid();
        $memberId = $found['member_id'];
        $memberName = $found['name'];
        $initials = !empty($found['initials']) ? $found['initials'] : strtoupper(substr($found['name'], 0, 2));
        
        // Status matching
        $status = 'Active';
        if ($found['status'] === 'Flagged') {
            $status = 'Flagged';
        } else if ($found['status'] === 'Guest') {
            $status = 'Guest';
        }
        
        $avatarUrl = $found['avatar_url'] ?? '';
        $checkedByRole = $data['checked_by_role'] ?? 'admin';

        $attendance = new Attendance(
            $id,
            $memberId,
            $memberName,
            $initials,
            $timeString,
            $dateString,
            $status,
            $avatarUrl,
            $checkedByRole
        );

        if ($attendance->create($db)) {
            if ($found) {
                // Insert notification
                $notifId = 'nt-' . uniqid();
                $nStmt = $db->prepare(
                    "INSERT INTO notifications (id, user_id, title, message, created_at)
                     VALUES (:nid, :uid, :title, :msg, NOW())"
                );
                $nStmt->execute([
                    ':nid'   => $notifId,
                    ':uid'   => $found['id'],
                    ':title' => 'Check-In Successful',
                    ':msg'   => "Successfully checked in to FitZone at {$timeString} on {$dateString}."
                ]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Check-in successful!',
                'record' => [
                    'id' => $id,
                    'memberId' => $memberId,
                    'memberName' => $memberName,
                    'initials' => $initials,
                    'time' => $timeString,
                    'date' => $dateString,
                    'status' => $status,
                    'avatarUrl' => $avatarUrl
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to log check-in.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing member name or ID.']);
    }
}
?>
