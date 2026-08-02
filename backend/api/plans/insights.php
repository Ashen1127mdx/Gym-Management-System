<?php
require_once '../../config/db.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error("Method not allowed", 405);
}

try {
    // a) average_lifetime_value
    $alvStmt = $pdo->query("
        SELECT COALESCE(AVG(member_total), 0) AS average_lifetime_value
        FROM (
            SELECT member_id, SUM(amount) AS member_total
            FROM payments
            GROUP BY member_id
        ) AS subquery
    ");
    $alv = round((float)$alvStmt->fetchColumn(), 2);
    
    // b) top_converting_tier
    $tctStmt = $pdo->query("
        SELECT p.plan_name, COUNT(m.member_id) AS member_count
        FROM membership_plans p
        LEFT JOIN members m ON p.plan_id = m.plan_id
        GROUP BY p.plan_id
        ORDER BY member_count DESC
        LIMIT 1
    ");
    $topTierRow = $tctStmt->fetch();
    
    $totalMembersStmt = $pdo->query("SELECT COUNT(*) FROM members WHERE plan_id IS NOT NULL");
    $totalMembers = (int)$totalMembersStmt->fetchColumn();
    
    $top_converting_tier = null;
    if ($topTierRow && $totalMembers > 0) {
        $percent_share = ($topTierRow['member_count'] / $totalMembers) * 100;
        $top_converting_tier = [
            "plan_name" => $topTierRow['plan_name'],
            "percent_share" => round($percent_share, 1),
            "trend" => null // TODO: implement plan_stats_history table for trending
        ];
    } else {
        $top_converting_tier = [
            "plan_name" => "N/A",
            "percent_share" => 0.0,
            "trend" => null
        ];
    }
    
    // c) annual_retention
    // Note: this is a best-effort snapshot since there's no historical/audit table to track plan changes over time.
    $retentionStmt = $pdo->query("
        SELECT 
            SUM(CASE WHEN m.status = 'Active' THEN 1 ELSE 0 END) AS active_annual,
            COUNT(m.member_id) AS total_annual
        FROM members m
        JOIN membership_plans p ON m.plan_id = p.plan_id
        WHERE p.duration_months = 12
    ");
    $retentionRow = $retentionStmt->fetch();
    
    $annual_retention = 0.0;
    if ($retentionRow && $retentionRow['total_annual'] > 0) {
        $annual_retention = ($retentionRow['active_annual'] / $retentionRow['total_annual']) * 100;
    }
    $annual_retention = round($annual_retention, 1);
    
    json_success([
        "average_lifetime_value" => $alv,
        "average_lifetime_value_trend" => null, // TODO: implement plan_stats_history table for trending
        "top_converting_tier" => $top_converting_tier,
        "annual_retention" => $annual_retention,
        "annual_retention_trend" => null // TODO: implement plan_stats_history table for trending
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in insights: " . $e->getMessage());
    json_error("Database error", 500);
}
