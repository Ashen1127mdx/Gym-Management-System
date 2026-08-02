<?php
require_once '../../config/db.php';
require_once '../../helpers/response.php';
require_once '../../helpers/validate.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    json_error("Invalid JSON input");
}

$plan_name = sanitize_string($input['plan_name'] ?? '');
$price = $input['price'] ?? 0;
$duration_months = $input['duration_months'] ?? 0;
$benefits = $input['benefits'] ?? [];

if (empty($plan_name)) {
    json_error("plan_name is required and cannot be empty");
}

if (!validate_positive_number($price)) {
    json_error("price must be a positive number");
}

if (!validate_positive_integer($duration_months)) {
    json_error("duration_months must be a positive integer");
}

if (!is_array($benefits) || empty($benefits)) {
    json_error("benefits must be a non-empty array");
}

$benefits_clean = [];
foreach ($benefits as $b) {
    $clean = sanitize_string($b);
    if (!empty($clean)) {
        $benefits_clean[] = $clean;
    }
}

if (empty($benefits_clean)) {
    json_error("benefits array must contain non-empty strings");
}

$benefits_str = implode(',', $benefits_clean);

try {
    $stmt = $pdo->prepare("INSERT INTO membership_plans (plan_name, price, duration_months, benefits) VALUES (?, ?, ?, ?)");
    $stmt->execute([$plan_name, $price, $duration_months, $benefits_str]);
    
    $plan_id = $pdo->lastInsertId();
    
    json_success([
        "plan_id" => (int)$plan_id,
        "plan_name" => $plan_name,
        "price" => (float)$price,
        "duration_months" => (int)$duration_months,
        "benefits" => $benefits_clean
    ], 201);
} catch (PDOException $e) {
    error_log("Database error in create_plan: " . $e->getMessage());
    json_error("Database error", 500);
}
