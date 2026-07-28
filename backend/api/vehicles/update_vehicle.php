<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../../config/database.php";

// 1. Read fields directly from $_POST (since React sends FormData)
$vehicle_id        = $_POST["vehicle_id"] ?? null;
$vehicle_type_id   = $_POST["vehicle_type_id"] ?? null;
$vehicle_code      = trim($_POST["vehicle_code"] ?? "");
$registration_no   = trim($_POST["registration_no"] ?? "");
$manufacturer      = trim($_POST["manufacturer"] ?? "");
$model             = trim($_POST["model"] ?? "");
$year_manufactured = !empty($_POST["year_manufactured"]) ? $_POST["year_manufactured"] : null;
$purchase_date     = !empty($_POST["purchase_date"]) ? $_POST["purchase_date"] : null;
$status            = $_POST["status"] ?? "Available";
$mileage           = !empty($_POST["mileage"]) ? $_POST["mileage"] : 0;
$engine_hours      = !empty($_POST["engine_hours"]) ? $_POST["engine_hours"] : 0;

// 2. Validate Vehicle ID
if (empty($vehicle_id)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "vehicle_id is required"
    ]);
    exit;
}

// 3. Validate Required Fields
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
    // 4. Handle File Upload (vehicle_photo_file from FormData)
    $uploaded_photo_path = null;
    if (isset($_FILES['vehicle_photo_file']) && $_FILES['vehicle_photo_file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath   = $_FILES['vehicle_photo_file']['tmp_name'];
        $fileName      = $_FILES['vehicle_photo_file']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $newFileName   = time() . '_' . uniqid() . '.' . $fileExtension;
        $uploadDir     = __DIR__ . '/../../uploads/vehicles/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $destPath)) {
            $uploaded_photo_path = 'uploads/vehicles/' . $newFileName;
        }
    }

    // 5. Build Dynamic SQL Query depending on whether a new image was uploaded
    if ($uploaded_photo_path !== null) {
        $sql = "
            UPDATE vehicles
            SET
                vehicle_type_id   = :vehicle_type_id,
                vehicle_code      = :vehicle_code,
                registration_no   = :registration_no,
                manufacturer      = :manufacturer,
                model             = :model,
                vehicle_photo     = :vehicle_photo,
                year_manufactured = :year_manufactured,
                purchase_date     = :purchase_date,
                status            = :status,
                mileage           = :mileage,
                engine_hours      = :engine_hours
            WHERE vehicle_id = :vehicle_id
        ";
    } else {
        // Retain existing vehicle_photo path in DB if no new image uploaded
        $sql = "
            UPDATE vehicles
            SET
                vehicle_type_id   = :vehicle_type_id,
                vehicle_code      = :vehicle_code,
                registration_no   = :registration_no,
                manufacturer      = :manufacturer,
                model             = :model,
                year_manufactured = :year_manufactured,
                purchase_date     = :purchase_date,
                status            = :status,
                mileage           = :mileage,
                engine_hours      = :engine_hours
            WHERE vehicle_id = :vehicle_id
        ";
    }

    $stmt = $pdo->prepare($sql);

    $params = [
        ":vehicle_id"        => $vehicle_id,
        ":vehicle_type_id"   => $vehicle_type_id,
        ":vehicle_code"      => $vehicle_code,
        ":registration_no"   => $registration_no,
        ":manufacturer"      => $manufacturer,
        ":model"             => $model,
        ":year_manufactured" => $year_manufactured,
        ":purchase_date"     => $purchase_date,
        ":status"            => $status,
        ":mileage"           => $mileage,
        ":engine_hours"      => $engine_hours
    ];

    if ($uploaded_photo_path !== null) {
        $params[":vehicle_photo"] = $uploaded_photo_path;
    }

    $stmt->execute($params);

    echo json_encode([
        "success" => true,
        "message" => "Vehicle updated successfully"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>