<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";
$vehicle_id = $_GET["vehicle_id"] ?? null;
if($vehicle_id === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "vehicle_id is required"
    ]);
    exit;
}
try {
    $sql = "SELECT * FROM vehicles WHERE vehicle_id = :vehicle_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":vehicle_id" => $vehicle_id]);
    $vehicle = $stmt->fetchAll();
    if (!$vehicle) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Vehicle not found"
        ]);
        exit;
    }
    echo json_encode([
        "success" => true,
        "data" => $vehicle
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Internal server error"
    ]);
}
?>