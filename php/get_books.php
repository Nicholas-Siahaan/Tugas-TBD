<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Include koneksi database
include 'konek.php';

// Ambil parameter dari URL
$search = isset($_GET['search']) ? $_GET['search'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$author = isset($_GET['author']) ? $_GET['author'] : '';
$availability = isset($_GET['availability']) ? $_GET['availability'] : '';
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'judul';
$order = isset($_GET['order']) ? $_GET['order'] : 'ASC';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;

$offset = ($page - 1) * $limit;

try {
    // Base query
    $whereConditions = ["is_activate = 1"];
    $params = [];
    $types = "";

    // Search condition
    if (!empty($search)) {
        $whereConditions[] = "(judul LIKE ? OR penerbit LIKE ? OR deskripsi LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss";
    }

    // Availability filter
    if ($availability === 'available') {
        $whereConditions[] = "jumlah_tersedia > 0";
    } elseif ($availability === 'unavailable') {
        $whereConditions[] = "jumlah_tersedia = 0";
    }

    // Build WHERE clause
    $whereClause = implode(" AND ", $whereConditions);

    // Sort options
    $validSorts = [
        'judul' => 'judul',
        'tahun_terbit' => 'tahun_terbit',
        'penerbit' => 'penerbit'
    ];
    
    $sortColumn = isset($validSorts[$sort]) ? $validSorts[$sort] : 'judul';
    $orderDirection = strtoupper($order) === 'DESC' ? 'DESC' : 'ASC';

    // Count total records
    $countSql = "SELECT COUNT(*) as total FROM buku WHERE $whereClause";
    $countStmt = $conn->prepare($countSql);
    
    if (!empty($params)) {
        $countStmt->bind_param($types, ...$params);
    }
    
    $countStmt->execute();
    $totalResult = $countStmt->get_result();
    $totalRecords = $totalResult->fetch_assoc()['total'];

    // Main query
    $sql = "SELECT 
                buku_id,
                isbn,
                judul,
                penerbit,
                tahun_terbit,
                jumlah_total,
                jumlah_tersedia,
                deskripsi,
                cover_image,
                create_at
            FROM buku 
            WHERE $whereClause 
            ORDER BY $sortColumn $orderDirection 
            LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($sql);
    
    // Add limit and offset parameters
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $books = [];
    while ($row = $result->fetch_assoc()) {
        $books[] = [
            'id' => $row['buku_id'],
            'isbn' => $row['isbn'],
            'title' => $row['judul'],
            'publisher' => $row['penerbit'],
            'year' => $row['tahun_terbit'],
            'total_stock' => $row['jumlah_total'],
            'available_stock' => $row['jumlah_tersedia'],
            'description' => $row['deskripsi'],
            'cover_image' => $row['cover_image'],
            'is_available' => $row['jumlah_tersedia'] > 0,
            'create_at' => $row['create_at']
        ];
    }

    // Calculate pagination info
    $totalPages = ceil($totalRecords / $limit);

    $response = [
        'success' => true,
        'data' => $books,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_records' => $totalRecords,
            'per_page' => $limit,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>