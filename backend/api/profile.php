<?php
/**
 * profile.php  —  Unified Profile Management API
 *
 * GET  /api/profile.php           → fetch full profile for logged-in user
 * PUT  /api/profile.php           → update profile details / password / avatar
 * DELETE /api/profile.php         → permanently delete account (member / trainer only)
 *
 * Access: authenticated users only (admin, member, trainer)
 */

require_once __DIR__ . '/header.php';

/* ── Auth guard ─────────────────────────────────────────────────────────── */
if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit();
}

$userId = $_SESSION['userId'];
$role   = $_SESSION['role'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ════════════════════════════════════════════════════════════════════════
   GET — fetch profile
   ════════════════════════════════════════════════════════════════════════ */
if ($method === 'GET') {
    // Base user row (name, email, phone, avatarUrl live in users table)
    $stmt = $db->prepare(
        "SELECT id, name, email, phone, role, status, avatar_url, created_at
         FROM users WHERE id = ? LIMIT 1"
    );
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        exit();
    }

    // Defaults
    $user['specialization']  = '';
    $user['role_title']      = '';
    $user['member_id']       = '';
    $user['nic']             = '';
    $user['dob']             = '';
    $user['gender']          = '';
    $user['address']         = '';
    $user['emergency_contact'] = '';
    $user['plan']            = '';
    $user['join_date']       = '';

    if ($role === 'member') {
        $stmt = $db->prepare(
            "SELECT member_id, initials, nic, dob, gender, address,
                    emergency_contact, plan, join_date
             FROM members WHERE id = ? LIMIT 1"
        );
        $stmt->execute([$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $user['member_id']        = $row['member_id']       ?? '';
            $user['nic']              = $row['nic']              ?? '';
            $user['dob']              = $row['dob']              ?? '';
            $user['gender']           = $row['gender']           ?? '';
            $user['address']          = $row['address']          ?? '';
            $user['emergency_contact']= $row['emergency_contact']?? '';
            $user['plan']             = $row['plan']             ?? '';
            $user['join_date']        = $row['join_date']        ?? '';
        }

    } elseif ($role === 'trainer') {
        $stmt = $db->prepare(
            "SELECT specialization, role_title
             FROM trainers WHERE id = ? LIMIT 1"
        );
        $stmt->execute([$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $user['specialization'] = $row['specialization'] ?? '';
            $user['role_title']     = $row['role_title']     ?? '';
        }
    }

    echo json_encode(['success' => true, 'profile' => $user]);
    exit();
}

/* ════════════════════════════════════════════════════════════════════════
   PUT — update profile
   ════════════════════════════════════════════════════════════════════════ */
if ($method === 'PUT') {
    $data           = json_decode(file_get_contents("php://input"), true) ?? [];
    $name           = trim($data['name']           ?? '');
    $email          = trim($data['email']          ?? '');
    $phone          = trim($data['phone']          ?? '');
    $avatarUrl      = $data['avatar_url']           ?? '';   // may be Base64 or empty
    $newPassword    = trim($data['new_password']   ?? '');
    $curPassword    = trim($data['current_password'] ?? '');
    $address        = trim($data['address']        ?? '');
    $emergencyContact = trim($data['emergency_contact'] ?? '');

    /* ── Basic validation ─────────────────────────────────────────────── */
    if (empty($name) || empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Name and email are required.']);
        exit();
    }

    // Email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email address format.']);
        exit();
    }

    // Phone: exactly 10 digits (strip non-digits first)
    $cleanPhone = preg_replace('/\D/', '', $phone);
    if (!empty($cleanPhone) && strlen($cleanPhone) !== 10) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Phone number must be exactly 10 digits.']);
        exit();
    }

    // Email uniqueness
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetchColumn()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This email is already used by another account.']);
        exit();
    }

    /* ── Password change ──────────────────────────────────────────────── */
    $newHash = null;
    if (!empty($newPassword)) {
        if (empty($curPassword)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Current password is required to set a new password.']);
            exit();
        }
        $stmt = $db->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $storedHash = $stmt->fetchColumn();
        if (!$storedHash || !password_verify($curPassword, $storedHash)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
            exit();
        }
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    }

    // Get the old name BEFORE updating users table
    $oldNameStmt = $db->prepare("SELECT name FROM users WHERE id = ?");
    $oldNameStmt->execute([$userId]);
    $oldName = $oldNameStmt->fetchColumn();

    /* ── Update `users` table (name, email, phone, avatar_url live here) ─────────── */
    $db->beginTransaction();
    try {
        if ($newHash) {
            $stmt = $db->prepare(
                "UPDATE users SET name = ?, email = ?, phone = ?, password = ?, avatar_url = ? WHERE id = ?"
            );
            $stmt->execute([$name, $email, $cleanPhone ?: $phone, $newHash, $avatarUrl, $userId]);
        } else {
            $stmt = $db->prepare(
                "UPDATE users SET name = ?, email = ?, phone = ?, avatar_url = ? WHERE id = ?"
            );
            $stmt->execute([$name, $email, $cleanPhone ?: $phone, $avatarUrl, $userId]);
        }

        if ($role === 'member') {

            // Recompute initials from the new name
            $nameParts = preg_split('/\s+/', trim($name));
            $newInitials = '';
            foreach ($nameParts as $part) {
                if (!empty($part)) $newInitials .= strtoupper($part[0]);
                if (strlen($newInitials) >= 2) break;
            }

            // members table: update avatar_url, initials, address, emergency_contact
            $stmt = $db->prepare("UPDATE members SET avatar_url = ?, initials = ?, address = ?, emergency_contact = ? WHERE id = ?");
            $stmt->execute([$avatarUrl, $newInitials, $address, $emergencyContact, $userId]);

            // Sync scheduled sessions with the new name if changed
            if ($oldName && $oldName !== $name) {
                $syncSch = $db->prepare("UPDATE trainer_schedule SET member_name = ? WHERE member_name = ?");
                $syncSch->execute([$name, $oldName]);
            }

        } elseif ($role === 'trainer') {
            // trainers table: avatar_url only (specialization no longer editable)
            $stmt = $db->prepare(
                "UPDATE trainers SET avatar_url = ? WHERE id = ?"
            );
            $stmt->execute([$avatarUrl, $userId]);
        }
        // admin: only `users` table update above (no role table row)

        $db->commit();

        // Refresh session name so header reflects immediately
        $_SESSION['name'] = $name;

        echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Update failed: ' . $e->getMessage()]);
    }
    exit();
}

