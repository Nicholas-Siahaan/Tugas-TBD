<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/user-home.css">
</head>
<body>
    <header>    
        <div class ="wrapper">  
            <div class="header-home">
                <div class="logo">
                    <img src="SVG/Logo.svg" alt="Logo">
                </div>
                <div class="right_header">
                    <div class="input-box">
                        <input type="text" class="input-field" id="book-search" required>
                        <label for="book-search" class="label">Search</label>
                        <i class='bx bx-search icon'></i>
                    </div>
                    <i class='bx bx-user user-icon'></i>
                </div>
            </div>
            
            <!-- End -->
            <div class ="hero">
                <div class="left">
                    <h1>Hello, <?php echo htmlspecialchars($_SESSION['nama']); ?></h1>
                    <p>
                        Siap untuk membaca hari ini? Jelajahi katalog buku kami, pinjam yang kamu suka,
                        dan nikmati pengalaman membaca digital yang praktis dan menyenangkan.
                    </p>
                    <a href="show-book.html" class="btn dark" >Jelajahi Buku</a>
                </div>
                <div class="right">
                    <img src="image/Buku.png" alt="Shoes Image">
                </div>

            </div>
        </div>
    </header>
    
    <div class="wrapper">
        <section class = catalog-section>  
            <div class="new-release">
                    <h1>Keluaran Terbaru</h1>
                    <div class="catalog">
                        <div class="book-item">
                            <img src="Image/Cover1.webp" alt="Book Cover">
                            <div class="book-info">
                                <h2 class="book-title">Aku Mengenal Hewan</h2>
                                <hr class="separator">
                                <div class="book-details">
                                    <p>Author : <span class="highlight">Text</span></p>
                                    <p>Penerbit : <span class="highlight">Text</span></p>
                                    <p>Tahun : <span class="highlight">Text</span></p>
                                </div>
                                <a href="#" class="borrow-button">Pinjam Sekarang</a>
                            </div>
                        </div>
                        <div class="book-item">
                            <img src="image/Cover1.webp"  alt="Book Cover">
                            <div class="book-info">
                                <h2 class="book-title">Aku Mengenal<br>Hewan</h2>
                                <hr class="separator">
                                <div class="book-details">
                                    <p>Author : <span class="highlight">Text</span></p>
                                    <p>Penerbit : <span class="highlight">Text</span></p>
                                    <p>Tahun : <span class="highlight">Text</span></p>
                                </div>
                                <a href="#" class="borrow-button">Pinjam Sekarang</a>
                            </div>
                        </div>
                        <div class="book-item">
                            <img src="image/Cover1.webp" alt="Book Cover">
                            <div class="book-info">
                                <h2 class="book-title">Aku Mengenal<br>Hewan</h2>
                                <hr class="separator">
                                <div class="book-details">
                                    <p>Author : <span class="highlight">Text</span></p>
                                    <p>Penerbit : <span class="highlight">Text</span></p>
                                    <p>Tahun : <span class="highlight">Text</span></p>
                                </div>
                                <a href="#" class="borrow-button">Pinjam Sekarang</a>
                            </div>
                        </div>
                        <div class="book-item">
                            <img src="Image/Cover1.webp" alt="Book Cover">
                            <div class="book-info">
                                <h2 class="book-title">Aku Mengenal<br>Hewan</h2>
                                <hr class="separator">
                                <div class="book-details">
                                    <p>Author : <span class="highlight">Text</span></p>
                                    <p>Penerbit : <span class="highlight">Text</span></p>
                                    <p>Tahun : <span class="highlight">Text</span></p>
                                </div>
                                <a href="#" class="borrow-button">Pinjam Sekarang</a>
                            </div>
                        </div>
                    </div>
                </div>
        </section>
    </div>
    <script src="script.js"></script>
</body>
</html>