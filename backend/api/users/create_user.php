<?php

// 1. Allow access from your Vite frontend development server URL
header("Access-Control-Allow-Origin: http://localhost:5173");

// 2. Allow JSON/Content-Type configurations inside body payloads
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 3. Allow standard HTTP operations needed for CRUD frameworks
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// 4. Handle HTTP OPTIONS preflight request smoothly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$role_id = $data["role_id"] ?? null;
$full_name = trim($data["full_name"] ?? "");
$username = trim($data["username"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";
$phone = trim($data["phone"] ?? "");
$status = $data["status"] ?? "Active";

if (
    !$role_id ||
    $full_name === "" ||
    $username === "" ||
    $password === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing"
    ]);

    exit;
}

$password_hash = password_hash(
    $password,
    PASSWORD_DEFAULT
);

$sql = "
    INSERT INTO users (
        role_id,
        full_name,
        username,
        email,
        password_hash,
        phone,
        status
    )
    VALUES (
        :role_id,
        :full_name,
        :username,
        :email,
        :password_hash,
        :phone,
        :status
    )
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":role_id" => $role_id,
    ":full_name" => $full_name,
    ":username" => $username,
    ":email" => $email,
    ":password_hash" => $password_hash,
    ":phone" => $phone,
    ":status" => $status
]);

echo json_encode([
    "success" => true,
    "message" => "User created successfully",
    "user_id" => $pdo->lastInsertId()
]);