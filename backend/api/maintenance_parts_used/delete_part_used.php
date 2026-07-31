<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data=json_decode(file_get_contents("php://input"),true);

$id=$data["id"] ?? null;

if(!$id){

    http_response_code(400);

    echo json_encode([
        "success"=>false,
        "message"=>"id is required"
    ]);

    exit;
}

$stmt=$pdo->prepare("
DELETE
FROM maintenance_parts_used
WHERE id=:id
");

$stmt->execute([
    ":id"=>$id
]);

echo json_encode([
    "success"=>true,
    "message"=>"Record deleted successfully"
]);