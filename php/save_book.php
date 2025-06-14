<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include koneksi database
include 'konek.php';

// Validate required fields
$requiredFields = ['title', 'year', 'category', 'stock'];
$missingFields = [];

foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    echo json_encode([
        'success' => false,
        'message' => 'Field yang wajib diisi: ' . implode(', ', $missingFields)
    ]);
    exit;
}

// Get form data
$isbn = isset($_POST['isbn']) ? trim($_POST['isbn']) : null;
$judul = trim($_POST['title']);
$penerbit = isset($_POST['publisher']) ? trim($_POST['publisher']) : '';
$tahun_terbit = (int)$_POST['year'];
$jumlah_total = (int)$_POST['stock'];
$jumlah_tersedia = (int)$_POST['stock'];
$deskripsi = isset($_POST['description']) ? trim($_POST['description']) : '';

// Handle file upload
$cover_image = null;
if (isset($_FILES['cover']) && $_FILES['cover']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'uploads/covers/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileExtension = strtolower(pathinfo($_FILES['cover']['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (in_array($fileExtension, $allowedExtensions)) {
        // Generate unique filename
        $filename = uniqid() . '_' . time() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $filename;
        
        if (move_uploaded_file($_FILES['cover']['tmp_name'], $uploadPath)) {
            $cover_image = $uploadPath;
        }
    }
}

try {
    // Check if book with same ISBN already exists
    $existingBook = null;
    if (!empty($isbn)) {
        $checkSql = "SELECT * FROM buku WHERE isbn = ? AND is_activate = 1";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("s", $isbn);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows > 0) {
            $existingBook = $result->fetch_assoc();
        }
    }
    
    if ($existingBook) {
        // Update existing book
        $updateSql = "UPDATE buku SET 
                        judul = ?, 
                        penerbit = ?, 
                        tahun_terbit = ?, 
                        jumlah_total = jumlah_total + ?, 
                        jumlah_tersedia = jumlah_tersedia + ?, 
                        deskripsi = ?";
        
        $params = [$judul, $penerbit, $tahun_terbit, $jumlah_total, $jumlah_tersedia, $deskripsi];
        $types = "ssiiss";
        
        // Add cover image update if uploaded
        if ($cover_image) {
            $updateSql .= ", cover_image = ?";
            $params[] = $cover_image;
            $types .= "s";
        }
        
        $updateSql .= ", update_at = NOW() WHERE buku_id = ?";
        $params[] = $existingBook['buku_id'];
        $types .= "i";
        
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param($types, ...$params);
        
        if ($updateStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Buku berhasil diperbarui. Stok ditambahkan ke buku yang sudah ada.',
                'action' => 'update',
                'book_id' => $existingBook['buku_id']
            ]);
        } else {
            throw new Exception('Gagal memperbarui buku: ' . $conn->error);
        }
        
    } else {
        // Insert new book
        $insertSql = "INSERT INTO buku (
                        isbn, 
                        judul, 
                        penerbit, 
                        tahun_terbit, 
                        jumlah_total, 
                        jumlah_tersedia, 
                        deskripsi, 
                        cover_image, 
                        is_activate,
                        create_at,
                        update_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
        
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bind_param("sssiisss", 
            $isbn, 
            $judul, 
            $penerbit, 
            $tahun_terbit, 
            $jumlah_total, 
            $jumlah_tersedia, 
            $deskripsi, 
            $cover_image
        );
        
        if ($insertStmt->execute()) {
            $newBookId = $conn->insert_id;
            
            echo json_encode([
                'success' => true,
                'message' => 'Buku baru berhasil ditambahkan',
                'action' => 'insert',
                'book_id' => $newBookId
            ]);
        } else {
            throw new Exception('Gagal menambahkan buku: ' . $conn->error);
        }
    }

} catch (Exception $e) {
    // Delete uploaded file if database operation fails
    if ($cover_image && file_exists($cover_image)) {
        unlink($cover_image);
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage()
    ]);
}

$conn->close();
?>