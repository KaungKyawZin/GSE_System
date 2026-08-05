<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$gate_id = trim($data["gate_id"] ?? "");
$flight_number = trim($data["flight_number"] ?? "");
$airline = trim($data["airline"] ?? "");
$arrival_time = $data["arrival_time"] ?? null;
$departure_time = $data["departure_time"] ?? null;
$status = $data["status"] ?? "Scheduled";

if ($flight_number === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "flight_number is required"
    ]);

    exit;
}

try {

    $sql = "
        INSERT INTO flights (
            gate_id,
            flight_number,
            airline,
            arrival_time,
            departure_time,
            status
        )
        VALUES (
            :gate_id,
            :flight_number,
            :airline,
            :arrival_time,
            :departure_time,
            :status
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":gate_id" => $gate_id,
        ":flight_number" => $flight_number,
        ":airline" => $airline,
        ":arrival_time" => $arrival_time,
        ":departure_time" => $departure_time,
        ":status" => $status
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Flight created successfully",
        "flight_id" => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>