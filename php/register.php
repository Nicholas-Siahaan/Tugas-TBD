<?php

include 'konek.php'; 

// Ambil data dari form
$nama = $_POST['nama'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
$nomor_telepon = $_POST['no_telepon'];
$alamat = $_POST['alamat'];
// Cek apakah email sudah terdaftar
$cek = "SELECT * FROM users WHERE email = '$email'";
$result=$conn->query($cek);
if ($result->num_rows > 0) {
    echo "Email sudah terdaftar. Silakan gunakan email lain.";
} else {
    // Simpan ke database
    $sql = "INSERT INTO users (nama, email, password, nomor_telepon, alamat) VALUES ('$nama', '$email', '$password', '$nomor_telepon', '$alamat')";

    if ($conn->query($sql) === TRUE) {
        header("Location: login.php");
        exit();
    } else {
        echo "Gagal registrasi: " . $conn->error;
        exit();
    }
}

$conn->close();
?>
