<?php 
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";
$data = json_decode(
    file_get_contents("php://input"),
    true
);
$role_id = $data["role_id"] ?? null;
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

try{
    $sql ="update roles set role_name = :role_name, description = :description where role_id = :role_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":role_name" => $role_name,
        ":description" => $description,
        ":role_id" => $role_id
    ]);
    echo json_encode([
        "success" => true,
        "message" => "Role updated successfully"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error updating role"
    ]);
}
?>