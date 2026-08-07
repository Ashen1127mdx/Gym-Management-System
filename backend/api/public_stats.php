<?php
require_once __DIR__ . '/header.php';

// 1. Get real active members count (without any artificial offsets)
$queryMembers = "SELECT COUNT(*) FROM users WHERE role = 'member' AND status = 'Active'";
$stmtMembers = $db->prepare($queryMembers);
$stmtMembers->execute();
$activeMembers = (int)$stmtMembers->fetchColumn();

// 2. Get real active trainer staff count
$queryTrainers = "SELECT COUNT(*) FROM trainers WHERE archived = 0";
$stmtTrainers = $db->prepare($queryTrainers);
$stmtTrainers->execute();
$activeTrainers = (int)$stmtTrainers->fetchColumn();

// Return clean, database-driven stats
echo json_encode([
    'activeMembers' => $activeMembers,
    'activeTrainers' => $activeTrainers
]);
?>
