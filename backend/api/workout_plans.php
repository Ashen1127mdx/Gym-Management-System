<?php
require_once __DIR__ . '/header.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    // Optionally filter by trainer_id
    $trainer_id = $_GET['trainer_id'] ?? null;
    if ($trainer_id) {
        $stmt = $db->prepare("SELECT * FROM workout_plans WHERE trainer_id = :trainer_id ORDER BY created_at DESC");
        $stmt->execute([':trainer_id' => $trainer_id]);
    } else {
        $stmt = $db->prepare("SELECT * FROM workout_plans ORDER BY created_at DESC");
        $stmt->execute();
    }
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each plan, fetch all mapped members (joins users table to get live updated names)
    foreach ($rows as &$row) {
        $mStmt = $db->prepare(
            "SELECT wpm.member_id, u.name AS member_name 
             FROM workout_plan_members wpm
             JOIN users u ON wpm.member_id = u.id
             WHERE wpm.plan_id = :plan_id"
        );
        $mStmt->execute([':plan_id' => $row['id']]);
        $row['members'] = $mStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    echo json_encode($rows);

} else if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    
    // Edit existing plan (modify info + update member mappings)
    if ($action === 'update') {
        $id = $data['id'] ?? '';
        if (empty($id) || empty($data['plan_name']) || empty($data['goal'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields for update.']);
            exit();
        }
        
        $stmt = $db->prepare("UPDATE workout_plans SET plan_name = :plan_name, goal = :goal, exercises = :exercises WHERE id = :id");
        $ok = $stmt->execute([
            ':id'        => $id,
            ':plan_name' => $data['plan_name'],
            ':goal'      => $data['goal'],
            ':exercises' => $data['exercises'] ?? ''
        ]);
        
        if ($ok) {
            // Update members join table if provided
            if (isset($data['members']) && is_array($data['members'])) {
                // Delete old mappings
                $del = $db->prepare("DELETE FROM workout_plan_members WHERE plan_id = :plan_id");
                $del->execute([':plan_id' => $id]);
                
                // Get trainer name
                $trId = $data['trainer_id'] ?? '';
                $trStmt = $db->prepare("SELECT name FROM users WHERE id = :tid");
                $trStmt->execute([':tid' => $trId]);
                $trainerName = $trStmt->fetchColumn() ?: 'Trainer';

                // Insert new mappings
                $ins = $db->prepare("INSERT INTO workout_plan_members (plan_id, member_id, member_name) VALUES (:plan_id, :member_id, :member_name)");
                foreach ($data['members'] as $m) {
                    $ins->execute([
                        ':plan_id'     => $id,
                        ':member_id'   => $m['member_id'],
                        ':member_name' => $m['member_name']
                    ]);
                    
                    // Insert notification for the mapped member
                    $notifId = 'nt-' . uniqid();
                    $nStmt = $db->prepare("INSERT INTO notifications (id, user_id, title, message, created_at) VALUES (:nid, :uid, :title, :msg, NOW())");
                    $nStmt->execute([
                        ':nid'   => $notifId,
                        ':uid'   => $m['member_id'],
                        ':title' => 'Workout Plan Updated',
                        ':msg'   => "Coach {$trainerName} updated your assigned workout plan: {$data['plan_name']} (Goal: {$data['goal']})."
                    ]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'Workout plan updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update workout plan.']);
        }
        exit();
    }

    // Create a new workout plan (with multiple members)
    if (!empty($data['members']) && is_array($data['members']) && !empty($data['plan_name']) && !empty($data['goal']) && !empty($data['trainer_id'])) {
        $id = 'wp-' . uniqid();
        
        // Insert base workout plan (leave legacy columns populated with the first member for backward compatibility)
        $firstMember = $data['members'][0];
        $stmt = $db->prepare(
            "INSERT INTO workout_plans (id, trainer_id, member_id, member_name, plan_name, goal, exercises, created_at)
             VALUES (:id, :trainer_id, :member_id, :member_name, :plan_name, :goal, :exercises, NOW())"
        );
        $ok = $stmt->execute([
            ':id'          => $id,
            ':trainer_id'  => $data['trainer_id'],
            ':member_id'   => $firstMember['member_id'],
            ':member_name' => $firstMember['member_name'],
            ':plan_name'   => $data['plan_name'],
            ':goal'        => $data['goal'],
            ':exercises'   => $data['exercises'] ?? '',
        ]);
        
        if ($ok) {
            // Get Trainer name
            $trStmt = $db->prepare("SELECT name FROM users WHERE id = :tid");
            $trStmt->execute([':tid' => $data['trainer_id']]);
            $trainerName = $trStmt->fetchColumn() ?: 'Trainer';

            // Insert into join table
            $ins = $db->prepare("INSERT INTO workout_plan_members (plan_id, member_id, member_name) VALUES (:plan_id, :member_id, :member_name)");
            foreach ($data['members'] as $m) {
                $ins->execute([
                    ':plan_id'     => $id,
                    ':member_id'   => $m['member_id'],
                    ':member_name' => $m['member_name']
                ]);

                // Insert notification
                $notifId = 'nt-' . uniqid();
                $nStmt = $db->prepare(
                    "INSERT INTO notifications (id, user_id, title, message, created_at)
                     VALUES (:nid, :uid, :title, :msg, NOW())"
                );
                $nStmt->execute([
                    ':nid'   => $notifId,
                    ':uid'   => $m['member_id'],
                    ':title' => 'New Workout Plan Assigned',
                    ':msg'   => "Coach {$trainerName} assigned a new workout plan: {$data['plan_name']} (Goal: {$data['goal']})."
                ]);
            }

            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Workout plan created.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create workout plan.']);
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
    
    // Delete base plan (foreign key cascading will clear workout_plan_members)
    $stmt = $db->prepare("DELETE FROM workout_plans WHERE id = :id");
    if ($stmt->execute([':id' => $id])) {
        echo json_encode(['success' => true, 'message' => 'Workout plan deleted.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete workout plan.']);
    }
}
?>
