<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

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
    WHERE r.role_name='Driver'
";

$stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);




echo json_encode([
    "success" => true,
    "data" => $users
]);