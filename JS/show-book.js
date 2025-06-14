// **DITAMBAHKAN**: Variabel global untuk state aplikasi
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let currentBookId = null;
let currentBookTitle = null;

// **DIPERBARUI**: Fungsi untuk load data buku dari database
async function loadBooks(page = 1) {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingState();
    
    try {
        // **DITAMBAHKAN**: Ambil nilai filter dari form
        const searchTerm = document.getElementById('searchInput').value.trim();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const authorFilter = document.getElementById('authorFilter').value;
        const availabilityFilter = document.getElementById('availabilityFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;
        
        // **DITAMBAHKAN**: Parse sort filter
        const [sortBy, sortOrder] = sortFilter.split('_');
        const sortMap = {
            'title': 'judul',
            'year': 'tahun_terbit',
            'publisher': 'penerbit'
        };
        
        // **DITAMBAHKAN**: Build URL dengan parameter
        const params = new URLSearchParams({
            page: page,
            limit: 12
        });
        
        if (searchTerm) params.append('search', searchTerm);
        if (categoryFilter) params.append('category', categoryFilter);
        if (authorFilter) params.append('author', authorFilter);
        if (availabilityFilter) params.append('availability', availabilityFilter);
        if (sortBy) params.append('sort', sortMap[sortBy] || 'judul');
        if (sortOrder) params.append('order', sortOrder.toUpperCase());
        
        // **DITAMBAHKAN**: Fetch data dari API
        const response = await fetch(`php/get_books.php?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            displayBooks(data.data);
            updatePagination(data.pagination);
            currentPage = data.pagination.current_page;
            totalPages = data.pagination.total_pages;
        } else {
            throw new Error(data.message || 'Failed to load books');
        }
        
    } catch (error) {
        console.error('Error loading books:', error);
        showErrorState(error.message);
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// **DITAMBAHKAN**: Fungsi untuk menampilkan data buku
function displayBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    
    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-books">
                <h3>Tidak ada buku ditemukan</h3>
                <p>Coba ubah filter pencarian Anda</p>
            </div>
        `;
        return;
    }
    
    booksGrid.innerHTML = books.map(book => `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-cover">
                ${book.cover_image ? 
                    `<img src="uploads/covers/${book.cover_image}" alt="${book.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="no-cover" style="display: none;">📖</div>` 
                    : 
                    '<div class="no-cover">📖</div>'
                }
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-authors">${escapeHtml(book.publisher || 'Penerbit tidak diketahui')}</p>
                <div class="book-categories">
                    ${book.isbn ? `<span class="category-tag">ISBN: ${book.isbn}</span>` : ''}
                </div>
                <div class="book-meta">
                    <span class="book-year">${book.year || 'N/A'}</span>
                    <span class="book-stock ${book.is_available ? 'stock-available' : 'stock-unavailable'}">
                        ${book.is_available ? `Tersedia (${book.available_stock})` : 'Tidak Tersedia (0)'}
                    </span>
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary" ${!book.is_available ? 'disabled' : ''} 
                            onclick="showBorrowConfirmation(${book.id}, '${escapeHtml(book.title)}')">
                        Pinjam
                    </button>
                    <button class="btn btn-secondary" onclick="viewBookDetail(${book.id})">
                        Detail
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// **DITAMBAHKAN**: Fungsi untuk menampilkan modal konfirmasi peminjaman
// PERBAIKAN UTAMA:
function showBorrowConfirmation(bookId, bookTitle) {
    // Set variables
    currentBookId = bookId;
    currentBookTitle = bookTitle;
    
    // Set modal content
    document.getElementById('bookTitleModal').textContent = bookTitle;
    
    // Get modal
    const modal = document.getElementById('borrowModal');
    
    // Force display first
    modal.style.display = 'flex';
    
    // Then add animation class
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
}

// **DITAMBAHKAN**: Fungsi untuk menutup modal konfirmasi
function closeBorrowModal() {
    const modal = document.getElementById('borrowModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        currentBookId = null;
        currentBookTitle = null;
    }, 300);
}

// **DITAMBAHKAN**: Event listener untuk menutup modal ketika klik di luar
document.addEventListener('click', function(event) {
    const modal = document.getElementById('borrowModal');
    const modalContainer = document.querySelector('.modal-container');
    
    if (event.target === modal && !modalContainer.contains(event.target)) {
        closeBorrowModal();
    }
});

// **DITAMBAHKAN**: Event listener untuk menutup modal dengan ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('borrowModal');
        if (modal.style.display === 'flex') {
            closeBorrowModal();
        }
    }
});

