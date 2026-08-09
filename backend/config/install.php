<?php
$host = "localhost";
$port = 3306;
$username = "root";
$password = "root@123";
$database = "gse_system";
$files = glob(__DIR__ . "/../../database/gse_system.sql");
$pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $username, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

sort($files);

foreach ($files as $file) {

    echo "Running: " . basename($file) . "<br>";

    $sql = file_get_contents($file);

    $pdo->exec($sql);


    echo "
            <p style='color:green'>
                ✓ SQL executed successfully
            </p>
        ";
}

echo "<h2>Installation Complete</h2>";
