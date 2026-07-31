<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data=json_decode(file_get_contents("php://input"),true);

$id=$data["id"] ?? null;
$maintenance_id=$data["maintenance_id"] ?? null;
$part_id=$data["part_id"] ?? null;
$quantity=$data["quantity"] ?? null;

if(!$id || !$maintenance_id || !$part_id || !$quantity){

    http_response_code(400);

    echo json_encode([
        "success"=>false,
        "message"=>"All fields are required"
    ]);

    exit;
}

$sql="
UPDATE maintenance_parts_used
SET
    maintenance_id=:maintenance_id,
    part_id=:part_id,
    quantity=:quantity
WHERE id=:id
";

$stmt=$pdo->prepare($sql);

$stmt->execute([
    ":maintenance_id"=>$maintenance_id,
    ":part_id"=>$part_id,
    ":quantity"=>$quantity,
    ":id"=>$id
]);

echo json_encode([
    "success"=>true,
    "message"=>"Record updated successfully"
]);