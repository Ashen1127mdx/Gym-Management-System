<?php

$host = "127.0.0.1";
$username = "root";
$password = "Gishmysql";
$database = "fitzone_gym";
$port = 3306;


$conn = mysqli_connect(
    $host,
    $username,
    $password,
    $database,
    $port
);


if(!$conn){

    die("Database Connection Failed: " . mysqli_connect_error());

}

?>