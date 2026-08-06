<?php
class Booking {
    private $bookingId;
    private $memberId;
    private $classId;
    private $status;
    private $attendance;

    public function __construct($bookingId = null, $memberId = null, $classId = null, $status = 'Pending', $attendance = 0) {
        $this->bookingId = $bookingId;
        $this->memberId = $memberId;
        $this->classId = $classId;
        $this->status = $status;
        $this->attendance = $attendance;
    }

    public static function fetchAll($db) {
        $query = "SELECT b.*, u.name as member_name, c.class_name, c.schedule_time 
                  FROM bookings b 
                  JOIN users u ON b.member_id = u.id 
                  JOIN gym_classes c ON b.class_id = c.class_id 
                  ORDER BY b.booking_date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function fetchByTrainer($db, $trainerId) {
        $query = "SELECT b.*, u.name as member_name, c.class_name, c.schedule_time 
                  FROM bookings b 
                  JOIN users u ON b.member_id = u.id 
                  JOIN gym_classes c ON b.class_id = c.class_id 
                  WHERE c.trainer_id = :trainer_id 
                  ORDER BY b.booking_date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([':trainer_id' => $trainerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function fetchByMember($db, $memberId) {
        $query = "SELECT b.*, c.class_name, c.schedule_time, u_tr.name as trainer_name 
                  FROM bookings b 
                  JOIN gym_classes c ON b.class_id = c.class_id 
                  LEFT JOIN users u_tr ON c.trainer_id = u_tr.id
                  WHERE b.member_id = :member_id 
                  ORDER BY b.booking_date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([':member_id' => $memberId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($db) {
        $query = "INSERT INTO bookings (booking_id, member_id, class_id, status, attendance) 
                  VALUES (:booking_id, :member_id, :class_id, :status, :attendance)";
        $stmt = $db->prepare($query);
        return $stmt->execute([
            ':booking_id' => $this->bookingId,
            ':member_id' => $this->memberId,
            ':class_id' => $this->classId,
            ':status' => $this->status,
            ':attendance' => $this->attendance
        ]);
    }

    public static function updateStatus($db, $bookingId, $status) {
        $query = "UPDATE bookings SET status = :status WHERE booking_id = :booking_id";
        $stmt = $db->prepare($query);
        return $stmt->execute([
            ':status' => $status,
            ':booking_id' => $bookingId
        ]);
    }
}
?>
