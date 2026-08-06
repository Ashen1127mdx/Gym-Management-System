<?php
require_once __DIR__ . '/header.php';

// 1. Get real active members count (without any artificial offsets)
$queryMembers = "SELECT COUNT(*) FROM users WHERE role = 'member' AND status = 'Active'";
$stmtMembers = $db->prepare($queryMembers);
$stmtMembers->execute();
$activeMembers = (int)$stmtMembers->fetchColumn();

// 2. Calculate real Equipment Health percentage from equipment table
$queryHealth = "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Functional' THEN 1 ELSE 0 END) as functional FROM equipment";
$stmtHealth = $db->prepare($queryHealth);
$stmtHealth->execute();
$healthInfo = $stmtHealth->fetch(PDO::FETCH_ASSOC);

$equipmentHealth = "100%";
if ($healthInfo && $healthInfo['total'] > 0) {
    $pct = ($healthInfo['functional'] / $healthInfo['total']) * 100;
    $equipmentHealth = number_format($pct, 1) . "%";
}

// 3. Get real active trainer staff count
$queryTrainers = "SELECT COUNT(*) FROM trainers WHERE archived = 0";
$stmtTrainers = $db->prepare($queryTrainers);
$stmtTrainers->execute();
$activeTrainers = (int)$stmtTrainers->fetchColumn();

// Return clean, database-driven stats
echo json_encode([
    'activeMembers' => $activeMembers,
    'equipmentHealth' => $equipmentHealth,
    'activeTrainers' => $activeTrainers
]);
?>
