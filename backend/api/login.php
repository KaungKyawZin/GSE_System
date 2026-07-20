<?php 
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:5173"); // React Vite
// header("Access-Control-Allow-Origin: http://localhost:3000"); // React CRA

header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed"
    ]);

    exit;
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

if ($username === "" || $password === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Username and password are required"
    ]);

    exit;
}

$sql = "
SELECT
    u.user_id,
    u.username,
    u.email,
    u.password_hash,
    u.full_name,
    upper(u.status) status,
    r.role_id,
    r.role_name
FROM users u
INNER JOIN roles r
    ON u.role_id = r.role_id
WHERE u.username = :username
LIMIT 1
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    "username" => $username
]);

$user = $stmt->fetch();

if (!$user) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password"
    ]);

    exit;
}

if ($user["status"] !== "ACTIVE") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "User account is inactive"
    ]);

    exit;
}

if (!password_verify(
    $password,
    $user["password_hash"]
)) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password"
    ]);

    exit;
}

unset($user["password_hash"]);

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "data" => $user
]);
?>