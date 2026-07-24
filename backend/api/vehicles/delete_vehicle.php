<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";
$data = json_decode(file_get_contents("php://input"), true);
$vehicle_id = $data["vehicle_id"] ?? null;

if ($vehicle_id === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "vehicle_id is required"
    ]);
    exit;
}

try {
    $sql = "DELETE FROM vehicles WHERE vehicle_id = :vehicle_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":vehicle_id" => $vehicle_id]);

    echo json_encode([
        "success" => true,
        "message" => "Vehicle deleted successfully"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Internal server error"
    ]);
}
?>