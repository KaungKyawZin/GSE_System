<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";
   
$data = json_decode(
    file_get_contents("php://input"),
    true
);
$user_id = $data["user_id"] ?? null; 
if(
    !$user_id
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "User ID is required"
    ]);
    exit;
}

try {
    $sql = "DELETE FROM users WHERE user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":user_id" => $user_id
    ]);
    echo json_encode([
        "success" => true,
        "message" => "User deleted successfully"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error deleting user"
    ]);
}
?>