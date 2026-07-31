<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$gate_id = $data["gate_id"] ?? null;

if (!$gate_id) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "gate_id is required"
    ]);

    exit;
}

try {

    $sql = "
        DELETE FROM airport_gates
        WHERE gate_id = :gate_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":gate_id" => $gate_id
    ]);

    if ($stmt->rowCount() === 0) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Gate not found"
        ]);

        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Gate deleted successfully"
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>