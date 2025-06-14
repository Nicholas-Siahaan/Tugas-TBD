<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- BOXICONS -->
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/main.css">
    <title>Login</title>
</head>
<body>
    <div class="boxes">
        <div class="form-header">
            <div class="titles">
                <div class="title-login">Login</div>
            </div>
        </div>
        <!-- LOGIN FORM -->
            <form action="loginForm.php" method="POST" class="login-form" autocomplete="off">
                <div class="input-box">
                    <input type="text" class="input-field" id="log-email" name="email" required>
                    <label for="log-email" class="label">Email</label>
                    <i class='bx bx-envelope icon'></i>
                </div>
                <div class="input-box">
                    <input type="password" class="input-field" id="log-pass" name="password" required>
                    <label for="log-pass" class="label">Password</label>
                    <i class='bx bx-lock-alt icon'></i>
                </div>
                <div class="form-cols">
                    <div class="col-1"></div>
                    <div class="col-2">
                        <a href="#">Forgot password?</a>
                    </div>
                </div>
                <div class="input-box">
                    <button class="btn-submit" id="SignInBtn">Sign In <i class='bx bx-log-in'></i></button>
                </div>
                <div class="switch-form">
                    <span>Don't have an account? <a href="#register" onclick="registerFunction()">Register</a></span>
                </div>
            </form>
        <!-- REGISTER FORM -->
        <div class="title-register">Register</div>
            <form action="register.php" method="POST" class="register-form" autocomplete="off">
                <div class="input-box">
                    <input type="text" class="input-field" id="reg-name" name="nama" required>
                    <label for="reg-name" class="label">Nama</label>
                    <i class='bx bx-user icon'></i>
                </div>
                <div class="input-box">
                    <input type="text" class="input-field" id="reg-email" name="email" required>
                    <label for="reg-email" class="label">Email</label>
                    <i class='bx bx-envelope icon'></i>
                </div>
                <div class="input-box">
                    <input type="password" class="input-field" id="reg-pass" name="password" required>
                    <label for="reg-pass" class="label">Password</label>
                    <i class='bx bx-lock-alt icon'></i>
                </div>
                <div class="input-box">
                    <input type="text" class="input-field" id="reg-no-telepon" name="no_telepon" required>
                    <label for="reg-no-telepon" class="label">No Telepon</label>
                    <i class='bx bx-phone icon'></i>
                </div>
                <div class="input-box">
                    <input type="text" class="input-field" id="reg-alamat" name="alamat" required>
                    <label for="reg-alamat" class="label">Alamat</label>
                    <i class='bx bx-home icon'></i>
                </div>
                <div class="form-cols">
                    <div class="col-1">
                        <input type="checkbox" id="agree">
                        <label for="agree"> I agree to terms & conditions</label>
                    </div>
                    <div class="col-2"></div>
                </div>
                <div class="input-box">
                    <button class="btn-submit" id="SignUpBtn">Sign Up <i class='bx bx-user-plus' ></i></button>
                </div>
                <div class="switch-form">
                    <span>Already have an account? <a href="#login" onclick="loginFunction()">Login</a></span>
                </div>
            </form>
    </div>
    <script src="JS/main.js"></script>
    
</body>
</html>