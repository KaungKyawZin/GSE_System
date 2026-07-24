CREATE DATABASE IF NOT EXISTS gse_system;
USE gse_system;

CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(100),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity VARCHAR(255),
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS vehicle_types (
    vehicle_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type_id INT NOT NULL,

    vehicle_code VARCHAR(50) UNIQUE,
    registration_no VARCHAR(50),
    manufacturer VARCHAR(100),
    model VARCHAR(100),

    vehicle_photo VARCHAR(255),

    year_manufactured YEAR,

    purchase_date DATE,

    status ENUM(
        'Available',
        'Assigned',
        'Maintenance',
        'Inspection',
        'Out of Service'
    ) DEFAULT 'Available',

    mileage DECIMAL(10,2),
    engine_hours DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_type_id)
        REFERENCES vehicle_types(vehicle_type_id)
);

CREATE TABLE IF NOT EXISTS flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,

    flight_number VARCHAR(30) NOT NULL,
    airline VARCHAR(100),

    arrival_time DATETIME,
    departure_time DATETIME,

    status ENUM(
        'Scheduled',
        'Boarding',
        'Arrived',
        'Departed',
        'Cancelled'
    ) DEFAULT 'Scheduled'
);

CREATE TABLE IF NOT EXISTS airport_gates (
    gate_id INT AUTO_INCREMENT PRIMARY KEY,
    gate_code VARCHAR(20) UNIQUE,
    terminal VARCHAR(50),
    status ENUM(
        'Available',
        'Occupied',
        'Maintenance'
    ) DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS vehicle_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,

    vehicle_id INT NOT NULL,
    user_id INT NOT NULL,

    flight_id INT,
    gate_id INT,

    assignment_start DATETIME,
    assignment_end DATETIME,

    status ENUM(
        'Assigned',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Assigned',

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    FOREIGN KEY (flight_id)
        REFERENCES flights(flight_id),

    FOREIGN KEY (gate_id)
        REFERENCES airport_gates(gate_id)
);

CREATE TABLE IF NOT EXISTS inspections (
    inspection_id INT AUTO_INCREMENT PRIMARY KEY,

    vehicle_id INT NOT NULL,

    inspected_by INT NOT NULL,

    inspection_date DATETIME,

    overall_status ENUM(
        'Passed',
        'Failed'
    ),

    remarks TEXT,

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (inspected_by)
        REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS inspection_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,

    item_name VARCHAR(100),
    description TEXT
);

CREATE TABLE IF NOT EXISTS inspection_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,

    inspection_id INT NOT NULL,
    item_id INT NOT NULL,

    result ENUM(
        'Pass',
        'Fail',
        'Needs Repair'
    ),

    remarks TEXT,

    FOREIGN KEY (inspection_id)
        REFERENCES inspections(inspection_id),

    FOREIGN KEY (item_id)
        REFERENCES inspection_items(item_id)
);

CREATE TABLE IF NOT EXISTS maintenance_jobs (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,

    vehicle_id INT NOT NULL,

    assigned_to INT,

    maintenance_date DATE,

    maintenance_type VARCHAR(100),

    description TEXT,

    cost DECIMAL(12,2),

    status ENUM(
        'Pending',
        'In Progress',
        'Completed'
    ) DEFAULT 'Pending',

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (assigned_to)
        REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS spare_parts (
    part_id INT AUTO_INCREMENT PRIMARY KEY,

    part_name VARCHAR(150),

    part_number VARCHAR(100) UNIQUE,

    stock_qty INT,

    unit_price DECIMAL(10,2),

    supplier VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS maintenance_parts_used (
    id INT AUTO_INCREMENT PRIMARY KEY,

    maintenance_id INT NOT NULL,

    part_id INT NOT NULL,

    quantity INT NOT NULL,

    FOREIGN KEY (maintenance_id)
        REFERENCES maintenance_jobs(maintenance_id),

    FOREIGN KEY (part_id)
        REFERENCES spare_parts(part_id)
);

CREATE TABLE IF NOT EXISTS ai_predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    prediction_date DATETIME,
    prediction_type VARCHAR(100),
    confidence DECIMAL(5,2),
    predicted_failure VARCHAR(255),
    recommendation TEXT,
    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id)
);

CREATE TABLE IF NOT EXISTS vehicle_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    user_id INT,
    log_time DATETIME,
    odometer DECIMAL(10,2),
    engine_hours DECIMAL(10,2),
    fuel_level DECIMAL(5,2),
    remarks TEXT,

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);