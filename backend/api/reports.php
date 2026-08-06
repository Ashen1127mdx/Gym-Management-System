<?php
/**
 * reports.php  —  Admin Statistics API
 *
 * GET /api/reports.php?month=YYYY-MM
 *   Returns gym-wide stats and monthly revenue for the given month.
 *   Month defaults to the current calendar month.
 *
 * Access: Admin only
 */

require_once __DIR__ . '/header.php';

/* ── Auth guard ─────────────────────────────────────────────────────────── */
if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit();
}

/* ── Ensure payment_log table exists ────────────────────────────────────── */
$db->exec("
    CREATE TABLE IF NOT EXISTS payment_log (
        id             VARCHAR(50)    NOT NULL PRIMARY KEY,
        member_user_id VARCHAR(50)    NOT NULL,
        member_name    VARCHAR(255)   NOT NULL,
        member_fz_id   VARCHAR(50)    NOT NULL,
        plan_name      VARCHAR(100)   NOT NULL,
        amount         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
        payment_month  VARCHAR(7)     NOT NULL,
        notes          TEXT,
        logged_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        logged_by      VARCHAR(50)    NOT NULL
    )
");

$filter = $_GET['date_filter'] ?? '';
$month = date('Y-m'); // Default fallback for reports

// Parse query type
$dateCondition = "payment_month = ?";
$queryParams = [$month];

if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $filter)) {
    $dateCondition = "DATE(logged_at) = ?";
    $queryParams = [$filter];
    $month = $filter;
} elseif (preg_match('/^\d{4}-\d{2}$/', $filter)) {
    $dateCondition = "payment_month = ?";
    $queryParams = [$filter];
    $month = $filter;
} elseif (preg_match('/^\d{4}$/', $filter)) {
    $dateCondition = "DATE_FORMAT(logged_at, '%Y') = ?";
    $queryParams = [$filter];
    $month = $filter;
}

