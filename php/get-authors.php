<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Include koneksi database
include 'konek.php';

try {
    // Get all authors from database
    $sql = "SELECT pengarang_id, nama_pengarang FROM pengarang ORDER BY nama_pengarang ASC";
    $result = $conn->query($sql);
    
    $authors = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $authors[] = [
                'id' => $row['pengarang_id'],
                'name' => $row['nama_pengarang']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $authors
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage()
    ]);
}

$conn->close();
?>