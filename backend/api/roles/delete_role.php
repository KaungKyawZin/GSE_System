<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";
$data = json_decode(
    file_get_contents("php://input"),
    true
);
$role_id = $data["role_id"] ?? null;
if(
    !$role_id
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Role ID is required"
    ]);
    exit;
}

try {
    $sql = "DELETE FROM roles WHERE role_id = :role_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":role_id" => $role_id
    ]);
    echo json_encode([
        "success" => true,
        "message" => "Role deleted successfully"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error deleting role"
    ]);
}
?>