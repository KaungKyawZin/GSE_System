<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";
$user_id = $_GET["user_id"] ?? null;
if ($user_id === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "user_id is required"
    ]);
    exit;
}

try {
    $sql = "SELECT * FROM users WHERE user_id = :user_id";
    $stm = $pdo-> prepare($sql);
    $stm-> execute([":user_id" => $user_id]);
    $user = $stm->fetchAll();
    echo json_encode([
        "success" => true,
        "data" => $user
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>