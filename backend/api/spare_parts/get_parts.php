<?php

header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

try {

    $sql = "
        SELECT *
        FROM spare_parts
        ORDER BY part_id
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}