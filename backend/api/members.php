<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/Member.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $query = trim($_GET['q'] ?? '');
    if ($query !== '') {
        $like = "%{$query}%";
        $stmt = $db->prepare(
            "SELECT u.id, u.name, u.email, u.phone, u.status,
                    m.member_id, m.initials, m.nic, m.dob, m.gender,
                    m.address, m.emergency_contact, m.plan, m.join_date,
                    COALESCE(u.avatar_url, m.avatar_url, '') AS avatar_url
             FROM users u JOIN members m ON u.id = m.id
             WHERE u.role = 'member'
               AND (u.name LIKE :q OR m.member_id LIKE :q2)
             ORDER BY u.created_at DESC"
        );
        $stmt->execute([':q' => $like, ':q2' => $like]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $members = array_map(function($row) {
            return [
                'id'               => $row['id'],
                'name'             => $row['name'],
                'email'            => $row['email'],
                'phone'            => $row['phone'],
                'status'           => $row['status'],
                'member_id'        => $row['member_id'],
                'memberId'         => $row['member_id'],
                'initials'         => $row['initials'],
                'nic'              => $row['nic'],
                'dob'              => $row['dob'],
                'gender'           => $row['gender'],
                'address'          => $row['address'],
                'emergencyContact' => $row['emergency_contact'],
                'plan'             => $row['plan'],
                'joinDate'         => $row['join_date'],
                'avatarUrl'        => $row['avatar_url'],
            ];
        }, $rows);
    } else {
        $members = Member::fetchAll($db);
    }
    echo json_encode($members);

} else if ($method === 'PUT') {
    // Update Member — profile fields only. Status is NOT editable here.
    // Status can only change via membership_requests.php (approve/reject)
    // or a dedicated suspend/ban endpoint if you build one later.
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID is required for update.']);
        exit();
    }

    // Fetch existing member so we don't clobber fields the client didn't send,
    // and so we preserve the current status untouched.
    $stmt = $db->prepare(
        "SELECT u.name, u.email, u.phone, u.status, m.member_id, m.initials, m.nic, m.dob, m.gender,
                m.address, m.emergency_contact, m.plan, m.join_date, m.avatar_url
         FROM users u JOIN members m ON u.id = m.id
         WHERE u.id = :id"
    );
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Member not found.']);
        exit();
    }

    $member = new Member(
        $id,
        $data['name'] ?? $existing['name'],
        $data['email'] ?? $existing['email'],
        null,
        $data['phone'] ?? $existing['phone'],
        $data['status'] ?? $existing['status'], // Allow status update
        $existing['member_id'],
        $existing['initials'],
        $data['nic'] ?? $existing['nic'],
        $data['dob'] ?? $existing['dob'],
        $data['gender'] ?? $existing['gender'],
        $data['address'] ?? $existing['address'],
        $data['emergencyContact'] ?? $existing['emergency_contact'],
        $data['plan'] ?? $existing['plan'],
        $existing['join_date'],
        $data['avatarUrl'] ?? $existing['avatar_url']
    );

    if ($member->update($db)) {
        echo json_encode(['success' => true, 'message' => 'Member updated successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update member.']);
    }

} else if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID is required for delete.']);
        exit();
    }

    if (Member::delete($db, $id)) {
        echo json_encode(['success' => true, 'message' => 'Member deleted successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete member.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}
?>