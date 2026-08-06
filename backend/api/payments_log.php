<?php
/**
 * payments_log.php  —  Admin Payment Logger API
 *
 * GET /api/payments_log.php?month=YYYY-MM
 *   Returns all logged payment records for the given month.
 *
 * GET /api/payments_log.php?action=search_member&q=search_query
 *   Searches for members to log payments for.
 *
 * POST /api/payments_log.php
 *   Logs a physical payment.
 *
 * DELETE /api/payments_log.php?id=record_id
 *   Deletes a payment record.
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

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';

        if ($action === 'search_member') {
            $q = trim($_GET['q'] ?? '');
            if ($q === '') {
                echo json_encode([]);
                exit();
            }
            $like = "%{$q}%";
            // Lookup user details along with their current plan price if available
            $stmt = $db->prepare("
                SELECT u.id, u.name, m.member_id AS fz_id, m.plan, mp.price
                FROM users u
                JOIN members m ON u.id = m.id
                LEFT JOIN membership_plans mp ON m.plan = mp.name
                WHERE u.role = 'member' AND (u.name LIKE :q1 OR m.member_id LIKE :q2)
                LIMIT 10
            ");
            $stmt->execute([':q1' => $like, ':q2' => $like]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit();
        }

        // Get filter parameter (can be YYYY-MM-DD, YYYY-MM, or YYYY)
        $filter = $_GET['date_filter'] ?? '';
        
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $filter)) {
            // Full day search
            $stmt = $db->prepare("
                SELECT * FROM payment_log 
                WHERE DATE(logged_at) = ? 
                ORDER BY logged_at DESC
            ");
            $stmt->execute([$filter]);
        } elseif (preg_match('/^\d{4}-\d{2}$/', $filter)) {
            // Month search
            $stmt = $db->prepare("
                SELECT * FROM payment_log 
                WHERE payment_month = ? 
                ORDER BY logged_at DESC
            ");
            $stmt->execute([$filter]);
        } elseif (preg_match('/^\d{4}$/', $filter)) {
            // Year search
            $stmt = $db->prepare("
                SELECT * FROM payment_log 
                WHERE DATE_FORMAT(logged_at, '%Y') = ? 
                ORDER BY logged_at DESC
            ");
            $stmt->execute([$filter]);
        } else {
            // Default to current month
            $month = date('Y-m');
            $stmt = $db->prepare("
                SELECT * FROM payment_log 
                WHERE payment_month = ? 
                ORDER BY logged_at DESC
            ");
            $stmt->execute([$month]);
        }
        
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit();

    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'] ?? '';
        $notes = $data['notes'] ?? '';

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing payment log ID.']);
            exit();
        }

        $stmt = $db->prepare("UPDATE payment_log SET notes = ? WHERE id = ?");
        $success = $stmt->execute([$notes, $id]);

        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Payment log notes updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update payment log notes.']);
        }
        exit();

    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $memberUserId = $data['member_user_id'] ?? '';
        $planName = $data['plan_name'] ?? '';
        $amount = (float)($data['amount'] ?? 0.0);
        $paymentMonth = $data['payment_month'] ?? date('Y-m');
        $notes = $data['notes'] ?? '';

        if (empty($memberUserId) || $amount <= 0 || !preg_match('/^\d{4}-\d{2}$/', $paymentMonth)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid payment data details.']);
            exit();
        }

        // Validate user and fetch details
        $stmt = $db->prepare("
            SELECT u.name, m.member_id 
            FROM users u
            JOIN members m ON u.id = m.id
            WHERE u.id = ? AND u.role = 'member'
        ");
        $stmt->execute([$memberUserId]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$member) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Member not found.']);
            exit();
        }

        $id = 'pay-' . uniqid();
        $loggedBy = $_SESSION['userId'] ?? 'system';

        $stmt = $db->prepare("
            INSERT INTO payment_log (id, member_user_id, member_name, member_fz_id, plan_name, amount, payment_month, notes, logged_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $success = $stmt->execute([
            $id,
            $memberUserId,
            $member['name'],
            $member['member_id'],
            $planName,
            $amount,
            $paymentMonth,
            $notes,
            $loggedBy
        ]);

        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Payment logged successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to record payment.']);
        }
        exit();

    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing ID.']);
            exit();
        }

        $stmt = $db->prepare("DELETE FROM payment_log WHERE id = ?");
        $success = $stmt->execute([$id]);

        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Log entry deleted.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete record.']);
        }
        exit();

    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
        exit();
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
