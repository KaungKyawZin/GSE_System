<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/database.php";

// When using FormData in React, PHP populates $_POST and $_FILES
$vehicle_type_id   = $_POST["vehicle_type_id"] ?? null;
$vehicle_code      = trim($_POST["vehicle_code"] ?? "");
$registration_no   = trim($_POST["registration_no"] ?? "");
$manufacturer      = trim($_POST["manufacturer"] ?? "");
$model             = trim($_POST["model"] ?? "");
$year_manufactured = !empty($_POST["year_manufactured"]) ? $_POST["year_manufactured"] : null;
$purchase_date     = !empty($_POST["purchase_date"]) ? $_POST["purchase_date"] : null;
$status            = $_POST["status"] ?? "Available";
$mileage           = $_POST["mileage"] !== "" ? $_POST["mileage"] : null;
$engine_hours      = $_POST["engine_hours"] !== "" ? $_POST["engine_hours"] : null;

$vehicle_photo = "";
$errormessage  = "";

// Check required fields
if (!$vehicle_type_id || $vehicle_code === "" || $registration_no === "" || $manufacturer === "" || $model === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing"
    ]);
    exit;
}

// Handle Image File Upload if uploaded
if (isset($_FILES["vehicle_photo_file"]) && $_FILES["vehicle_photo_file"]["error"] === 0) {
    $fileName = $_FILES["vehicle_photo_file"]["name"];
    $fileSize = $_FILES["vehicle_photo_file"]["size"];
    $tmpName  = $_FILES["vehicle_photo_file"]["tmp_name"];

    $validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    if (!in_array($fileExt, $validExtensions)) {
        $errormessage = "Invalid image format. Only JPG, JPEG, PNG, WEBP allowed.";
    } elseif ($fileSize > 5000000) { // 5MB limit
        $errormessage = "Image file is too large (Max 5MB).";
    } else {
      
// Target folder inside backend uploads directory
$targetDirectory = __DIR__ . "/../../uploads/vehicles/";

if (!is_dir($targetDirectory)) {
    mkdir($targetDirectory, 0777, true);
}

$newImageName = time() . "_" . uniqid() . "." . $fileExt;

if (move_uploaded_file($tmpName, $targetDirectory . $newImageName)) {
    // Relative path saved in DB
    $vehicle_photo = "uploads/vehicles/" . $newImageName;
} else {
    $errormessage = "Failed to save uploaded image.";
}
    }
}

if ($errormessage !== "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $errormessage]);
    exit;
}

try {
    // Check if vehicle_code already exists
    $checkSql  = "SELECT vehicle_id FROM vehicles WHERE vehicle_code = :vehicle_code";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([":vehicle_code" => $vehicle_code]);

    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "message" => "Vehicle code already exists"
        ]);
        exit;
    }

    $sql = "INSERT INTO vehicles (
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
            ) VALUES (
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
            )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":vehicle_type_id"   => $vehicle_type_id,
        ":vehicle_code"      => $vehicle_code,
        ":registration_no"   => $registration_no,
        ":manufacturer"      => $manufacturer,
        ":model"             => $model,
        ":vehicle_photo"     => $vehicle_photo,
        ":year_manufactured" => $year_manufactured,
        ":purchase_date"     => $purchase_date,
        ":status"            => $status,
        ":mileage"           => $mileage,
        ":engine_hours"      => $engine_hours
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Vehicle created successfully",
        "vehicle_id" => $pdo->lastInsertId()
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server Error: " . $e->getMessage()
    ]);
}
?>