<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include koneksi database
include 'konek.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['isbn']) || empty(trim($input['isbn']))) {
    echo json_encode([
        'success' => false,
        'message' => 'ISBN tidak boleh kosong'
    ]);
    exit;
}

$isbn = trim($input['isbn']);

try {
    // First, check if book exists in database
    $checkSql = "SELECT * FROM buku WHERE isbn = ? AND is_activate = 1";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("s", $isbn);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        // Book found in database
        $book = $result->fetch_assoc();
        
        $response = [
            'success' => true,
            'source' => 'database',
            'message' => 'Buku ditemukan di database',
            'data' => [
                'isbn' => $book['isbn'],
                'title' => $book['judul'],
                'publisher' => $book['penerbit'],
                'year' => $book['tahun_terbit'],
                'description' => $book['deskripsi'],
                'authors' => '', // We don't have authors field in current schema
                'pageCount' => null,
                'imageLinks' => $book['cover_image'] ? ['thumbnail' => $book['cover_image']] : null
            ]
        ];
        
        echo json_encode($response);
        exit;
    }
    
    // If not found in database, fetch from Google Books API
    $googleBooksUrl = "https://www.googleapis.com/books/v1/volumes?q=isbn:" . urlencode($isbn);
    
    // Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $googleBooksUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_error($ch)) {
        curl_close($ch);
        throw new Exception('Error fetching data from Google Books: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Google Books API returned HTTP ' . $httpCode);
    }
    
    $data = json_decode($response, true);
    
    if (!$data || !isset($data['items']) || empty($data['items'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Buku dengan ISBN tersebut tidak ditemukan'
        ]);
        exit;
    }
    
    // Get the first book result
    $book = $data['items'][0]['volumeInfo'];
    
    // Extract book information
    $bookData = [
        'isbn' => $isbn,
        'title' => $book['title'] ?? '',
        'authors' => isset($book['authors']) ? implode(', ', $book['authors']) : '',
        'publisher' => $book['publisher'] ?? '',
        'year' => $book['year'] ?? '',
        'description' => $book['description'] ?? '',
        'pageCount' => $book['pageCount'] ?? null,
        'imageLinks' => $book['imageLinks'] ?? null
    ];
    
    echo json_encode([
        'success' => true,
        'source' => 'google_books',
        'message' => 'Data buku berhasil ditemukan',
        'data' => $bookData
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage()
    ]);
}

$conn->close();
?>