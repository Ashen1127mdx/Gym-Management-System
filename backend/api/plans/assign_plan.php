<?php
require_once '../../config/db.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    json_error("Invalid JSON input");
}

$member_id = $input['member_id'] ?? null;
$plan_id = $input['plan_id'] ?? null;

if (!$member_id || !is_numeric($member_id)) {
    json_error("Valid member_id is required");
}

if (!$plan_id || !is_numeric($plan_id)) {
    json_error("Valid plan_id is required");
}

try {
    // Validate member
    $memberStmt = $pdo->prepare("SELECT 1 FROM members WHERE member_id = ?");
    $memberStmt->execute([$member_id]);
    if (!$memberStmt->fetchColumn()) {
        json_error("Member not found", 404);
    }
    
    // Validate plan
    $planStmt = $pdo->prepare("SELECT 1 FROM membership_plans WHERE plan_id = ?");
    $planStmt->execute([$plan_id]);
    if (!$planStmt->fetchColumn()) {
        json_error("Plan not found", 404);
    }
    
    // Assign
    $updateStmt = $pdo->prepare("UPDATE members SET plan_id = ? WHERE member_id = ?");
    $updateStmt->execute([$plan_id, $member_id]);
    
    json_success(["message" => "Plan assigned successfully"]);
} catch (PDOException $e) {
    error_log("Database error in assign_plan: " . $e->getMessage());
    json_error("Database error", 500);
}
