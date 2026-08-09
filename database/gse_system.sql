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


CREATE TABLE IF NOT EXISTS flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    gate_id INT,

    flight_number VARCHAR(30) NOT NULL,
    airline VARCHAR(100),

    arrival_time DATETIME,
    departure_time DATETIME,

    status ENUM(
        'Scheduled',
        'Departed',
        'Cancelled'
    ) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gate_id)
        REFERENCES airport_gates(gate_id)  
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
    vehicle_type_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    description TEXT,
    inspection_method ENUM(
        'Visual',
        'Measurement',
        'Functional Test'
    ) DEFAULT 'Visual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_type_id)
        REFERENCES vehicle_types(vehicle_type_id)
); 

CREATE TABLE IF NOT EXISTS inspection_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    item_id INT NOT NULL,
    result ENUM(
        'Pass',
        'Fail',
        'N/A'
    ) DEFAULT 'Pass',
    condition_status VARCHAR(100),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id)
        REFERENCES inspections(inspection_id),

    FOREIGN KEY (item_id)
        REFERENCES inspection_items(item_id)
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    inspection_id INT,
    reported_by INT NOT NULL,
    assigned_to INT,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    priority ENUM(
        'Low',
        'Medium',
        'High',
        'Critical'
    ) DEFAULT 'Medium',
    problem_description TEXT,
    request_status ENUM(
        'Pending',
        'Approved',
        'Assigned',
        'In Progress',
        'Completed',
        'Rejected'
    ) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (inspection_id)
        REFERENCES inspections(inspection_id),

    FOREIGN KEY (reported_by)
        REFERENCES users(user_id),

    FOREIGN KEY (assigned_to)
        REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS maintenance_jobs (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    mechanic_id INT NOT NULL,
    maintenance_type ENUM(
        'Preventive',
        'Corrective',
        'Emergency'
    ),
    problem_description TEXT,
    repair_description TEXT,
    start_date DATETIME,
    completed_date DATETIME,
    status ENUM(
        'Pending',
        'In Progress',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id)
        REFERENCES maintenance_requests(request_id),

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (mechanic_id)
        REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS ai_predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    inspection_id INT NULL,
    prediction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    prediction_type VARCHAR(100),
    predicted_result ENUM(
        'Pass',
        'Fail'
    ),
    confidence DECIMAL(5,2),
    risk_level ENUM(
        'Low',
        'Medium',
        'High'
    ),
    predicted_failure VARCHAR(255),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (inspection_id)
        REFERENCES inspections(inspection_id)
);

CREATE TABLE inspection_measurements (
    measurement_id INT AUTO_INCREMENT PRIMARY KEY,

    inspection_id INT NOT NULL,
    vehicle_id INT NOT NULL,

    engine_oil_level DECIMAL(10,2),
    brake_condition VARCHAR(50),
    tire_pressure DECIMAL(10,2),
    battery_voltage DECIMAL(10,2),
    coolant_level DECIMAL(10,2),
    fuel_level DECIMAL(10,2),

    head_light VARCHAR(50),
    indicator VARCHAR(50),
    steering_condition VARCHAR(50),

    measured_by INT NOT NULL,
    measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (inspection_id)
        REFERENCES inspections(inspection_id),

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (measured_by)
        REFERENCES users(user_id)
);