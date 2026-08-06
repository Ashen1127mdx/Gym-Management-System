<?php
abstract class User {
    protected $id;
    protected $name;
    protected $email;
    protected $password;
    protected $phone;
    protected $role;
    protected $status;

    public function __construct($id = null, $name = null, $email = null, $password = null, $phone = null, $role = null, $status = 'Active') {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->phone = $phone;
        $this->role = $role;
        $this->status = $status;
    }

    // Getters and Setters
    public function getId() { return $this->id; }
    public function setId($id) { $this->id = $id; }

    public function getName() { return $this->name; }
    public function setName($name) { $this->name = $name; }

    public function getEmail() { return $this->email; }
    public function setEmail($email) { $this->email = $email; }

    public function getPassword() { return $this->password; }
    public function setPassword($password) { $this->password = $password; }

    public function getPhone() { return $this->phone; }
    public function setPhone($phone) { $this->phone = $phone; }

    public function getRole() { return $this->role; }
    public function setRole($role) { $this->role = $role; }

    public function getStatus() { return $this->status; }
    public function setStatus($status) { $this->status = $status; }
}
?>
