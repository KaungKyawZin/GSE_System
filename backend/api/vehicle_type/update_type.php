<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$vehicle_type_id = $data["vehicle_type_id"] ?? null;
$vehicle_type_name = $data["type_name"] ?? null;
$description = $data["description"] ?? null;

if ($vehicle_type_id === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "vehicle_type_id is required"
    ]);
    exit;
}

if ($vehicle_type_name === null || trim($vehicle_type_name) === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "vehicle_type_name or description is required"
    ]);
    exit;
}

try {
    $sql = "UPDATE vehicle_types SET type_name = :vehicle_type_name, description = :description WHERE vehicle_type_id = :vehicle_type_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":vehicle_type_id" => $vehicle_type_id,
        ":vehicle_type_name" => $vehicle_type_name,
        ":description" => $description
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Vehicle type updated successfully"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>