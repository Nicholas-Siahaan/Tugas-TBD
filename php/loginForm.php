<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'konek.php'; 

$email = $_POST['email'];
$password = $_POST['password'];
$password = md5($password);

// Cek apakah email sudah terdaftar
$cek = "SELECT * FROM users WHERE email = '$email'";
$result=$conn->query($cek);
if ($result->num_rows > 0) {
    session_start();
    $row=$result->fetch_assoc();
    $_SESSION['email'] = $row['email'];
    $_SESSION['nama'] = $row['nama'];
    $_SESSION['role'] = $row['role'];
    header("Location: user.php");
    exit();
} else {
    echo "Email atau password salah. Silakan coba lagi.";
    exit();
}

$conn->close();
?>
