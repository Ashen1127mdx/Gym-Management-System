<?php
function json_success($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function json_error($message, $status = 400) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(["error" => $message]);
    exit();
}
