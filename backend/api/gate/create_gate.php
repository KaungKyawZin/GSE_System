<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$gate_code = trim($data["gate_code"] ?? "");
$terminal = trim($data["terminal"] ?? "");
$status = $data["status"] ?? "Available";

if ($gate_code === "" || $terminal === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "gate_code and terminal are required"
    ]);

    exit;
}

try {

    $checkSql = "
        SELECT gate_id
        FROM airport_gates
        WHERE gate_code = :gate_code
    ";

    $checkStmt = $pdo->prepare($checkSql);

    $checkStmt->execute([
        ":gate_code" => $gate_code
    ]);

    if ($checkStmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "Gate code already exists"
        ]);

        exit;
    }

    $sql = "
        INSERT INTO airport_gates (
            gate_code,
            terminal,
            status
        )
        VALUES (
            :gate_code,
            :terminal,
            :status
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":gate_code" => $gate_code,
        ":terminal" => $terminal,
        ":status" => $status
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Gate created successfully",
        "gate_id" => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>