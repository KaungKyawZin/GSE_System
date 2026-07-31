<?php

header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$part_id = $data["part_id"] ?? null;

if (!$part_id) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "part_id is required"
    ]);

    exit;
}

$stmt = $pdo->prepare("
    DELETE FROM spare_parts
    WHERE part_id = :part_id
");

$stmt->execute([
    ":part_id" => $part_id
]);

echo json_encode([
    "success" => true,
    "message" => "Spare part deleted successfully"
]);