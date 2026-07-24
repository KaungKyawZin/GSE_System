<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

try {
    $sql = "SELECT * FROM vehicles ORDER BY vehicle_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $vehicles = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $vehicles
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>