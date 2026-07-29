<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

try {

    $sql = "
        SELECT
            flight_id,
            flight_number,
            airline,
            arrival_time,
            departure_time,
            status
        FROM flights
        ORDER BY flight_id
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $flights
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>