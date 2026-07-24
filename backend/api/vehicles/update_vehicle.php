<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$vehicle_id = $data["vehicle_id"] ?? null;
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

if ($vehicle_id === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "vehicle_id is required"
    ]);
    exit;
}

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
    $sql = "
        UPDATE vehicles
        SET
            vehicle_type_id = :vehicle_type_id,
            vehicle_code = :vehicle_code,
            registration_no = :registration_no,
            manufacturer = :manufacturer,
            model = :model,
            vehicle_photo = :vehicle_photo,
            year_manufactured = :year_manufactured,
            purchase_date = :purchase_date,
            status = :status,
            mileage = :mileage,
            engine_hours = :engine_hours
        WHERE vehicle_id = :vehicle_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":vehicle_id" => $vehicle_id,
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
        "message" => "Vehicle updated successfully"
    ]);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>