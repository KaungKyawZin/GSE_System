<?php

header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$part_name = trim($data["part_name"] ?? "");
$part_number = trim($data["part_number"] ?? "");
$stock_qty = $data["stock_qty"] ?? 0;
$unit_price = $data["unit_price"] ?? 0;
$supplier = trim($data["supplier"] ?? "");

if ($part_name == "" || $part_number == "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Part name and part number are required"
    ]);

    exit;
}

// Check duplicate part number
$check = $pdo->prepare("
    SELECT part_id
    FROM spare_parts
    WHERE part_number = :part_number
");

$check->execute([
    ":part_number" => $part_number
]);

if ($check->fetch()) {

    http_response_code(409);

    echo json_encode([
        "success" => false,
        "message" => "Part number already exists"
    ]);

    exit;
}

$sql = "
INSERT INTO spare_parts
(
    part_name,
    part_number,
    stock_qty,
    unit_price,
    supplier
)
VALUES
(
    :part_name,
    :part_number,
    :stock_qty,
    :unit_price,
    :supplier
)";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":part_name" => $part_name,
    ":part_number" => $part_number,
    ":stock_qty" => $stock_qty,
    ":unit_price" => $unit_price,
    ":supplier" => $supplier
]);

echo json_encode([
    "success" => true,
    "message" => "Spare part created successfully",
    "part_id" => $pdo->lastInsertId()
]);