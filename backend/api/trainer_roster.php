<?php
require_once __DIR__ . '/header.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['userId']) || $_SESSION['role'] !== 'trainer') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authorized. Trainer login required.']);
    exit();
}

$trainer_id = $_SESSION['userId'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        // Fetch all trainees in this trainer's roster
        $stmt = $db->prepare(
            "SELECT u.id, u.name, u.email, u.phone, u.status, m.member_id, m.initials, m.gender, m.plan,
                    COALESCE(u.avatar_url, m.avatar_url, '') AS avatar_url
             FROM users u
             JOIN members m ON u.id = m.id
             JOIN trainer_trainees tt ON u.id = tt.member_id
             WHERE tt.trainer_id = :trainer_id AND u.status = 'Active'
             ORDER BY u.name ASC"
        );
        $stmt->execute([':trainer_id' => $trainer_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);

    } else if ($action === 'search_global') {
        // Search globally for active members NOT in this trainer's roster
        $q = $_GET['q'] ?? '';
        if (strlen($q) < 1) {
            echo json_encode([]);
            exit();
        }

        $stmt = $db->prepare(
            "SELECT u.id, u.name, u.email, m.member_id
             FROM users u
             JOIN members m ON u.id = m.id
             WHERE u.role = 'member' 
               AND u.status = 'Active'
               AND (u.name LIKE :query OR m.member_id LIKE :query)
               AND u.id NOT IN (SELECT member_id FROM trainer_trainees WHERE trainer_id = :trainer_id)
             LIMIT 15"
        );
        $stmt->execute([
            ':query'      => '%' . $q . '%',
            ':trainer_id' => $trainer_id
        ]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
    }

} else if ($method === 'POST') {
    // Add member to roster
    if (!empty($data['member_id'])) {
        $member_id = $data['member_id'];

        // Verify member exists and is active
        $check = $db->prepare("SELECT id FROM users WHERE id = :mid AND role = 'member' AND status = 'Active'");
        $check->execute([':mid' => $member_id]);
        if ($check->rowCount() === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Active member not found.']);
            exit();
        }

        // Insert into roster
        $stmt = $db->prepare("INSERT IGNORE INTO trainer_trainees (trainer_id, member_id) VALUES (:tid, :mid)");
        $ok = $stmt->execute([
            ':tid' => $trainer_id,
            ':mid' => $member_id
        ]);

        if ($ok) {
            // Log notification for the member
            // Find trainer name
            $trStmt = $db->prepare("SELECT name FROM users WHERE id = :tid");
            $trStmt->execute([':tid' => $trainer_id]);
            $trainerName = $trStmt->fetchColumn() ?: 'Trainer';

            $notifId = 'nt-' . uniqid();
            $nStmt = $db->prepare(
                "INSERT INTO notifications (id, user_id, title, message, created_at)
                 VALUES (:nid, :uid, :title, :msg, NOW())"
            );
            $nStmt->execute([
                ':nid'   => $notifId,
                ':uid'   => $member_id,
                ':title' => 'Assigned to Roster',
                ':msg'   => "Coach {$trainerName} has added you to their trainee list."
            ]);

            echo json_encode(['success' => true, 'message' => 'Trainee added to roster.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add trainee.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing member_id.']);
    }

} else if ($method === 'DELETE') {
    // Remove member from roster
    $member_id = $_GET['member_id'] ?? '';
    if (!$member_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing member_id.']);
        exit();
    }

    $stmt = $db->prepare("DELETE FROM trainer_trainees WHERE trainer_id = :tid AND member_id = :mid");
    $ok = $stmt->execute([
        ':tid' => $trainer_id,
        ':mid' => $member_id
    ]);

    if ($ok) {
        echo json_encode(['success' => true, 'message' => 'Trainee removed from roster.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to remove trainee.']);
    }
}
?>
