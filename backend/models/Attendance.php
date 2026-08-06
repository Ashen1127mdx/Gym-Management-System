<?php
class Attendance {
    private $id;
    private $memberId;
    private $memberName;
    private $initials;
    private $time;
    private $date;
    private $status;
    private $avatarUrl;
    private $checkedByRole;

    public function __construct($id = null, $memberId = null, $memberName = null, $initials = null, $time = null, $date = null, $status = 'Active', $avatarUrl = null, $checkedByRole = 'admin') {
        $this->id = $id;
        $this->memberId = $memberId;
        $this->memberName = $memberName;
        $this->initials = $initials;
        $this->time = $time;
        $this->date = $date;
        $this->status = $status;
        $this->avatarUrl = $avatarUrl;
        $this->checkedByRole = $checkedByRole;
    }

    public static function fetchAll($db) {
        $query = "SELECT 
                    ar.id, 
                    ar.member_id, 
                    COALESCE(u.name, ar.member_name) AS member_name, 
                    COALESCE(m.initials, ar.initials) AS initials, 
                    ar.time, 
                    ar.date, 
                    ar.status, 
                    COALESCE(m.avatar_url, ar.avatar_url) AS avatar_url, 
                    ar.checked_by_role
                  FROM attendance_records ar
                  LEFT JOIN members m ON ar.member_id = m.member_id
                  LEFT JOIN users u ON m.id = u.id
                  ORDER BY ar.date DESC, ar.time DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($db) {
        $query = "INSERT INTO attendance_records (id, member_id, member_name, initials, time, date, status, avatar_url, checked_by_role) 
                  VALUES (:id, :member_id, :member_name, :initials, :time, :date, :status, :avatar_url, :checked_by_role)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':id' => $this->id,
            ':member_id' => $this->memberId,
            ':member_name' => $this->memberName,
            ':initials' => $this->initials,
            ':time' => $this->time,
            ':date' => $this->date,
            ':status' => $this->status,
            ':avatar_url' => $this->avatarUrl,
            ':checked_by_role' => $this->checkedByRole
        ]);
        return true;
    }
}
?>
