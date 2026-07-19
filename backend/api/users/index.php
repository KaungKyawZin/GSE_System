<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";
$user_id = $_GET["user_id"] ?? null;

if($user_id != 2){
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied"
    ]);
    exit;
}
try {
    $sql = "SELECT * FROM users ORDER BY user_id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $users
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>