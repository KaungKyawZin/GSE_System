<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$user_id = $_GET["user_id"] ?? null;

if (!$user_id) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "user_id is required"
    ]);

    exit;
}

$sql = "
    SELECT
        u.user_id,
        u.full_name,
        u.username,
        u.email,
        u.phone,
        u.status,
        r.role_id,
        r.role_name
    FROM users u
    INNER JOIN roles r
        ON u.role_id = r.role_id
    WHERE u.user_id = :user_id
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":user_id" => $user_id
]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "data" => $user
]);