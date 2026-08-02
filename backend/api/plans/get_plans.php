<?php
require_once '../../config/db.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error("Method not allowed", 405);
}

try {
    $stmt = $pdo->query("SELECT plan_id, plan_name, price, duration_months, benefits FROM membership_plans");
    $plans = $stmt->fetchAll();

    $memberCountStmt = $pdo->prepare("SELECT COUNT(*) FROM members WHERE plan_id = ?");
    
    $maxCount = -1;
    
    foreach ($plans as &$plan) {
        $memberCountStmt->execute([$plan['plan_id']]);
        $count = (int)$memberCountStmt->fetchColumn();
        $plan['member_count'] = $count;
        $plan['price'] = (float)$plan['price'];
        $plan['duration_months'] = (int)$plan['duration_months'];
        
        $benefits_raw = $plan['benefits'];
        if ($benefits_raw) {
            $plan['benefits'] = array_map('trim', explode(',', $benefits_raw));
        } else {
            $plan['benefits'] = [];
        }
        
        if ($count > $maxCount) {
            $maxCount = $count;
        }
    }
    unset($plan);
    
    foreach ($plans as &$plan) {
        $plan['most_popular'] = ($plan['member_count'] === $maxCount && $maxCount > 0);
    }
    unset($plan);
    
    json_success($plans);
} catch (PDOException $e) {
    error_log("Database error in get_plans: " . $e->getMessage());
    json_error("Database error", 500);
}
