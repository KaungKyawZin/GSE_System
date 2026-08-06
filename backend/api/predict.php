<?php

header("Content-Type: application/json");
require_once __DIR__ . "/../config/database.php";

$data=json_decode(
    file_get_contents("php://input"),
    true
);


$vehicle_id=$data["vehicle_id"];


$python = "C:\\Users\\kaungkyawzin\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe";


$script = "C:\\Users\\kaungkyawzin\\GSE_System\\ai-service\\predict_api.py";


$command = "\"$python\" \"$script\" $vehicle_id 2>&1";


$output=shell_exec($command);



echo json_encode([
    "output"=>$output
]);

?>