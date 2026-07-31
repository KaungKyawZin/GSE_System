<?php

header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$part_id = $data["part_id"] ?? null;
$part_name = trim($data["part_name"] ?? "");
$part_number = trim($data["part_number"] ?? "");
$stock_qty = $data["stock_qty"] ?? 0;
$unit_price = $data["unit_price"] ?? 0;
$supplier = trim($data["supplier"] ?? "");

if (!$part_id || $part_name == "" || $part_number == "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing"
    ]);

    exit;
}

$check = $pdo->prepare("
    SELECT part_id
    FROM spare_parts
    WHERE part_number = :part_number
    AND part_id != :part_id
");

$check->execute([
    ":part_number" => $part_number,
    ":part_id" => $part_id
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
UPDATE spare_parts
SET
    part_name = :part_name,
    part_number = :part_number,
    stock_qty = :stock_qty,
    unit_price = :unit_price,
    supplier = :supplier
WHERE part_id = :part_id
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":part_name" => $part_name,
    ":part_number" => $part_number,
    ":stock_qty" => $stock_qty,
    ":unit_price" => $unit_price,
    ":supplier" => $supplier,
    ":part_id" => $part_id
]);

echo json_encode([
    "success" => true,
    "message" => "Spare part updated successfully"
]);