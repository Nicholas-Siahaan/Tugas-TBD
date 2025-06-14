<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include koneksi database
include 'konek.php';

// Validate ISBN field
if (!isset($_POST['isbn']) || empty(trim($_POST['isbn']))) {
    echo json_encode([
        'success' => false,
        'message' => 'ISBN harus diisi'
    ]);
    exit;
}

$isbn = trim($_POST['isbn']);

try {
    // Check if book exists in database
    $checkSql = "SELECT * FROM buku WHERE isbn = ? AND is_activate = 1";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("s", $isbn);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Buku dengan ISBN tersebut tidak ditemukan atau sudah tidak aktif'
        ]);
        exit;
    }
    
    $book = $result->fetch_assoc();
    
    
    // Hard delete - permanently remove from database
    $deleteSql = "DELETE FROM buku WHERE buku_id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $book['buku_id']);
    
    if ($deleteStmt->execute()) {
        // Delete cover image file if exists
        if (!empty($book['cover_image']) && file_exists($book['cover_image'])) {
            unlink($book['cover_image']);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Buku "' . $book['judul'] . '" berhasil dihapus secara permanen',
            'book_id' => $book['buku_id'],
            'book_title' => $book['judul']
        ]);
    } else {
        throw new Exception('Gagal menghapus buku: ' . $conn->error);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage()
    ]);
}

$conn->close();
?>