// **DITAMBAHKAN**: Fungsi untuk update pagination
function updatePagination(pagination) {
    const paginationDiv = document.querySelector('.pagination');
    let paginationHTML = '';
    
    // Previous button
    if (pagination.has_prev) {
        paginationHTML += `<button onclick="changePage(${pagination.current_page - 1})">❮ Sebelumnya</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button onclick="changePage(${i})" ${i === pagination.current_page ? 'class="active"' : ''}>${i}</button>`;
    }
    
    // Next button
    if (pagination.has_next) {
        paginationHTML += `<button onclick="changePage(${pagination.current_page + 1})">Selanjutnya ❯</button>`;
    }
    
    paginationDiv.innerHTML = paginationHTML;
}

// **DITAMBAHKAN**: Fungsi helper untuk escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// **DITAMBAHKAN**: Fungsi untuk menampilkan loading state
function showLoadingState() {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Memuat data buku...</p>
        </div>
    `;
}

// **DITAMBAHKAN**: Fungsi untuk menyembunyikan loading state
function hideLoadingState() {
    // Loading state akan tergantikan oleh data atau error state
}

// **DITAMBAHKAN**: Fungsi untuk menampilkan error state
function showErrorState(message) {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = `
        <div class="error-state">
            <h3>Terjadi Kesalahan</h3>
            <p>${message}</p>
            <button onclick="loadBooks(currentPage)" class="btn btn-primary">Coba Lagi</button>
        </div>
    `;
}

// **DIPERBARUI**: Fungsi pencarian
function searchBooks() {
    currentPage = 1;
    loadBooks(currentPage);
}

// **DIPERBARUI**: Fungsi untuk ganti halaman
function changePage(page) {
    if (page === 'prev') {
        page = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
        page = Math.min(totalPages, currentPage + 1);
    }
    
    if (page !== currentPage && page >= 1 && page <= totalPages) {
        loadBooks(page);
    }
}

// **DIPERBARUI**: Fungsi untuk meminjam buku dengan konfirmasi
async function borrowBook(bookId) {
    try {
        // Tutup modal terlebih dahulu
        closeBorrowModal();
        
        // Tampilkan loading indicator
        const confirmBtn = document.getElementById('confirmBorrowBtn');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Memproses...';
        confirmBtn.disabled = true;
        
        const response = await fetch('php/borrow_book.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                book_id: bookId,
                user_id: getUserId()
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Tampilkan notifikasi sukses
            showNotification('Buku berhasil dipinjam!', 'success');
            loadBooks(currentPage); // Refresh data
        } else {
            showNotification('Gagal meminjam buku: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        showNotification('Terjadi kesalahan saat meminjam buku', 'error');
    } finally {
        // Reset tombol
        const confirmBtn = document.getElementById('confirmBorrowBtn');
        confirmBtn.textContent = 'Pinjam';
        confirmBtn.disabled = false;
    }
}

// **DITAMBAHKAN**: Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class='bx ${type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-x-circle' : 'bx-info-circle'}'></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class='bx bx-x'></i>
        </button>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Animasi masuk
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove setelah 5 detik
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// **DITAMBAHKAN**: Fungsi untuk melihat detail buku
function viewBookDetail(bookId) {
    window.location.href = `book-detail.html?id=${bookId}`;
}

// **DITAMBAHKAN**: Fungsi helper untuk mendapatkan user ID
function getUserId() {
    return localStorage.getItem('userId') || 1;
}

// **DIPERBARUI**: Event listeners untuk filter
document.getElementById('categoryFilter').addEventListener('change', function() {
    currentPage = 1;
    loadBooks(currentPage);
});

document.getElementById('authorFilter').addEventListener('change', function() {
    currentPage = 1;
    loadBooks(currentPage);
});

document.getElementById('availabilityFilter').addEventListener('change', function() {
    currentPage = 1;
    loadBooks(currentPage);
});

document.getElementById('sortFilter').addEventListener('change', function() {
    currentPage = 1;
    loadBooks(currentPage);
});

// **DIPERBARUI**: Search on Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBooks();
    }
});

// **DITAMBAHKAN**: Debounced search untuk real-time search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        loadBooks(currentPage);
    }, 500);
});

// **DIPERBARUI**: Fungsi cek admin status
function checkAdminStatus() {
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    const floatingBtn = document.getElementById('floatingAddBtn');
    if (isAdmin) {
        floatingBtn.style.display = 'block';
    } else {
        floatingBtn.style.display = 'none';
    }
}

function goToAddBook() {
    window.location.href = 'add-book.html';
}

// **DIPERBARUI**: Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    checkAdminStatus();
    loadBooks(1);
});

// **DITAMBAHKAN**: Refresh data setiap 30 detik (opsional)
setInterval(() => {
    if (!isLoading) {
        loadBooks(currentPage);
    }
}, 30000);