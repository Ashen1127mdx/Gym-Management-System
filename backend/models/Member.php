<?php
require_once __DIR__ . '/User.php';

class Member extends User {
    private $memberId;
    private $initials;
    private $nic;
    private $dob;
    private $gender;
    private $address;
    private $emergencyContact;
    private $plan;
    private $joinDate;
    private $avatarUrl;

    public function __construct($id = null, $name = null, $email = null, $password = null, $phone = null, $status = 'Active',
                                $memberId = null, $initials = null, $nic = null, $dob = null, $gender = null, $address = null,
                                $emergencyContact = null, $plan = null, $joinDate = null, $avatarUrl = null) {
        parent::__construct($id, $name, $email, $password, $phone, 'member', $status);
        $this->memberId = $memberId;
        $this->initials = $initials;
        $this->nic = $nic;
        $this->dob = $dob;
        $this->gender = $gender;
        $this->address = $address;
        $this->emergencyContact = $emergencyContact;
        $this->plan = $plan;
        $this->joinDate = $joinDate;
        $this->avatarUrl = $avatarUrl;
    }

    // Getters and Setters
    public function getMemberId() { return $this->memberId; }
    public function setMemberId($memberId) { $this->memberId = $memberId; }

    public function getInitials() { return $this->initials; }
    public function setInitials($initials) { $this->initials = $initials; }

    public function getNic() { return $this->nic; }
    public function setNic($nic) { $this->nic = $nic; }

    public function getDob() { return $this->dob; }
    public function setDob($dob) { $this->dob = $dob; }

    public function getGender() { return $this->gender; }
    public function setGender($gender) { $this->gender = $gender; }

    public function getAddress() { return $this->address; }
    public function setAddress($address) { $this->address = $address; }

    public function getEmergencyContact() { return $this->emergencyContact; }
    public function setEmergencyContact($emergencyContact) { $this->emergencyContact = $emergencyContact; }

    public function getPlan() { return $this->plan; }
    public function setPlan($plan) { $this->plan = $plan; }

    public function getJoinDate() { return $this->joinDate; }
    public function setJoinDate($joinDate) { $this->joinDate = $joinDate; }

    public function getAvatarUrl() { return $this->avatarUrl; }
    public function setAvatarUrl($avatarUrl) { $this->avatarUrl = $avatarUrl; }

    // Database Actions (Abstraction)
    public static function fetchAll($db) {
        $query = "SELECT u.id, u.name, u.email, u.phone, u.status, m.member_id, m.initials, m.nic, m.dob, m.gender, m.address, m.emergency_contact, m.plan, m.join_date,
                         COALESCE(u.avatar_url, m.avatar_url, '') AS avatar_url
                  FROM users u 
                  JOIN members m ON u.id = m.id 
                  WHERE u.role = 'member' 
                  ORDER BY u.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $members = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $members[] = [
                'id'               => $row['id'],
                'name'             => $row['name'],
                'email'            => $row['email'],
                'phone'            => $row['phone'],
                'status'           => $row['status'],
                'member_id'        => $row['member_id'],  // snake_case for trainer dashboard
                'memberId'         => $row['member_id'],  // camelCase for admin views
                'initials'         => $row['initials'],
                'nic'              => $row['nic'],
                'dob'              => $row['dob'],
                'gender'           => $row['gender'],
                'address'          => $row['address'],
                'emergencyContact' => $row['emergency_contact'],
                'plan'             => $row['plan'],
                'joinDate'         => $row['join_date'],
                'avatarUrl'        => $row['avatar_url']
            ];
        }
        return $members;
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

            // Calculate expiration date
            $expiresAt = null;
            if (!empty($this->plan) && $this->plan !== 'No Plan') {
                $bcStmt = $db->prepare("SELECT billing_cycle FROM membership_plans WHERE name = :plan LIMIT 1");
                $bcStmt->execute([':plan' => $this->plan]);
                $billingCycle = $bcStmt->fetchColumn() ?: 'Monthly';
                $expiresAt = calculateExpirationDate($billingCycle);
            }

            // Insert into members
            $queryMember = "INSERT INTO members (id, member_id, initials, nic, dob, gender, address, emergency_contact, plan, join_date, avatar_url, plan_expires_at) 
                            VALUES (:id, :member_id, :initials, :nic, :dob, :gender, :address, :emergency_contact, :plan, :join_date, :avatar_url, :plan_expires_at)";
            $stmtMember = $db->prepare($queryMember);
            $stmtMember->execute([
                ':id' => $this->id,
                ':member_id' => $this->memberId,
                ':initials' => $this->initials,
                ':nic' => $this->nic,
                ':dob' => $this->dob,
                ':gender' => $this->gender,
                ':address' => $this->address,
                ':emergency_contact' => $this->emergencyContact,
                ':plan' => $this->plan,
                ':join_date' => $this->joinDate,
                ':avatar_url' => $this->avatarUrl,
                ':plan_expires_at' => $expiresAt
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

            // Calculate expiration date
            $expiresAt = null;
            if (!empty($this->plan) && $this->plan !== 'No Plan') {
                $bcStmt = $db->prepare("SELECT billing_cycle FROM membership_plans WHERE name = :plan LIMIT 1");
                $bcStmt->execute([':plan' => $this->plan]);
                $billingCycle = $bcStmt->fetchColumn() ?: 'Monthly';
                $expiresAt = calculateExpirationDate($billingCycle);
            }

            // Update members
            $queryMember = "UPDATE members SET nic = :nic, dob = :dob, gender = :gender, address = :address, emergency_contact = :emergency_contact, plan = :plan, plan_expires_at = :plan_expires_at, avatar_url = :avatar_url WHERE id = :id";
            $stmtMember = $db->prepare($queryMember);
            $stmtMember->execute([
                ':nic' => $this->nic,
                ':dob' => $this->dob,
                ':gender' => $this->gender,
                ':address' => $this->address,
                ':emergency_contact' => $this->emergencyContact,
                ':plan' => $this->plan,
                ':plan_expires_at' => $expiresAt,
                ':avatar_url' => $this->avatarUrl,
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
        try {
            $db->beginTransaction();

            // Get the FZ member_id for attendance records
            $stmt = $db->prepare("SELECT member_id FROM members WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $fzId = $stmt->fetchColumn();

            if ($fzId) {
                $stmt = $db->prepare("DELETE FROM attendance_records WHERE member_id = :fzId");
                $stmt->execute([':fzId' => $fzId]);
            }

            // Get the member's name to clean up trainer_schedule references
            $stmt = $db->prepare("SELECT name FROM users WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $memberName = $stmt->fetchColumn();
            if ($memberName) {
                $stmt = $db->prepare("DELETE FROM trainer_schedule WHERE member_name = :name");
                $stmt->execute([':name' => $memberName]);
            }

            // Delete from dependent tables
            foreach ([
                "DELETE FROM membership_requests WHERE member_id = :id",
                "DELETE FROM payment_log WHERE member_user_id = :id",
                "DELETE FROM workout_plans WHERE member_id = :id",
                "DELETE FROM notifications WHERE user_id = :id",
                "DELETE FROM members WHERE id = :id",
                "DELETE FROM users WHERE id = :id",
            ] as $sql) {
                $stmt = $db->prepare($sql);
                $stmt->execute([':id' => $id]);
            }

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }
}
?>
