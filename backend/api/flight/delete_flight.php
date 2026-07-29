<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$flight_id = $data["flight_id"] ?? null;

if (!$flight_id) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "flight_id is required"
    ]);

    exit;
}

try {

    $sql = "
        DELETE FROM flights
        WHERE flight_id = :flight_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":flight_id" => $flight_id
    ]);

    if ($stmt->rowCount() === 0) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Flight not found"
        ]);

        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Flight deleted successfully"
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>