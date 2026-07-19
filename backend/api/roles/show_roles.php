<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";
$role_id = $_GET["role_id"] ?? null;

if ($role_id === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "role_id is required"
    ]);
    exit;
}

try {
    $sql ="select * from roles where role_id= :role_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":role_id" => $role_id]);
    $role = $stmt->fetchAll();

    if (!$role) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Role not found"
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "role" => $role
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Internal server error"
    ]);
}
?>
