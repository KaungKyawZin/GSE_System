<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$vehicle_type_id = $data["vehicle_type_id"] ?? null;
$vehicle_code = trim($data["vehicle_code"] ?? "");
$registration_no = trim($data["registration_no"] ?? "");
$manufacturer = trim($data["manufacturer"] ?? "");
$model = trim($data["model"] ?? "");
$vehicle_photo = trim($data["vehicle_photo"] ?? "");
$year_manufactured = $data["year_manufactured"] ?? null;
$purchase_date = $data["purchase_date"] ?? null;
$status = $data["status"] ?? "Available";
$mileage = $data["mileage"] ?? null;
$engine_hours = $data["engine_hours"] ?? null;

if (
    !$vehicle_type_id ||
    $vehicle_code === "" ||
    $registration_no === "" ||
    $manufacturer === "" ||
    $model === ""
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
        SELECT vehicle_id
        FROM vehicles
        WHERE vehicle_code = :vehicle_code
    ";

    $checkStmt = $pdo->prepare($checkSql);

    $checkStmt->execute([
        ":vehicle_code" => $vehicle_code
    ]);

    if ($checkStmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "Vehicle code already exists"
        ]);

        exit;
    }

    $sql = "
        INSERT INTO vehicles (
            vehicle_type_id,
            vehicle_code,
            registration_no,
            manufacturer,
            model,
            vehicle_photo,
            year_manufactured,
            purchase_date,
            status,
            mileage,
            engine_hours
        )
        VALUES (
            :vehicle_type_id,
            :vehicle_code,
            :registration_no,
            :manufacturer,
            :model,
            :vehicle_photo,
            :year_manufactured,
            :purchase_date,
            :status,
            :mileage,
            :engine_hours
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":vehicle_type_id" => $vehicle_type_id,
        ":vehicle_code" => $vehicle_code,
        ":registration_no" => $registration_no,
        ":manufacturer" => $manufacturer,
        ":model" => $model,
        ":vehicle_photo" => $vehicle_photo,
        ":year_manufactured" => $year_manufactured,
        ":purchase_date" => $purchase_date,
        ":status" => $status,
        ":mileage" => $mileage,
        ":engine_hours" => $engine_hours
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Vehicle created successfully",
        "vehicle_id" => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

?>