/* ════════════════════════════════════════════════════════════════════════
   DELETE — permanently remove account
   ════════════════════════════════════════════════════════════════════════ */
if ($method === 'DELETE') {
    if ($role === 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin accounts cannot be deleted.']);
        exit();
    }

    $db->beginTransaction();
    try {
        if ($role === 'member') {
            // Get the FZ member_id used in attendance_records
            $stmt = $db->prepare("SELECT member_id FROM members WHERE id = ?");
            $stmt->execute([$userId]);
            $fzId = $stmt->fetchColumn();

            if ($fzId) {
                $stmt = $db->prepare("DELETE FROM attendance_records WHERE member_id = ?");
                $stmt->execute([$fzId]);
            }

            // Delete by member_name in trainer_schedule
            $stmt = $db->prepare("SELECT name FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $memberName = $stmt->fetchColumn();
            if ($memberName) {
                $stmt = $db->prepare("DELETE FROM trainer_schedule WHERE member_name = ?");
                $stmt->execute([$memberName]);
            }

            foreach ([
                "DELETE FROM membership_requests WHERE member_id = ?",
                "DELETE FROM payment_log WHERE member_user_id = ?",
                "DELETE FROM workout_plans WHERE member_id = ?",
                "DELETE FROM notifications WHERE user_id = ?",
                "DELETE FROM members WHERE id = ?",
            ] as $sql) {
                $stmt = $db->prepare($sql);
                $stmt->execute([$userId]);
            }

        } elseif ($role === 'trainer') {
            foreach ([
                "DELETE FROM trainer_schedule WHERE trainer_id = ?",
                "DELETE FROM workout_plans WHERE trainer_id = ?",
                "DELETE FROM notifications WHERE user_id = ?",
                "DELETE FROM trainers WHERE id = ?",
            ] as $sql) {
                $stmt = $db->prepare($sql);
                $stmt->execute([$userId]);
            }
        }

        // Remove from users
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        $db->commit();

        // Destroy PHP session (log out)
        session_unset();
        session_destroy();

        echo json_encode(['success' => true, 'message' => 'Account permanently deleted.']);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Deletion failed: ' . $e->getMessage()]);
    }
    exit();
}

/* ── Method not allowed ─────────────────────────────────────────────────── */
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
?>
