<?php
require_once __DIR__ . '/header.php';

$method = $_SERVER['REQUEST_METHOD'];
$data   = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit();
}

$userId = $_SESSION['userId'];
$role   = $_SESSION['role'];

// Auto-create table if not exists
$db->exec("CREATE TABLE IF NOT EXISTS membership_requests (
    id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    current_plan VARCHAR(100),
    requested_plan VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at DATETIME NOT NULL,
    processed_at DATETIME NULL
)");

// ─── GET: member fetches their own requests ─────────────────────────────────
if ($method === 'GET') {
    if ($role === 'member') {
        $stmt = $db->prepare(
            "SELECT mr.id, mr.member_id, u.name AS member_name, mr.current_plan, mr.requested_plan, mr.status, mr.created_at, mr.processed_at
             FROM membership_requests mr
             JOIN users u ON mr.member_id = u.id
             WHERE mr.member_id = :uid 
             ORDER BY mr.created_at DESC"
        );
        $stmt->execute([':uid' => $userId]);
    } else {
        // admin/trainer — fetch all
        $stmt = $db->prepare(
            "SELECT mr.id, mr.member_id, u.name AS member_name, mr.current_plan, mr.requested_plan, mr.status, mr.created_at, mr.processed_at
             FROM membership_requests mr
             JOIN users u ON mr.member_id = u.id
             ORDER BY mr.created_at DESC"
        );
        $stmt->execute();
    }
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

// ─── POST: member submits a plan change request ─────────────────────────────
} else if ($method === 'POST') {
    $action = $_GET['action'] ?? '';

    if ($role === 'member') {
        $requestedPlan = $data['requested_plan'] ?? '';
        if (empty($requestedPlan)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Requested plan is required.']);
            exit();
        }

        // Fetch member's current plan and name
        $stmt = $db->prepare(
            "SELECT u.name, m.plan FROM users u JOIN members m ON u.id = m.id WHERE u.id = :uid"
        );
        $stmt->execute([':uid' => $userId]);
        $memberRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$memberRow) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Member profile not found.']);
            exit();
        }

        $currentPlan = $memberRow['plan'];
        $memberName  = $memberRow['name'];

        if ($currentPlan === $requestedPlan) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'You are already on this membership plan.']);
            exit();
        }

        // Check if there is already a Pending request
        $checkStmt = $db->prepare(
            "SELECT id FROM membership_requests WHERE member_id = :uid AND status = 'Pending' LIMIT 1"
        );
        $checkStmt->execute([':uid' => $userId]);
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'You already have a pending plan request. Please wait for admin approval.']);
            exit();
        }

        // Insert request
        $id = 'mreq-' . uniqid();
        $insStmt = $db->prepare(
            "INSERT INTO membership_requests (id, member_id, member_name, current_plan, requested_plan, status, created_at)
             VALUES (:id, :uid, :name, :current, :requested, 'Pending', NOW())"
        );
        $ok = $insStmt->execute([
            ':id'       => $id,
            ':uid'      => $userId,
            ':name'     => $memberName,
            ':current'  => $currentPlan,
            ':requested'=> $requestedPlan,
        ]);

        if ($ok) {
            // Notify member
            $notifId = 'nt-' . uniqid();
            $nStmt = $db->prepare(
                "INSERT INTO notifications (id, user_id, title, message, created_at)
                 VALUES (:nid, :uid, :title, :msg, NOW())"
            );
            $nStmt->execute([
                ':nid'   => $notifId,
                ':uid'   => $userId,
                ':title' => 'Membership Plan Request Submitted',
                ':msg'   => "Your request to change from '{$currentPlan}' to '{$requestedPlan}' has been submitted. Please visit the front desk to complete payment. Membership will be activated upon admin approval."
            ]);

            // Notify all admins
            $adminsStmt = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
            $adminsStmt->execute();
            $admins = $adminsStmt->fetchAll(PDO::FETCH_COLUMN);
            foreach ($admins as $adminId) {
                $aNid = 'nt-' . uniqid();
                $anStmt = $db->prepare(
                    "INSERT INTO notifications (id, user_id, title, message, created_at)
                     VALUES (:nid, :uid, :title, :msg, NOW())"
                );
                $anStmt->execute([
                    ':nid'   => $aNid,
                    ':uid'   => $adminId,
                    ':title' => 'New Membership Plan Request',
                    ':msg'   => "{$memberName} has requested a plan change from '{$currentPlan}' to '{$requestedPlan}'. Please review after confirming physical payment."
                ]);
            }

            echo json_encode(['success' => true, 'message' => 'Plan request submitted successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to submit request.']);
        }

    } else if ($role === 'admin') {
        $reqId = $data['request_id'] ?? '';
        if (!$reqId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Request ID is required.']);
            exit();
        }

        // Fetch request info
        $stmt = $db->prepare("SELECT * FROM membership_requests WHERE id = :id");
        $stmt->execute([':id' => $reqId]);
        $req = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$req) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Request not found.']);
            exit();
        }

        if ($action === 'approve') {
            // Update request
            $upReq = $db->prepare("UPDATE membership_requests SET status = 'Approved', processed_at = NOW() WHERE id = :id");
            $upReq->execute([':id' => $reqId]);

            // Update member's plan & calculate expiration date
            $bcStmt = $db->prepare("SELECT billing_cycle FROM membership_plans WHERE name = :plan LIMIT 1");
            $bcStmt->execute([':plan' => $req['requested_plan']]);
            $billingCycle = $bcStmt->fetchColumn() ?: 'Monthly';
            $expiresAt = calculateExpirationDate($billingCycle);

            $upMem = $db->prepare("UPDATE members SET plan = :plan, plan_expires_at = :expires_at WHERE id = :mid");
            $upMem->execute([
                ':plan' => $req['requested_plan'],
                ':expires_at' => $expiresAt,
                ':mid' => $req['member_id']
            ]);

            // Update user status to 'Active' in users table
            $upUser = $db->prepare("UPDATE users SET status = 'Active' WHERE id = :mid");
            $upUser->execute([':mid' => $req['member_id']]);

            // Automatically insert an entry into payment_log
            // Fetch the plan price
            $pStmt = $db->prepare("SELECT price FROM membership_plans WHERE name = :plan LIMIT 1");
            $pStmt->execute([':plan' => $req['requested_plan']]);
            $planPrice = (float)($pStmt->fetchColumn() ?: 0.00);

            // Fetch member's FZ ID
            $mStmt = $db->prepare("SELECT member_id FROM members WHERE id = :mid LIMIT 1");
            $mStmt->execute([':mid' => $req['member_id']]);
            $fzId = $mStmt->fetchColumn() ?: '#FZ-UNKNOWN';

            // Auto-create table if missing
            $db->exec("CREATE TABLE IF NOT EXISTS payment_log (
                id VARCHAR(50) PRIMARY KEY,
                member_user_id VARCHAR(50) NOT NULL,
                member_name VARCHAR(255) NOT NULL,
                member_fz_id VARCHAR(50) NOT NULL,
                plan_name VARCHAR(100) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_month VARCHAR(20) NOT NULL,
                notes TEXT,
                logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                logged_by VARCHAR(50) NOT NULL
            )");

            $plogId = 'plog-' . uniqid();
            $currentMonth = date('Y-m');
            $insLog = $db->prepare("
                INSERT INTO payment_log
                    (id, member_user_id, member_name, member_fz_id, plan_name, amount, payment_month, notes, logged_at, logged_by)
                VALUES
                    (:id, :uid, :name, :fzid, :plan, :amount, :month, 'Approved plan request', NOW(), :by)
            ");
            $insLog->execute([
                ':id'     => $plogId,
                ':uid'    => $req['member_id'],
                ':name'   => $req['member_name'],
                ':fzid'   => $fzId,
                ':plan'   => $req['requested_plan'],
                ':amount' => $planPrice,
                ':month'  => $currentMonth,
                ':by'     => $_SESSION['userId']
            ]);

            // Notify member
            $notifId = 'nt-' . uniqid();
            $nStmt = $db->prepare("INSERT INTO notifications (id, user_id, title, message, created_at) VALUES (:nid, :uid, :title, :msg, NOW())");
            $nStmt->execute([
                ':nid'   => $notifId,
                ':uid'   => $req['member_id'],
                ':title' => 'Membership Upgraded & Paid!',
                ':msg'   => "Your request to switch to '{$req['requested_plan']}' has been approved by admin. A payment of LKR {$planPrice} has been logged."
            ]);

            // Fetch updated status for response
            $statusStmt = $db->prepare("SELECT status FROM users WHERE id = :uid");
            $statusStmt->execute([':uid' => $req['member_id']]);
            $updatedStatus = $statusStmt->fetchColumn();

            echo json_encode([
                'success' => true,
                'message' => 'Request approved and payment logged successfully.',
                'status'  => $updatedStatus
            ]);

        } else if ($action === 'reject') {
            // Update request
            $upReq = $db->prepare("UPDATE membership_requests SET status = 'Rejected', processed_at = NOW() WHERE id = :id");
            $upReq->execute([':id' => $reqId]);

            // Notify member
            $notifId = 'nt-' . uniqid();
            $nStmt = $db->prepare("INSERT INTO notifications (id, user_id, title, message, created_at) VALUES (:nid, :uid, :title, :msg, NOW())");
            $nStmt->execute([
                ':nid'   => $notifId,
                ':uid'   => $req['member_id'],
                ':title' => 'Membership Plan Request Rejected',
                ':msg'   => "Your request to change to '{$req['requested_plan']}' was rejected. Please contact the front desk for details."
            ]);

            echo json_encode(['success' => true, 'message' => 'Request rejected.']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action.']);
        }
    }

// ─── DELETE: member cancels their own pending request ──────────────────────
} else if ($method === 'DELETE' && $role === 'member') {
    $reqId = $_GET['id'] ?? '';
    if (!$reqId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Request ID required.']);
        exit();
    }

    $stmt = $db->prepare(
        "DELETE FROM membership_requests WHERE id = :id AND member_id = :uid AND status = 'Pending'"
    );
    $ok = $stmt->execute([':id' => $reqId, ':uid' => $userId]);
    if ($ok && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Request cancelled.']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cannot cancel this request.']);
    }

} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}
?>
