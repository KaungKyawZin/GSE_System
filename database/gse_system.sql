CREATE DATABASE IF NOT EXISTS gse_system;
USE gse_system;

CREATE TABLE IF NOT EXISTS roles (
    `role_id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(50) UNIQUE,
    `Description` VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO roles(`role_id`, `role_name`, `Description`)
VALUES
(1, 'driver', 'Drive vehicle'),
(2, 'Inspector', 'Check Status'),
(3, 'Mechanic', 'Check vehicle'),
(4, 'admin', 'Control all action');


CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);