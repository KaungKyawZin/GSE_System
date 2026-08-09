<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";

try {

    // =====================================================
    // GET REQUEST DATA
    // =====================================================

    $input = file_get_contents("php://input");

    $data = json_decode($input, true);

    if (!is_array($data)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON request"
        ]);

        exit;
    }


    // =====================================================
    // VEHICLE ID
    // =====================================================

    if (
        !isset($data["vehicle_id"]) ||
        !is_numeric($data["vehicle_id"])
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "vehicle_id is required"
        ]);

        exit;
    }


    $vehicle_id = (int)$data["vehicle_id"];


    // =====================================================
    // PYTHON CONFIG
    // =====================================================

    $python =
        "C:\\Users\\kaungkyawzin\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe";

    $script =
        "C:\\Users\\kaungkyawzin\\GSE_System\\ai-service\\predict_api.py";


    // =====================================================
    // RUN PYTHON AI
    // =====================================================

    $command =
        "\"$python\" \"$script\" $vehicle_id 2>&1";


    $output = shell_exec($command);


    // =====================================================
    // CHECK PYTHON OUTPUT
    // =====================================================

    if ($output === null || trim($output) === "") {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "AI service returned no response"
        ]);

        exit;
    }


    // =====================================================
    // CLEAN OUTPUT
    // =====================================================

    $output = trim($output);


    // =====================================================
    // JSON DECODE PYTHON RESULT
    // =====================================================

    $result = json_decode($output, true);


    // =====================================================
    // INVALID PYTHON JSON
    // =====================================================

    if (json_last_error() !== JSON_ERROR_NONE) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "AI service returned invalid JSON",
            "error" => json_last_error_msg(),
            "raw_output" => $output
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    // =====================================================
    // RETURN PYTHON JSON DIRECTLY
    // =====================================================

    echo json_encode(
        $result,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

} catch (Throwable $e) {

    // =====================================================
    // PHP ERROR
    // =====================================================

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

