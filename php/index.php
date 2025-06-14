<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/main.css">
</head>
<body>
    <header>    
        <div class ="wrapper">  
            <nav>
                <div class="logo">
                    <img src="SVG/Logo.svg" alt="Logo">
                </div>

                <div class="nav-middle">
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Explore</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>

                <div class="nav-right">
                    <ul>
                        <li><a href="login.php#login">Login</a></li>
                        <li><a href="login.php#register" class="btn dark" >Sign Up</a></li>
                    
                </div>
                
            </nav>
            
            <!-- End -->
            <div class ="hero">
                <div class="left">
                    <h1>Baca Tanpa Batas, Pinjam Sekarang!</h1>
                    <p>
                        Mau baca novel favorit atau buku pelajaran penting? Semuanya ada di sini!
                        Peminjaman buku jadi makin mudah lewat platform online kami.
                        Yuk, daftar sekarang dan temukan buku impianmu hanya dalam beberapa klik!
                    </p>
                    <a href="login.html#login" class = "btn light"> Let's start</a>
                </div>
                <div class="right">
                    <img src="image/Buku.png" alt="Shoes Image">
                </div>

            </div>
        </div>
    </header>
    <script src="script.js"></script>
</body>
</html>