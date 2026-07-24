<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$vehicle_type_id = $data["vehicle_type_id"] ?? null;

if ($vehicle_type_id === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "vehicle_type_id is required"
    ]);
    exit;
}

try {
    $sql = "DELETE FROM vehicle_types WHERE vehicle_type_id = :vehicle_type_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":vehicle_type_id" => $vehicle_type_id]);

    echo json_encode([
        "success" => true,
        "message" => "Vehicle type deleted successfully"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>