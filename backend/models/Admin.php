<?php
require_once __DIR__ . '/User.php';

class Admin extends User {
    public function __construct($id = null, $name = null, $email = null, $password = null, $phone = null, $status = 'Active') {
        parent::__construct($id, $name, $email, $password, $phone, 'admin', $status);
    }
}
?>
