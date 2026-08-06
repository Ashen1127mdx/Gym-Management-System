<?php
class GymClass {
    private $classId;
    private $className;
    private $trainerId;
    private $scheduleTime;
    private $capacity;
    private $status;

    public function __construct($classId = null, $className = null, $trainerId = null, $scheduleTime = null, $capacity = null, $status = 'Active') {
        $this->classId = $classId;
        $this->className = $className;
        $this->trainerId = $trainerId;
        $this->scheduleTime = $scheduleTime;
        $this->capacity = $capacity;
        $this->status = $status;
    }

    public static function fetchAll($db) {
        $query = "SELECT c.*, u.name as trainer_name FROM gym_classes c LEFT JOIN users u ON c.trainer_id = u.id ORDER BY c.class_id ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($db) {
        $query = "INSERT INTO gym_classes (class_id, class_name, trainer_id, schedule_time, capacity, status) 
                  VALUES (:class_id, :class_name, :trainer_id, :schedule_time, :capacity, :status)";
        $stmt = $db->prepare($query);
        return $stmt->execute([
            ':class_id' => $this->classId,
            ':class_name' => $this->className,
            ':trainer_id' => $this->trainerId,
            ':schedule_time' => $this->scheduleTime,
            ':capacity' => $this->capacity,
            ':status' => $this->status
        ]);
    }
}
?>
