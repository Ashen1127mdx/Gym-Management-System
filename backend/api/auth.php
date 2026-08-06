<?php
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/../models/Member.php';
require_once __DIR__ . '/../models/Trainer.php';
require_once __DIR__ . '/../models/Admin.php';

$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

if ($action === 'check_email') {
    $email = $_GET['email'] ?? '';
    if (!empty($email)) {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        echo json_encode(['exists' => $stmt->rowCount() > 0]);
    } else {
        echo json_encode(['exists' => false]);
    }
} else if ($action === 'login') {
    if (!empty($data['email']) && !empty($data['password'])) {
        $email = $data['email'];
        $password = $data['password'];

        $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute([':email' => $email]);

        if ($stmt->rowCount() > 0) {
            $userRow = $stmt->fetch(PDO::FETCH_ASSOC);
            $verified = password_verify($password, $userRow['password']);
            if ($verified) {

                // Block Pending/Inactive users (trainers and members must be approved by admin)
                if ($userRow['role'] !== 'admin' && $userRow['status'] !== 'Active') {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Your account is pending admin approval. Please wait for an administrator to activate your account.'
                    ]);
                    exit();
                }

                $_SESSION['userId'] = $userRow['id'];
                $_SESSION['role'] = $userRow['role'];
                $_SESSION['name'] = $userRow['name'];

                $specialization = '';
                if ($userRow['role'] === 'trainer') {
                    $q = "SELECT specialization FROM trainers WHERE id = :id";
                    $s = $db->prepare($q);
                    $s->execute([':id' => $userRow['id']]);
                    $specialization = $s->fetchColumn() ?: '';
                }

                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id'             => $userRow['id'],
                        'name'           => $userRow['name'],
                        'email'          => $userRow['email'],
                        'phone'          => $userRow['phone'] ?: '',
                        'role'           => $userRow['role'],
                        'avatarUrl'      => $userRow['avatar_url'] ?: '',
                        'specialization' => $specialization,
                        'isLoggedIn'     => true
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false, 
                    'message' => 'Email or password is incorrect.'
                ]);
            }
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false, 
                'message' => 'Email or password is incorrect.'
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and password required.']);
    }
} else if ($action === 'register_member') {
    if (!empty($data['name']) && !empty($data['email']) && !empty($data['password'])) {
        // Check if email already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([':email' => $data['email']]);
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already registered.']);
            exit();
        }

        $id = 'm-' . uniqid();
        $memberId = '#FZ-' . strtoupper(substr(uniqid(), -5));
        $nameParts = explode(' ', trim($data['name']));
        $initials = count($nameParts) > 1 
            ? strtoupper($nameParts[0][0] . end($nameParts)[0]) 
            : strtoupper(substr($nameParts[0], 0, 2));

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $today = date('M d, Y');

        $member = new Member(
            $id,
            $data['name'],
            $data['email'],
            $hashedPassword,
            $data['phone'] ?? '',
            'Pending', // Default status is pending
            $memberId,
            $initials,
            $data['nic'] ?? '',
            $data['dob'] ?? null,
            $data['gender'] ?? 'Male',
            $data['address'] ?? '',
            $data['emergencyContact'] ?? '',
            $data['plan'] ?? 'Standard Tier',
            $today,
            '' // No default avatar — user uploads their own
        );

        if ($member->create($db)) {
            echo json_encode(['success' => true, 'message' => 'Member registration successful! Awaiting admin activation.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to register member.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing registration information.']);
    }
} else if ($action === 'register_trainer') {
    if (!empty($data['name']) && !empty($data['email']) && !empty($data['password'])) {
        // Check if email already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([':email' => $data['email']]);
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already registered.']);
            exit();
        }

        $id = 'tr-' . uniqid();
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        $trainer = new Trainer(
            $id,
            $data['name'],
            $data['email'],
            $hashedPassword,
            $data['phone'] ?? '',
            'Pending', // Trainers start pending/inactive until approved
            $data['specialization'] ?? 'General Fitness',
            0,
            '',
            'Trainer',
            0
        );

        if ($trainer->create($db)) {
            echo json_encode(['success' => true, 'message' => 'Trainer registration successful! Awaiting admin activation.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to register trainer.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing registration information.']);
    }
} else if ($action === 'status') {
    if (isset($_SESSION['userId'])) {
        $query = "SELECT * FROM users WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $_SESSION['userId']]);
        if ($stmt->rowCount() > 0) {
            $userRow = $stmt->fetch(PDO::FETCH_ASSOC);
            $specialization = '';
 
            if ($userRow['role'] === 'trainer') {
                $q = "SELECT specialization FROM trainers WHERE id = :id";
                $s = $db->prepare($q);
                $s->execute([':id' => $userRow['id']]);
                $specialization = $s->fetchColumn() ?: '';
            }

            echo json_encode([
                'isLoggedIn' => true,
                'user' => [
                    'id'             => $userRow['id'],
                    'name'           => $userRow['name'],
                    'email'          => $userRow['email'],
                    'phone'          => $userRow['phone'] ?: '',
                    'role'           => $userRow['role'],
                    'avatarUrl'      => $userRow['avatar_url'] ?: '',
                    'specialization' => $specialization,
                    'isLoggedIn'     => true
                ]
            ]);
            exit();
        }
    }
    echo json_encode(['isLoggedIn' => false]);
} else if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}
?>
