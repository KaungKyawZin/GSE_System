<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

try {
    $sql = "SELECT * FROM vehicle_types order by vehicle_type_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $vehicle_types = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $vehicle_types
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>