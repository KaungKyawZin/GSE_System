<?php

$files = glob(__DIR__ . "/../../database/gse_system.sql");

sort($files);

foreach ($files as $file) {

    echo "Running: " . basename($file) . "<br>";

    $sql = file_get_contents($file);

}

echo "<h2>Installation Complete</h2>";