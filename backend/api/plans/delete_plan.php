<?php
require_once '../../config/db.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_error("Method not allowed", 405);
}

// Accept plan_id via ?plan_id= or JSON body
$plan_id = $_GET['plan_id'] ?? null;
$force = isset($_GET['force']) && $_GET['force'] === 'true';

if (!$plan_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $plan_id = $input['plan_id'] ?? null;
        if (isset($input['force']) && $input['force'] === true) {
            $force = true;
        }
    }
}

if (!$plan_id || !is_numeric($plan_id)) {
    json_error("Valid plan_id is required");
}

try {
    // Check if plan exists
    $checkStmt = $pdo->prepare("SELECT 1 FROM membership_plans WHERE plan_id = ?");
    $checkStmt->execute([$plan_id]);
    if (!$checkStmt->fetchColumn()) {
        json_error("Plan not found", 404);
    }
    
    // Count active members currently on this plan
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM members WHERE plan_id = ? AND status = 'Active'");
    $countStmt->execute([$plan_id]);
    $activeCount = (int)$countStmt->fetchColumn();
    
    if ($activeCount > 0 && !$force) {
        http_response_code(409);
        header('Content-Type: application/json');
        echo json_encode([
            "error" => "$activeCount active member(s) are currently on this plan.",
            "member_count" => $activeCount
        ]);
        exit();
    }
    
    $delStmt = $pdo->prepare("DELETE FROM membership_plans WHERE plan_id = ?");
    $delStmt->execute([$plan_id]);
    
    json_success(["message" => "Plan deleted successfully"]);
} catch (PDOException $e) {
    error_log("Database error in delete_plan: " . $e->getMessage());
    json_error("Database error", 500);
}
