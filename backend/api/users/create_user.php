<?php

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