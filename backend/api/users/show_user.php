<?php
// 1. Mandatory CORS headers so your Vite frontend doesn't block the request
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// 2. Handle the Preflight OPTIONS request instantly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . "/../../config/database.php";

try {
    // 3. Fetch all system users to build the dashboard grid list
    $sql = "SELECT user_id, full_name, username, role_id, status FROM users ORDER BY user_id DESC";
    $stm = $pdo->prepare($sql);
    $stm->execute();
    
    // FETCH_ASSOC yields a clean associative structural array
    $users = $stm->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "data" => $users
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>