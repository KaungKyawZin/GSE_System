<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$gate_id = $data["gate_id"] ?? null;
$gate_code = trim($data["gate_code"] ?? "");
$terminal = trim($data["terminal"] ?? "");
$status = $data["status"] ?? "Available";

if (
    !$gate_id ||
    $gate_code === "" ||
    $terminal === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing"
    ]);

    exit;
}

try {

    $checkSql = "
        SELECT gate_id
        FROM airport_gates
        WHERE gate_code = :gate_code
        AND gate_id != :gate_id
    ";

    $checkStmt = $pdo->prepare($checkSql);

    $checkStmt->execute([
        ":gate_code" => $gate_code,
        ":gate_id" => $gate_id
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
        UPDATE airport_gates
        SET
            gate_code = :gate_code,
            terminal = :terminal,
            status = :status
        WHERE gate_id = :gate_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":gate_code" => $gate_code,
        ":terminal" => $terminal,
        ":status" => $status,
        ":gate_id" => $gate_id
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Gate updated successfully"
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>