<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$flight_id = $data["flight_id"] ?? null;
$flight_number = trim($data["flight_number"] ?? "");
$airline = trim($data["airline"] ?? "");
$arrival_time = $data["arrival_time"] ?? null;
$departure_time = $data["departure_time"] ?? null;
$status = $data["status"] ?? "Scheduled";

if (
    !$flight_id ||
    $flight_number === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing"
    ]);

    exit;
}

try {

    $sql = "
        UPDATE flights
        SET
            flight_number = :flight_number,
            airline = :airline,
            arrival_time = :arrival_time,
            departure_time = :departure_time,
            status = :status
        WHERE flight_id = :flight_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":flight_number" => $flight_number,
        ":airline" => $airline,
        ":arrival_time" => $arrival_time,
        ":departure_time" => $departure_time,
        ":status" => $status,
        ":flight_id" => $flight_id
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Flight updated successfully"
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>