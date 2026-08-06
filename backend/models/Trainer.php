<?php
require_once __DIR__ . '/User.php';

class Trainer extends User {
    private $specialization;
    private $assignedMembersCount;
    private $avatarUrl;
    private $roleTitle;
    private $archived;

    public function __construct($id = null, $name = null, $email = null, $password = null, $phone = null, $status = 'Active',
                                $specialization = null, $assignedMembersCount = 0, $avatarUrl = null, $roleTitle = 'Trainer', $archived = 0) {
        parent::__construct($id, $name, $email, $password, $phone, 'trainer', $status);
        $this->specialization = $specialization;
        $this->assignedMembersCount = $assignedMembersCount;
        $this->avatarUrl = $avatarUrl;
        $this->roleTitle = $roleTitle;
        $this->archived = $archived;
    }

    // Getters and Setters
    public function getSpecialization() { return $this->specialization; }
    public function setSpecialization($specialization) { $this->specialization = $specialization; }

    public function getAssignedMembersCount() { return $this->assignedMembersCount; }
    public function setAssignedMembersCount($count) { $this->assignedMembersCount = $count; }

    public function getAvatarUrl() { return $this->avatarUrl; }
    public function setAvatarUrl($avatarUrl) { $this->avatarUrl = $avatarUrl; }

    public function getRoleTitle() { return $this->roleTitle; }
    public function setRoleTitle($roleTitle) { $this->roleTitle = $roleTitle; }

    public function getArchived() { return $this->archived; }
    public function setArchived($archived) { $this->archived = $archived; }

    // Database Actions (Abstraction)
    public static function fetchAll($db) {
        $query = "SELECT u.id, u.name, u.email, u.phone, u.status, t.specialization, t.assigned_members_count,
                         COALESCE(u.avatar_url, t.avatar_url, '') AS avatar_url, t.role_title, t.archived 
                  FROM users u 
                  JOIN trainers t ON u.id = t.id 
                  WHERE u.role = 'trainer' AND t.archived = 0
                  ORDER BY u.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $trainers = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $trainers[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'status' => $row['status'],
                'specialization' => $row['specialization'],
                'assignedMembersCount' => (int)$row['assigned_members_count'],
                'avatarUrl' => $row['avatar_url'],
                'role' => $row['role_title'],
                'archived' => (bool)$row['archived']
            ];
        }
        return $trainers;
    }

    public function create($db) {
        try {
            $db->beginTransaction();

            // Insert into users
            $queryUser = "INSERT INTO users (id, name, email, password, phone, role, status) VALUES (:id, :name, :email, :password, :phone, :role, :status)";
            $stmtUser = $db->prepare($queryUser);
            $stmtUser->execute([
                ':id' => $this->id,
                ':name' => $this->name,
                ':email' => $this->email,
                ':password' => $this->password,
                ':phone' => $this->phone,
                ':role' => $this->role,
                ':status' => $this->status
            ]);

            // Insert into trainers
            $queryTrainer = "INSERT INTO trainers (id, specialization, assigned_members_count, avatar_url, role_title, archived) 
                             VALUES (:id, :specialization, :assigned_members_count, :avatar_url, :role_title, :archived)";
            $stmtTrainer = $db->prepare($queryTrainer);
            $stmtTrainer->execute([
                ':id' => $this->id,
                ':specialization' => $this->specialization,
                ':assigned_members_count' => $this->assignedMembersCount,
                ':avatar_url' => $this->avatarUrl,
                ':role_title' => $this->roleTitle,
                ':archived' => $this->archived
            ]);

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    public function update($db) {
        try {
            $db->beginTransaction();

            // Update users
            $queryUser = "UPDATE users SET name = :name, email = :email, phone = :phone, status = :status WHERE id = :id";
            $stmtUser = $db->prepare($queryUser);
            $stmtUser->execute([
                ':name' => $this->name,
                ':email' => $this->email,
                ':phone' => $this->phone,
                ':status' => $this->status,
                ':id' => $this->id
            ]);

            // Update trainers
            $queryTrainer = "UPDATE trainers SET specialization = :specialization, avatar_url = :avatar_url, role_title = :role_title, archived = :archived WHERE id = :id";
            $stmtTrainer = $db->prepare($queryTrainer);
            $stmtTrainer->execute([
                ':specialization' => $this->specialization,
                ':avatar_url' => $this->avatarUrl,
                ':role_title' => $this->roleTitle,
                ':archived' => $this->archived,
                ':id' => $this->id
            ]);

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    public static function delete($db, $id) {
        $query = "UPDATE trainers SET archived = 1 WHERE id = :id";
        $stmt = $db->prepare($query);
        return $stmt->execute([':id' => $id]);
    }
}
?>
