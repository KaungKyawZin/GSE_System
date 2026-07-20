<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$user_id = $data["user_id"] ?? null;
$role_id = $data["role_id"] ?? null;
$full_name = trim($data["full_name"] ?? "");
$username = trim($data["username"] ?? "");
$email = trim($data["email"] ?? "");
$phone = trim($data["phone"] ?? "");
$status = $data["status"] ?? "Active";

if (
    !$user_id || !$role_id || $full_name === "" || $username === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing"
    ]);

    exit;
}

$sql = "
    UPDATE users
    SET
        role_id = :role_id,
        full_name = :full_name,
        username = :username,
        email = :email,
        phone = :phone,
        status = :status
    WHERE user_id = :user_id
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":user_id" => $user_id,
    ":role_id" => $role_id,
    ":full_name" => $full_name,
    ":username" => $username,
    ":email" => $email,
    ":phone" => $phone,
    ":status" => $status
]);

echo json_encode([
    "success" => true,
    "message" => "User updated successfully"
]);