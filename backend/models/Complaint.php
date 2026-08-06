<?php
class Complaint {
    private $complaintId;
    private $filedById;
    private $filedByRole;
    private $againstId;
    private $subject;
    private $description;
    private $status;

    public function __construct($complaintId = null, $filedById = null, $filedByRole = null, $againstId = null, $subject = null, $description = null, $status = 'Pending') {
        $this->complaintId = $complaintId;
        $this->filedById = $filedById;
        $this->filedByRole = $filedByRole;
        $this->againstId = $againstId;
        $this->subject = $subject;
        $this->description = $description;
        $this->status = $status;
    }

    public static function fetchAll($db) {
        $query = "SELECT c.*, u1.name as filed_by_name, u2.name as against_name 
                  FROM complaints c 
                  JOIN users u1 ON c.filed_by_id = u1.id 
                  LEFT JOIN users u2 ON c.against_id = u2.id 
                  ORDER BY c.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($db) {
        $query = "INSERT INTO complaints (complaint_id, filed_by_id, filed_by_role, against_id, subject, description, status) 
                  VALUES (:complaint_id, :filed_by_id, :filed_by_role, :against_id, :subject, :description, :status)";
        $stmt = $db->prepare($query);
        return $stmt->execute([
            ':complaint_id' => $this->complaintId,
            ':filed_by_id' => $this->filedById,
            ':filed_by_role' => $this->filedByRole,
            ':against_id' => $this->againstId,
            ':subject' => $this->subject,
            ':description' => $this->description,
            ':status' => $this->status
        ]);
    }

    public static function resolve($db, $complaintId) {
        $query = "UPDATE complaints SET status = 'Resolved' WHERE complaint_id = :complaint_id";
        $stmt = $db->prepare($query);
        return $stmt->execute([':complaint_id' => $complaintId]);
    }
}
?>
