<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
require_once __DIR__ . '/header.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

// All endpoints require a logged-in member
if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit();
}

$memberId = $_SESSION['userId'];
$action   = $_GET['action'] ?? 'profile';

// ─── GET Profile ─────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'profile') {
    $stmt = $db->prepare(
        "SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
                m.member_id, m.initials, m.nic, m.dob, m.gender,
                m.address, m.emergency_contact, m.plan, m.join_date,
                COALESCE(u.avatar_url, m.avatar_url, '') AS avatar_url
         FROM users u
         JOIN members m ON u.id = m.id
         WHERE u.id = :id LIMIT 1"
    );
    $stmt->execute([':id' => $memberId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Member not found.']);
        exit();
    }

    // Calculate age from dob
    $age = null;
    if (!empty($row['dob'])) {
        $dob = new DateTime($row['dob']);
        $now = new DateTime();
        $age = $now->diff($dob)->y;
    }

    echo json_encode([
        'id'               => $row['id'],
        'member_id'        => $row['member_id'],
        'name'             => $row['name'],
        'email'            => $row['email'],
        'phone'            => $row['phone'],
        'status'           => $row['status'],
        'initials'         => $row['initials'],
        'nic'              => $row['nic'],
        'dob'              => $row['dob'],
        'age'              => $age,
        'gender'           => $row['gender'],
        'address'          => $row['address'],
        'emergency_contact'=> $row['emergency_contact'],
        'plan'             => $row['plan'],
        'join_date'        => $row['join_date'],
        'avatar_url'       => $row['avatar_url'],
        'created_at'       => $row['created_at'],
    ]);

// ─── GET Attendance for this member ──────────────────────────────────────────
} else if ($method === 'GET' && $action === 'attendance') {
    // Get member's FZ member_id first
    $s = $db->prepare("SELECT member_id FROM members WHERE id = :id");
    $s->execute([':id' => $memberId]);
    $fzId = $s->fetchColumn();

    // Get attendance records matching either name or member_id
    $nameStmt = $db->prepare("SELECT name FROM users WHERE id = :id");
    $nameStmt->execute([':id' => $memberId]);
    $memberName = $nameStmt->fetchColumn();

    $stmt = $db->prepare(
        "SELECT 
            ar.id, 
            ar.member_id, 
            COALESCE(u.name, ar.member_name) AS member_name, 
            COALESCE(m.initials, ar.initials) AS initials, 
            ar.time, 
            ar.date, 
            ar.status, 
            COALESCE(m.avatar_url, ar.avatar_url) AS avatar_url, 
            ar.checked_by_role
         FROM attendance_records ar
         LEFT JOIN members m ON ar.member_id = m.member_id
         LEFT JOIN users u ON m.id = u.id
         WHERE (ar.member_id = :fz_id OR ar.member_name LIKE :name)
           AND ar.checked_by_role = 'admin'
         ORDER BY ar.date DESC, ar.time DESC
         LIMIT 50"
    );
    $stmt->execute([':fz_id' => $fzId, ':name' => '%' . $memberName . '%']);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Count DISTINCT days (multiple check-ins same day = 1 day)
    $thisMonth = date('Y-m');
    $daysThisMonth = [];   // unique dates this month
    $allDays       = [];   // unique dates ever
    $lastVisit     = null;

    foreach ($records as $r) {
        if (!isset($r['date'])) continue;
        $ts = strtotime($r['date']);
        if ($ts === false) continue;

        $ymd = date('Y-m-d', $ts);   // normalised unique date key
        $ym  = date('Y-m', $ts);

        $allDays[$ymd] = true;        // deduplicate
        if ($ym === $thisMonth) {
            $daysThisMonth[$ymd] = true;
        }
        if (!$lastVisit) {
            $lastVisit = $r['date'];
        }
    }

    $thisMonthCount = count($daysThisMonth);   // distinct days this month
    $totalDays      = count($allDays);          // distinct days ever

    echo json_encode([
        'records'        => $records,
        'thisMonthCount' => $thisMonthCount,
        'lastVisit'      => $lastVisit,
        'totalVisits'    => count($records),    // total check-in count
    ]);

// ─── GET Workout Plans assigned to this member ────────────────────────────────
} else if ($method === 'GET' && $action === 'workout_plans') {
    // Fetch all plans where the member is mapped in the join table
    $stmt = $db->prepare(
        "SELECT wp.id, wp.trainer_id, wp.plan_name, wp.goal, wp.exercises, wp.created_at
         FROM workout_plans wp
         JOIN workout_plan_members wpm ON wp.id = wpm.plan_id
         WHERE wpm.member_id = :member_id
         ORDER BY wp.created_at DESC"
    );
    $stmt->execute([':member_id' => $memberId]);
    $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($plans);

// ─── GET Scheduled sessions for this member ───────────────────────────────────
} else if ($method === 'GET' && $action === 'sessions') {
    $nameStmt = $db->prepare("SELECT name FROM users WHERE id = :id");
    $nameStmt->execute([':id' => $memberId]);
    $memberName = $nameStmt->fetchColumn();

    $today = date('Y-m-d');
    $nowTime = date('H:i'); // 24-hour format time e.g., "14:30"
    $stmt = $db->prepare(
        "SELECT ts.*, u.name as trainer_name, t.specialization
         FROM trainer_schedule ts
         JOIN users u ON ts.trainer_id = u.id
         LEFT JOIN trainers t ON ts.trainer_id = t.id
         WHERE ts.member_name LIKE :name 
           AND (ts.session_date > :today OR (ts.session_date = :today2 AND ts.session_time >= :now_time))
         ORDER BY ts.session_date ASC, ts.session_time ASC
         LIMIT 10"
    );
    $stmt->execute([
        ':name' => '%' . $memberName . '%', 
        ':today' => $today,
        ':today2' => $today,
        ':now_time' => $nowTime
    ]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sessions);

} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
}
?>
