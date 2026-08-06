<?php
// Output buffering + error suppression for ALL api responses
// This MUST be the very first thing in header.php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
date_default_timezone_set('Asia/Colombo');

// ── CORS headers — must come FIRST, before session_start and any auth ──────
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost:3000';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond immediately to preflight OPTIONS requests (no auth needed)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Session must be configured BEFORE session_start()
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0);    // 0 = works on http (localhost)
ini_set('session.use_strict_mode', 0);

// Start PHP session
session_name('fitzone_session');
session_start();

// Helper to determine if the current user is an admin
function isAdmin(){
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

require_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Expiration date calculation helper
function calculateExpirationDate($billingCycle) {
    if (empty($billingCycle)) {
        return null;
    }
    $cycle = strtolower(trim(str_replace('/', '', $billingCycle)));
    
    if ($cycle === 'daily' || $cycle === 'day') {
        return date('Y-m-d H:i:s', strtotime('+1 day'));
    } elseif ($cycle === 'weekly' || $cycle === 'week') {
        return date('Y-m-d H:i:s', strtotime('+1 week'));
    } elseif ($cycle === 'monthly' || $cycle === 'month') {
        return date('Y-m-d H:i:s', strtotime('+1 month'));
    } elseif ($cycle === 'quarterly' || $cycle === '3 months') {
        return date('Y-m-d H:i:s', strtotime('+3 months'));
    } elseif ($cycle === '6 months') {
        return date('Y-m-d H:i:s', strtotime('+6 months'));
    } elseif ($cycle === 'yearly' || $cycle === 'year') {
        return date('Y-m-d H:i:s', strtotime('+1 year'));
    }
    
    if (preg_match('/(\d+)\s+(day|week|month|year)s?/', $cycle, $matches)) {
        $qty = $matches[1];
        $unit = $matches[2];
        return date('Y-m-d H:i:s', strtotime("+$qty $unit"));
    }
    
    return date('Y-m-d H:i:s', strtotime('+1 month'));
}

// On-the-fly cleanup: automatically expire memberships
if (isset($db)) {
    $db->exec("UPDATE members SET plan = 'No Plan', plan_expires_at = NULL WHERE plan_expires_at IS NOT NULL AND plan_expires_at <= NOW()");
}
?>
