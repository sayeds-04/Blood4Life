-- Blood4Life Database Schema (3NF Normalized)
CREATE DATABASE IF NOT EXISTS blood4life CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blood4life;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables for clean setup
DROP TABLE IF EXISTS request_matched_donors;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS crisis_state;

-- 1. Users Table (Auth credentials)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'donor', 'hospital') NOT NULL,
    name VARCHAR(100) NOT NULL,
    profile_id VARCHAR(100),
    license VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Inventory Table (Blood stock level)
CREATE TABLE inventory (
    blood_group VARCHAR(10) PRIMARY KEY,
    units INT NOT NULL DEFAULT 0,
    cap INT NOT NULL DEFAULT 50,
    expiry DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Donors Table (Registered donors pool)
CREATE TABLE donors (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NULL,
    name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    lat DOUBLE NULL,
    lng DOUBLE NULL,
    last_donation_date DATE NULL,
    status VARCHAR(30) DEFAULT 'Eligible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Hospitals Table (Partner health facilities)
CREATE TABLE hospitals (
    name VARCHAR(100) PRIMARY KEY,
    license VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Requests Table (Blood requests raised by hospitals)
CREATE TABLE requests (
    id VARCHAR(50) PRIMARY KEY,
    hospital VARCHAR(100) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    units INT NOT NULL DEFAULT 1,
    urgency VARCHAR(20) NOT NULL DEFAULT 'Normal',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    time_ago VARCHAR(50) DEFAULT 'just now',
    step INT DEFAULT 1,
    drone_dispatched TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_hospital FOREIGN KEY (hospital) REFERENCES hospitals(name) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Request Matched Donors (Junction table enforcing 1 donor : 1 bag match rule)
CREATE TABLE request_matched_donors (
    request_id VARCHAR(50) NOT NULL,
    donor_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (request_id, donor_id),
    CONSTRAINT fk_rmd_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_rmd_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Donations Table (Donor history records)
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id VARCHAR(50) NOT NULL,
    donation_date DATE NOT NULL,
    qty INT DEFAULT 450,
    status VARCHAR(30) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Notifications Table (Real-time donor alerts)
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id VARCHAR(50) NOT NULL,
    donor_name VARCHAR(100),
    blood_group VARCHAR(10),
    message_text TEXT NOT NULL,
    req_id VARCHAR(50),
    time_ago VARCHAR(50) DEFAULT 'just now',
    responded VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Audit User Changes Table (captures role changes)
CREATE TABLE audit_user_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    changed_by VARCHAR(50) NULL,
    old_role ENUM('admin','donor','hospital') NULL,
    new_role ENUM('admin','donor','hospital') NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Crisis State Table
CREATE TABLE crisis_state (
    id INT PRIMARY KEY DEFAULT 1,
    active TINYINT(1) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- SEED DATA
-- =================================================================

-- Seed Users
INSERT INTO users (id, username, password, role, name, profile_id) VALUES
('ADM-01', 'admin', 'Admin@123', 'admin', 'System Admin', 'ADM-01'),
('USR-D2291', 'rafiq', 'Donor@123', 'donor', 'Rafiq Ahmed', 'D-2291'),
('USR-D2288', 'nusrat', 'Donor@123', 'donor', 'Nusrat Jahan', 'D-2288'),
('USR-H01', 'dmc', 'Hosp@123', 'hospital', 'Dhaka Medical College', 'Dhaka Medical College');

-- Seed Hospitals
INSERT INTO hospitals (name, license, address, city, phone, email) VALUES
('Dhaka Medical College', 'LIC-1001', 'Secretariat Rd, Dhaka', 'Dhaka', '+880-2-9999001', 'contact@dmc.gov.bd'),
('Square Hospital', 'LIC-1002', '18/F West Panthapath', 'Dhaka', '+880-2-8144400', 'info@squarehospital.com'),
('United Hospital', 'LIC-1003', 'Plot 15, Road 71, Gulshan 2', 'Dhaka', '+880-2-8836000', 'info@uhlbd.com'),
('Ibn Sina Hospital', 'LIC-1004', 'House 48, Road 9/A, Dhanmondi', 'Dhaka', '+880-2-9126625', 'info@ibnsinatrust.com'),
('Popular Diagnostic', 'LIC-1005', 'House 16, Road 2, Dhanmondi', 'Dhaka', '+880-2-9669480', 'info@populardiagnostic.com');

-- Seed Donors
INSERT INTO donors (id, user_id, name, blood_group, city, address, last_donation_date, status, phone, email, lat, lng) VALUES
('D-2291', 'USR-D2291', 'Rafiq Ahmed', 'O-', 'Mirpur', 'House 12, Road 4, Mirpur', '2026-04-18', 'Eligible', '+880-1710-000001', 'rafiq@example.com', 23.8223, 90.3654),
('D-2288', 'USR-D2288', 'Nusrat Jahan', 'AB-', 'Dhanmondi', 'Road 9A, Dhanmondi', '2026-07-05', 'Cooldown', '+880-1710-000002', 'nusrat@example.com', 23.7461, 90.3742),
('D-2276', NULL, 'Tanvir Hasan', 'B-', 'Uttara', 'Sector 7, Uttara', '2026-01-19', 'Eligible', '+880-1710-000003', 'tanvir@example.com', 23.8759, 90.3795),
('D-2265', NULL, 'Farzana Akter', 'O+', 'Banani', 'Road 11, Banani', '2026-05-02', 'Eligible', '+880-1710-000004', 'farzana@example.com', 23.7937, 90.4066),
('D-2251', NULL, 'Shakil Rahman', 'A+', 'Mohammadpur', 'Nurjahan Road, Mohammadpur', '2026-07-27', 'Cooldown', '+880-1710-000005', 'shakil@example.com', NULL, NULL);

-- Seed Inventory
INSERT INTO inventory (blood_group, units, cap, expiry) VALUES
('O+', 42, 60, '2026-08-24'),
('O-', 9, 40, '2026-08-13'),
('A+', 31, 50, '2026-08-29'),
('A-', 14, 35, '2026-08-18'),
('B+', 26, 45, '2026-08-27'),
('B-', 6, 30, '2026-08-12'),
('AB+', 18, 30, '2026-08-21'),
('AB-', 3, 20, '2026-08-11');

-- Seed Requests
INSERT INTO requests (id, hospital, blood_group, units, urgency, status, time_ago, step, drone_dispatched) VALUES
('REQ-1042', 'Dhaka Medical College', 'O-', 4, 'Critical', 'Pending', '6 min ago', 2, 0),
('REQ-1041', 'Square Hospital', 'AB-', 2, 'High', 'Approved', '22 min ago', 4, 0),
('REQ-1040', 'United Hospital', 'A+', 3, 'Normal', 'Completed', '1 hr ago', 7, 0),
('REQ-1039', 'Ibn Sina Hospital', 'B-', 5, 'Critical', 'Pending', '1 hr ago', 1, 0),
('REQ-1038', 'Popular Diagnostic', 'O+', 2, 'Normal', 'Completed', '3 hr ago', 7, 0);

-- Seed Request Matched Donors
INSERT INTO request_matched_donors (request_id, donor_id) VALUES
('REQ-1042', 'D-2291'),
('REQ-1040', 'D-2251'),
('REQ-1039', 'D-2276'),
('REQ-1038', 'D-2265');

-- Seed Notifications
INSERT INTO notifications (id, donor_id, donor_name, blood_group, message_text, req_id, time_ago, responded) VALUES
(1, 'D-2291', 'Rafiq Ahmed', 'O-', 'O- request from Dhaka Medical College — 4 units needed', 'REQ-1042', '6 min ago', NULL),
(2, 'D-2276', 'Tanvir Hasan', 'B-', 'B- request from Ibn Sina Hospital — 5 units needed', 'REQ-1039', '1 hr ago', NULL),
(3, 'D-2291', 'Rafiq Ahmed', 'O-', 'O- request from Popular Diagnostic — 2 units needed', 'REQ-1030', '3 days ago', 'accepted'),
(4, 'D-2265', 'Farzana Akter', 'O+', 'O+ request from Popular Diagnostic — 2 units needed', 'REQ-1038', '3 hr ago', 'accepted'),
(5, 'D-2288', 'Nusrat Jahan', 'AB-', 'AB- request from Square Hospital — 2 units needed', 'REQ-1041', '22 min ago', NULL),
(6, 'D-2251', 'Shakil Rahman', 'A+', 'A+ request from United Hospital — 3 units needed', 'REQ-1040', '1 hr ago', 'accepted');

-- Seed Donations
INSERT INTO donations (donor_id, donation_date, qty, status) VALUES
('D-2291', '2026-04-18', 450, 'Completed'),
('D-2291', '2025-12-30', 450, 'Completed'),
('D-2291', '2025-09-14', 450, 'Completed'),
('D-2291', '2025-06-02', 450, 'Completed'),
('D-2291', '2025-02-18', 450, 'Completed');

-- Seed Crisis State
INSERT INTO crisis_state (id, active) VALUES (1, 0);

-- 11. View for user roles
CREATE VIEW user_roles AS SELECT id, username, role FROM users;



DELIMITER $$

CREATE TRIGGER trg_user_role_change
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.role <> OLD.role THEN
        INSERT INTO audit_user_changes (user_id, changed_by, old_role, new_role)
        VALUES (NEW.id, CURRENT_USER(), OLD.role, NEW.role);
    END IF;
END$$

DELIMITER $$
CREATE PROCEDURE sp_change_user_role(
    IN p_user_id VARCHAR(50),
    IN p_new_role ENUM('admin','donor','hospital')
)
BEGIN
    UPDATE users SET role = p_new_role WHERE id = p_user_id;
END $$
DELIMITER ;
SET FOREIGN_KEY_CHECKS = 1;
