<?php
// Test the login API directly
$email = 'admin@fitzone.com';
$password = 'Admin@123';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/backend/api/auth.php?action=login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'password' => $password]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
curl_close($ch);

echo "API Response:\n";
var_dump($response);
echo "\n";

$data = json_decode($response, true);
if ($data) {
    echo "Decoded:\n";
    var_dump($data);
} else {
    echo "Failed to decode JSON. Raw response: " . $response;
}
?>