try {

    /* ── Member counts ─────────────────────────────────────────────────── */
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'member'");
    $totalMembers = (int) $stmt->fetchColumn();

    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'member' AND status = 'Active'");
    $activeMembers = (int) $stmt->fetchColumn();

    $stmt = $db->prepare("
        SELECT COUNT(*) FROM users
        WHERE role = 'member'
          AND " . str_replace("logged_at", "created_at", str_replace("payment_month", "DATE_FORMAT(created_at, '%Y-%m')", $dateCondition)) . "
    ");
    $stmt->execute($queryParams);
    $newMembers = (int) $stmt->fetchColumn();

    /* ── Trainer count ─────────────────────────────────────────────────── */
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'trainer'");
    $totalTrainers = (int) $stmt->fetchColumn();

    /* ── Plan count ────────────────────────────────────────────────────── */
    $totalPlans = 0;
    try {
        $stmt   = $db->query("SELECT COUNT(*) FROM membership_plans");
        $totalPlans = (int) $stmt->fetchColumn();
    } catch (Exception $e) { /* table may not exist yet */ }

    /* ── Pending membership requests ───────────────────────────────────── */
    $pendingRequests = 0;
    try {
        $stmt   = $db->query("SELECT COUNT(*) FROM membership_requests WHERE status = 'Pending'");
        $pendingRequests = (int) $stmt->fetchColumn();
    } catch (Exception $e) {}

    /* ── Revenue estimate: active members × their plan price ───────────── */
    $revenueEstimate = 0.0;
    try {
        $stmt = $db->query("
            SELECT COALESCE(SUM(mp.price), 0)
            FROM   members m
            JOIN   membership_plans mp ON mp.name = m.plan
            JOIN   users u             ON u.id    = m.id
            WHERE  u.status = 'Active'
        ");
        $revenueEstimate = (float) $stmt->fetchColumn();
    } catch (Exception $e) {}

    /* ── Attendance check-ins this month ───────────────────────────────── */
    $attendanceCount = 0;
    try {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $filter)) {
            // Filter by exact date
            // Converting from "YYYY-MM-DD" to "M d, Y" format (e.g. "Aug 05, 2026")
            $dObj = DateTime::createFromFormat('Y-m-d', $filter);
            $formattedDate = $dObj ? $dObj->format('M d, Y') : '';
            $stmt = $db->prepare("SELECT COUNT(*) FROM attendance_records WHERE date = ?");
            $stmt->execute([$formattedDate]);
        } elseif (preg_match('/^\d{4}-\d{2}$/', $filter)) {
            // Filter by month
            // Parse using STR_TO_DATE (assuming format like "Aug 05, 2026")
            $stmt = $db->prepare("SELECT COUNT(*) FROM attendance_records WHERE DATE_FORMAT(STR_TO_DATE(date, '%b %d, %Y'), '%Y-%m') = ?");
            $stmt->execute([$filter]);
        } elseif (preg_match('/^\d{4}$/', $filter)) {
            // Filter by year
            $stmt = $db->prepare("SELECT COUNT(*) FROM attendance_records WHERE DATE_FORMAT(STR_TO_DATE(date, '%b %d, %Y'), '%Y') = ?");
            $stmt->execute([$filter]);
        } else {
            // Default to current month
            $stmt = $db->prepare("SELECT COUNT(*) FROM attendance_records WHERE DATE_FORMAT(STR_TO_DATE(date, '%b %d, %Y'), '%Y-%m') = ?");
            $stmt->execute([date('Y-m')]);
        }
        $attendanceCount = (int) $stmt->fetchColumn();
    } catch (Exception $e) {}

    /* ── Physical revenue from payment_log (selected period) ────────────── */
    $stmt = $db->prepare("
        SELECT COALESCE(SUM(amount), 0) AS revenue,
               COUNT(*)                 AS cnt
        FROM payment_log
        WHERE {$dateCondition}
    ");
    $stmt->execute($queryParams);
    $rev = $stmt->fetch(PDO::FETCH_ASSOC);

    /* ── Today's revenue (always current day) ──────────────────────────── */
    $todayRevenue = 0.0;
    $todayPaymentCount = 0;
    try {
        $todayStr = date('Y-m-d');
        $stmt = $db->prepare("
            SELECT COALESCE(SUM(amount), 0) AS revenue, COUNT(*) AS cnt
            FROM payment_log
            WHERE DATE(logged_at) = ?
        ");
        $stmt->execute([$todayStr]);
        $todayRev = $stmt->fetch(PDO::FETCH_ASSOC);
        $todayRevenue      = (float)  $todayRev['revenue'];
        $todayPaymentCount = (int)    $todayRev['cnt'];
    } catch (Exception $e) {}

    /* ── Today's check-in count (always current day) ───────────────────── */
    $todayCheckins = 0;
    try {
        $todayLabel = date('M d, Y'); // e.g. "Aug 06, 2026"
        $stmt = $db->prepare("SELECT COUNT(*) FROM attendance_records WHERE date = ?");
        $stmt->execute([$todayLabel]);
        $todayCheckins = (int) $stmt->fetchColumn();
    } catch (Exception $e) {}

    /* ── Pending-payment members (active, no payment log this calendar month) */
    $pendingPaymentMembers = 0;
    try {
        $curMonth = date('Y-m');
        $stmt = $db->prepare("
            SELECT COUNT(*) FROM users u
            JOIN members m ON u.id = m.id
            WHERE u.role = 'member' AND u.status = 'Active'
              AND u.id NOT IN (
                  SELECT member_user_id FROM payment_log
                  WHERE payment_month = ?
              )
        ");
        $stmt->execute([$curMonth]);
        $pendingPaymentMembers = (int) $stmt->fetchColumn();
    } catch (Exception $e) {}

    /* ── Per-trainer trainee counts ────────────────────────────────────── */
    $trainerMemberCounts = [];
    try {
        $stmt = $db->query("
            SELECT tt.trainer_id, COUNT(tt.member_id) AS member_count
            FROM trainer_trainees tt
            GROUP BY tt.trainer_id
        ");
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $trainerMemberCounts[$row['trainer_id']] = (int) $row['member_count'];
        }
    } catch (Exception $e) {}

    /* ── Response ──────────────────────────────────────────────────────── */
    echo json_encode([
        'month'                   => $month,
        'total_members'           => $totalMembers,
        'active_members'          => $activeMembers,
        'new_members_this_month'  => $newMembers,
        'total_trainers'          => $totalTrainers,
        'total_plans'             => $totalPlans,
        'pending_requests'        => $pendingRequests,
        'attendance_this_month'   => $attendanceCount,
        'revenue_estimate'        => round($revenueEstimate, 2),
        'monthly_revenue'         => round((float) $rev['revenue'], 2),
        'monthly_payment_count'   => (int) $rev['cnt'],
        'today_revenue'           => round($todayRevenue, 2),
        'today_payment_count'     => $todayPaymentCount,
        'today_checkins'          => $todayCheckins,
        'pending_payment_members' => $pendingPaymentMembers,
        'trainer_member_counts'   => $trainerMemberCounts,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
