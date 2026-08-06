CREATE DATABASE IF NOT EXISTS fitzone_db;
USE fitzone_db;

-- 1. Table for Membership Plans
CREATE TABLE IF NOT EXISTS membership_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    is_popular TINYINT(1) DEFAULT 0,
    features TEXT
);

-- 2. Table for Users (Base table for Admin, Trainer, Member)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- 'admin', 'trainer', 'member'
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Expired', 'Guest', 'Flagged', 'Pending'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for Member Details (Extends Users)
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL UNIQUE, -- e.g. #FZ-1029
    initials VARCHAR(10) NOT NULL,
    nic VARCHAR(50),
    dob DATE,
    gender VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(100),
    plan VARCHAR(100),
    join_date VARCHAR(50),
    avatar_url VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Table for Trainer Details (Extends Users)
CREATE TABLE IF NOT EXISTS trainers (
    id VARCHAR(50) PRIMARY KEY,
    specialization VARCHAR(100) NOT NULL,
    assigned_members_count INT DEFAULT 0,
    avatar_url VARCHAR(255),
    role_title VARCHAR(100) DEFAULT 'Trainer',
    archived TINYINT(1) DEFAULT 0,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Table for Gym Classes
CREATE TABLE IF NOT EXISTS gym_classes (
    class_id VARCHAR(50) PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    trainer_id VARCHAR(50),
    schedule_time VARCHAR(100) NOT NULL, -- e.g. 'Monday 6:00 PM'
    capacity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- 6. Table for Attendance
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    time VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Active', 'Guest', 'Flagged'
    avatar_url VARCHAR(255)
);

-- 7. Table for Bookings (Pre-orders)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Rejected'
    attendance TINYINT(1) DEFAULT 0,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES gym_classes(class_id) ON DELETE CASCADE
);

-- 8. Table for Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date VARCHAR(50) NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE CASCADE
);

-- 9. Table for Complaints
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id VARCHAR(50) PRIMARY KEY,
    filed_by_id VARCHAR(50) NOT NULL,
    filed_by_role VARCHAR(50) NOT NULL,
    against_id VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filed_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Empty all tables to ensure clean slate
TRUNCATE TABLE complaints;
TRUNCATE TABLE bookings;
TRUNCATE TABLE payments;
TRUNCATE TABLE attendance_records;
TRUNCATE TABLE gym_classes;
DELETE FROM trainers;
DELETE FROM members;
DELETE FROM users;
DELETE FROM membership_plans;

-- Insert Default Admin Only
-- Email: admin@fitzone.com, Password: Admin@123
INSERT INTO users (id, name, email, password, phone, role, status) VALUES 
('admin-1', 'Alex Rivera', 'admin@fitzone.com', '$2y$10$GE45mGJeORWNWsrCEfNAi.0rzxByTo2Dg3n4PC7HCz9SGPqDolgi2', '123-456-7890', 'admin', 'Active');

-- Re-insert Membership Plans structure for user selector functionality
INSERT INTO membership_plans (id, name, price, billing_cycle, tier, is_popular, features) VALUES
('plan-1', 'Day Pass', 9.00, 'per day', 'Standard', 0, '["Full facility access","Locker room access","1 complimentary towel"]')
ON DUPLICATE KEY UPDATE id=id;
