<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data=json_decode(file_get_contents("php://input"),true);

$maintenance_id=$data["maintenance_id"] ?? null;
$part_id=$data["part_id"] ?? null;
$quantity=$data["quantity"] ?? null;

if(!$maintenance_id || !$part_id || !$quantity){

    http_response_code(400);

    echo json_encode([
        "success"=>false,
        "message"=>"All fields are required"
    ]);

    exit;
}

/* Check Maintenance */

$stmt=$pdo->prepare("
SELECT maintenance_id
FROM maintenance_jobs
WHERE maintenance_id=:maintenance_id
");

$stmt->execute([
    ":maintenance_id"=>$maintenance_id
]);

if(!$stmt->fetch()){

    http_response_code(404);

    echo json_encode([
        "success"=>false,
        "message"=>"Maintenance job not found"
    ]);

    exit;
}

/* Check Spare Part */

$stmt=$pdo->prepare("
SELECT part_id
FROM spare_parts
WHERE part_id=:part_id
");

$stmt->execute([
    ":part_id"=>$part_id
]);

if(!$stmt->fetch()){

    http_response_code(404);

    echo json_encode([
        "success"=>false,
        "message"=>"Spare part not found"
    ]);

    exit;
}

$sql="
INSERT INTO maintenance_parts_used
(
    maintenance_id,
    part_id,
    quantity
)
VALUES
(
    :maintenance_id,
    :part_id,
    :quantity
)";

$stmt=$pdo->prepare($sql);

$stmt->execute([
    ":maintenance_id"=>$maintenance_id,
    ":part_id"=>$part_id,
    ":quantity"=>$quantity
]);

echo json_encode([
    "success"=>true,
    "message"=>"Record created successfully",
    "id"=>$pdo->lastInsertId()
]);