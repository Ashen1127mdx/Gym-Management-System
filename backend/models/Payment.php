<?php
class Payment {
    private $paymentId;
    private $memberId;
    private $planId;
    private $amount;
    private $paymentDate;

    public function __construct($paymentId = null, $memberId = null, $planId = null, $amount = null, $paymentDate = null) {
        $this->paymentId = $paymentId;
        $this->memberId = $memberId;
        $this->planId = $planId;
        $this->amount = $amount;
        $this->paymentDate = $paymentDate;
    }

    public static function fetchAll($db) {
        $query = "SELECT p.*, u.name as member_name, mp.name as plan_name 
                  FROM payments p 
                  JOIN users u ON p.member_id = u.id 
                  JOIN membership_plans mp ON p.plan_id = mp.id 
                  ORDER BY p.payment_date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($db) {
        $query = "INSERT INTO payments (payment_id, member_id, plan_id, amount, payment_date) 
                  VALUES (:payment_id, :member_id, :plan_id, :amount, :payment_date)";
        $stmt = $db->prepare($query);
        return $stmt->execute([
            ':payment_id' => $this->paymentId,
            ':member_id' => $this->memberId,
            ':plan_id' => $this->planId,
            ':amount' => $this->amount,
            ':payment_date' => $this->paymentDate
        ]);
    }
}
?>
