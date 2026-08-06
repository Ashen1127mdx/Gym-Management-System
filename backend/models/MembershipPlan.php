<?php
class MembershipPlan {
    private $id;
    private $name;
    private $price;
    private $billingCycle;
    private $tier;
    private $isPopular;
    private $features;

    public function __construct($id = null, $name = null, $price = null, $billingCycle = null, $tier = null, $isPopular = 0, $features = []) {
        $this->id = $id;
        $this->name = $name;
        $this->price = $price;
        $this->billingCycle = $billingCycle;
        $this->tier = $tier;
        $this->isPopular = $isPopular;
        $this->features = $features;
    }

    public function getId() { return $this->id; }
    public function getName() { return $this->name; }
    public function getPrice() { return $this->price; }
    public function getBillingCycle() { return $this->billingCycle; }
    public function getTier() { return $this->tier; }
    public function getIsPopular() { return $this->isPopular; }
    public function getFeatures() { return $this->features; }

    public static function fetchAll($db) {
        $query = "SELECT * FROM membership_plans ORDER BY price ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $plans = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $plans[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'billingCycle' => $row['billing_cycle'],
                'tier' => $row['tier'],
                'isPopular' => (bool)$row['is_popular'],
                'features' => json_decode($row['features'] ?? '[]', true)
            ];
        }
        return $plans;
    }

    public function create($db) {
        $query = "INSERT INTO membership_plans (id, name, price, billing_cycle, tier, is_popular, features) 
                  VALUES (:id, :name, :price, :billing_cycle, :tier, :is_popular, :features)";
        $stmt = $db->prepare($query);
        return $stmt->execute([
            ':id' => $this->id,
            ':name' => $this->name,
            ':price' => $this->price,
            ':billing_cycle' => $this->billingCycle,
            ':tier' => $this->tier,
            ':is_popular' => $this->isPopular,
            ':features' => json_encode($this->features)
        ]);
    }

    public function update($db) {
        $query = "UPDATE membership_plans SET name = :name, price = :price, billing_cycle = :billing_cycle, tier = :tier, is_popular = :is_popular, features = :features WHERE id = :id";
        $stmt = $db->prepare($query);
        return $stmt->execute([
            ':name' => $this->name,
            ':price' => $this->price,
            ':billing_cycle' => $this->billingCycle,
            ':tier' => $this->tier,
            ':is_popular' => $this->isPopular,
            ':features' => json_encode($this->features),
            ':id' => $this->id
        ]);
    }

    public static function delete($db, $id) {
        $query = "DELETE FROM membership_plans WHERE id = :id";
        $stmt = $db->prepare($query);
        return $stmt->execute([':id' => $id]);
    }
}
?>
