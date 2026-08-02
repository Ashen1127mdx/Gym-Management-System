<?php
function sanitize_string($str) {
    if ($str === null) return '';
    return trim(strip_tags((string)$str));
}

function validate_positive_number($num) {
    return is_numeric($num) && $num > 0;
}

function validate_positive_integer($num) {
    return is_numeric($num) && (int)$num == $num && $num > 0;
}
