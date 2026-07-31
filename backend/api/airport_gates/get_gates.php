<?php 

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

try {

    $sql = "
        SELECT
            gate_id,
            gate_code,
            terminal,
            status
        FROM airport_gates
        ORDER BY gate_id
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $gates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $gates
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>