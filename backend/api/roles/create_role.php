<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$role_name = trim($data["role_name"] ?? "");
$description = trim($data["description"] ?? "");

if (
    $role_name === "" ||
    $description === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing"
    ]);

    exit;
}

$sql = "
    INSERT INTO roles (
        role_name,
        description
    )
    VALUES (
        :role_name,
        :description
    )
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":role_name" => $role_name,
    ":description" => $description
]);

echo json_encode([
    "success" => true,
    "message" => "Role created successfully",
    "role_id" => $pdo->lastInsertId()
]);