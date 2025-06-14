const fileInput = document.getElementById('bookCover');
const fileUploadArea = document.getElementById('fileUploadArea');
const filePreview = document.getElementById('filePreview');
const previewImage = document.getElementById('previewImage');
const removeFile = document.getElementById('removeFile');
const authorSelect = document.getElementById('bookAuthor');
const addNewAuthorBtn = document.getElementById('addNewAuthorBtn');

// ISBN Auto-fill functionality
const isbnInput = document.getElementById('isbnSearch');
const fetchBookBtn = document.getElementById('fetchBookBtn');
const isbnStatus = document.getElementById('isbnStatus');

let isUpdatingExisting = false;
let currentBookData = null;


fileUploadArea.addEventListener('click', () => fileInput.click());

fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('drag-over');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('drag-over');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

removeFile.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    filePreview.style.display = 'none';
    document.querySelector('.file-upload-content').style.display = 'block';
});

function handleFileUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        filePreview.style.display = 'block';
        document.querySelector('.file-upload-content').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// ISBN Fetch functionality
fetchBookBtn.addEventListener('click', fetchBookData);

isbnInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchBookData();
    }
});

async function fetchBookData() {
    const isbn = isbnInput.value.trim();
    
    if (!isbn) {
        showIsbnStatus('error', 'Masukkan ISBN terlebih dahulu');
        return;
    }
    
    showIsbnStatus('loading', 'Mencari data buku...');
    fetchBookBtn.disabled = true;
    fetchBookBtn.classList.add('loading');
    fetchBookBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Mencari...';
    
    try {
        const response = await fetch('php/fetch_isbn.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isbn: isbn })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentBookData = data.data;
            isUpdatingExisting = data.source === 'database';
            
            // Fill form with fetched data
            fillFormWithBookData(data.data);
            
            if (isUpdatingExisting) {
                showIsbnStatus('success', 'Buku ditemukan di database. Data akan diperbarui saat disimpan.');
            } else {
                showIsbnStatus('success', 'Data buku berhasil ditemukan dari Google Books');
            }
        } else {
            showIsbnStatus('error', data.message || 'Gagal mengambil data buku');
        }
    } catch (error) {
        console.error('Error fetching book data:', error);
        showIsbnStatus('error', 'Terjadi kesalahan saat mengambil data');
    } finally {
        fetchBookBtn.disabled = false;
        fetchBookBtn.classList.remove('loading');
        fetchBookBtn.innerHTML = '<i class="bx bx-search"></i> Cari Data';
    }
}

function fillFormWithBookData(bookData) {
    // Fill form fields
    document.getElementById('bookTitle').value = bookData.title || '';
    document.getElementById('bookISBN').value = bookData.isbn || '';
    document.getElementById('bookAuthor').value = bookData.authors || '';
    document.getElementById('bookPublisher').value = bookData.publisher || '';
    document.getElementById('bookDescription').value = bookData.description || '';
    document.getElementById('bookYear').value = bookData.year || '';
    

    // Set pages if available
    if (bookData.pageCount) {
        const pagesField = document.getElementById('bookPages');
        if (pagesField) {
            pagesField.value = bookData.pageCount;
        }
    }
    
    // Handle cover image
    if (bookData.imageLinks && bookData.imageLinks.thumbnail) {
        loadCoverFromUrl(bookData.imageLinks.thumbnail);
    }
}

function loadCoverFromUrl(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        previewImage.src = imageUrl;
        filePreview.style.display = 'block';
        document.querySelector('.file-upload-content').style.display = 'none';
    };
    img.onerror = function() {
        console.log('Could not load cover image from URL');
    };
    img.src = imageUrl;
}

function showIsbnStatus(type, message) {
    isbnStatus.className = `isbn-status ${type}`;
    isbnStatus.textContent = message;
}

// Form submission
document.getElementById('addBookForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['bookTitle', 'bookYear', 'bookISBN'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#dc2626';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });

    if (!isValid) {
        alert('Mohon lengkapi semua field yang wajib diisi (*)');
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('title', document.getElementById('bookTitle').value);
    formData.append('isbn', document.getElementById('bookISBN').value);
    formData.append('author', document.getElementById('bookAuthor').value);
    formData.append('publisher', document.getElementById('bookPublisher').value);
    formData.append('year', document.getElementById('bookYear').value);
    formData.append('category', document.getElementById('bookCategory').value);
    formData.append('stock', document.getElementById('bookStock').value);
    formData.append('description', document.getElementById('bookDescription').value);
    
    
    // Add cover image if uploaded
    if (fileInput.files && fileInput.files[0]) {
        formData.append('cover', fileInput.files[0]);
    }

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';
    
    try {
        const response = await fetch('php/save_book.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            
            // Reset form after successful submission
            resetForm();
            
            // Clear ISBN search
            isbnInput.value = '';
            showIsbnStatus('', '');
            isUpdatingExisting = false;
            currentBookData = null;
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Terjadi kesalahan saat menyimpan buku');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function resetForm() {
    document.getElementById('addBookForm').reset();
    filePreview.style.display = 'none';
    document.querySelector('.file-upload-content').style.display = 'block';
    document.getElementById('previewSection').style.display = 'none';
    
    // Reset border colors
    const inputs = document.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => input.style.borderColor = '');
    
    // Reset ISBN section
    isbnInput.value = '';
    showIsbnStatus('', '');
    isUpdatingExisting = false;
    currentBookData = null;
}

function previewBook() {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const year = document.getElementById('bookYear').value;
    const category = document.getElementById('bookCategory');
    const stock = document.getElementById('bookStock').value;
    const description = document.getElementById('bookDescription').value;
    const publisher = document.getElementById('bookPublisher').value;
    const isbn = document.getElementById('bookISBN').value;
    
    // Get pages value if field exists
    let pages = '';
    const pagesField = document.getElementById('bookPages');
    if (pagesField) {
        pages = pagesField.value;
    }

    if (!title || !author || !year) {
        alert('Mohon isi setidaknya Judul, Pengarang, dan Tahun untuk preview');
        return;
    }

    // Update preview
    document.getElementById('previewBookTitle').textContent = title || '-';
    document.getElementById('previewBookAuthor').textContent = author || '-';
    document.getElementById('previewYear').textContent = year || '-';
    document.getElementById('previewStock').textContent = stock ? `Tersedia (${stock})` : 'Tersedia (-)';
    document.getElementById('previewDescription').textContent = description || 'Tidak ada deskripsi';
    document.getElementById('previewPublisher').textContent = publisher || '-';
    document.getElementById('previewISBN').textContent = isbn || '-';
    document.getElementById('previewPages').textContent = pages || '-';
    
    // Update category
    const categoryText = category.options[category.selectedIndex].text;
    document.getElementById('previewCategory').textContent = categoryText !== 'Pilih Kategori' ? categoryText : '-';

    // Update cover preview
    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewCover').src = e.target.result;
            document.getElementById('previewCover').style.display = 'block';
            document.getElementById('noCoverPreview').style.display = 'none';
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else if (previewImage.src && previewImage.src !== '') {
        // Use existing preview image (from ISBN fetch)
        document.getElementById('previewCover').src = previewImage.src;
        document.getElementById('previewCover').style.display = 'block';
        document.getElementById('noCoverPreview').style.display = 'none';
    } else {
        document.getElementById('previewCover').style.display = 'none';
        document.getElementById('noCoverPreview').style.display = 'flex';
    }

    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}


// Add this to your existing JavaScript file

// Delete Book functionality
const deleteBtn = document.getElementById('deleteBtn');

deleteBtn.addEventListener('click', deleteBook);

async function deleteBook() {
    const isbn = document.getElementById('bookISBN').value.trim();
    
    if (!isbn) {
        alert('Masukkan ISBN buku yang akan dihapus terlebih dahulu');
        return;
    }
    
    // Confirmation dialog
    const bookTitle = document.getElementById('bookTitle').value || 'buku dengan ISBN ' + isbn;
    const confirmDelete = confirm(
        `Apakah Anda yakin ingin menghapus "${bookTitle}"?\n\n` +
        'Tindakan ini tidak dapat dibatalkan.'
    );
    
    if (!confirmDelete) {
        return;
    }
    
    // Show loading state
    const originalText = deleteBtn.textContent;
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Menghapus...';
    
    try {
        const formData = new FormData();
        formData.append('isbn', isbn);
        
        const response = await fetch('php/delete_book.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            
            // Reset form after successful deletion
            resetForm();
            
            // Clear ISBN search
            isbnInput.value = '';
            showIsbnStatus('success', 'Buku berhasil dihapus');
            isUpdatingExisting = false;
            currentBookData = null;
            
            // Optional: Redirect or refresh page
            // window.location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Terjadi kesalahan saat menghapus buku');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="bx bx-trash"></i> Hapus Buku';
    }
}

// Optional: Add confirmation when ISBN is found
function showDeleteConfirmation(bookData) {
    if (bookData) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.classList.add('show');
    } else {
        deleteBtn.style.display = 'none';
        deleteBtn.classList.remove('show');
    }
}

// Update your existing fetchBookData function to show/hide delete button
// Add this line in your fetchBookData function after successful fetch:
// showDeleteConfirmation(data.data);

// Load authors from database
async function loadAuthors() {
    try {
        const response = await fetch('php/get-authors.php');
        const result = await response.json();
        
        if (result.success) {
            // Clear existing options except the first one
            authorSelect.innerHTML = '<option value="">Pilih Pengarang</option>';
            
            // Add authors to select
            result.data.forEach(author => {
                const option = document.createElement('option');
                option.value = author.id;
                option.textContent = author.name;
                authorSelect.appendChild(option);
            });
        } else {
            console.error('Error loading authors:', result.message);
        }
    } catch (error) {
        console.error('Error loading authors:', error);
    }
}

// Add new author functionality
addNewAuthorBtn.addEventListener('click', showAddAuthorModal);

function showAddAuthorModal() {
    const authorName = prompt('Masukkan nama pengarang baru:');
    
    if (!authorName || !authorName.trim()) {
        return;
    }
    
    const biografi = prompt('Masukkan biografi pengarang (opsional):') || '';
    
    addNewAuthor(authorName.trim(), biografi.trim());
}

async function addNewAuthor(nama_pengarang, biografi = '') {
    try {
        const response = await fetch('php/add_author.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nama_pengarang: nama_pengarang,
                biografi: biografi
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add new author to select
            const option = document.createElement('option');
            option.value = result.data.id;
            option.textContent = result.data.name;
            authorSelect.appendChild(option);
            
            // Select the newly added author
            authorSelect.value = result.data.id;
            
            alert(result.message);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding author:', error);
        alert('Terjadi kesalahan saat menambahkan pengarang');
    }
}

// Update the fillFormWithBookData function to handle author selection
function fillFormWithBookData(bookData) {
    // Fill form fields
    document.getElementById('bookTitle').value = bookData.title || '';
    document.getElementById('bookISBN').value = bookData.isbn || '';
    document.getElementById('bookPublisher').value = bookData.publisher || '';
    document.getElementById('bookDescription').value = bookData.description || '';
    document.getElementById('bookYear').value = bookData.year || '';
    
    // Handle authors - if from Google Books, we need to match or create new author
    if (bookData.authors) {
        handleAuthorFromISBN(bookData.authors);
    }

    // Set pages if available
    if (bookData.pageCount) {
        const pagesField = document.getElementById('bookPages');
        if (pagesField) {
            pagesField.value = bookData.pageCount;
        }
    }
    
    // Handle cover image
    if (bookData.imageLinks && bookData.imageLinks.thumbnail) {
        loadCoverFromUrl(bookData.imageLinks.thumbnail);
    }
}

// Handle author selection from ISBN data
function handleAuthorFromISBN(authorsString) {
    const authors = authorsString.split(',').map(author => author.trim());
    const firstAuthor = authors[0];
    
    // Try to find matching author in dropdown
    let foundMatch = false;
    for (let option of authorSelect.options) {
        if (option.text.toLowerCase().includes(firstAuthor.toLowerCase()) || 
            firstAuthor.toLowerCase().includes(option.text.toLowerCase())) {
            authorSelect.value = option.value;
            foundMatch = true;
            break;
        }
    }
    
    // If no match found, ask user if they want to add new author
    if (!foundMatch) {
        const addNew = confirm(
            `Pengarang "${firstAuthor}" tidak ditemukan dalam database.\n\n` +
            'Apakah Anda ingin menambahkannya sebagai pengarang baru?'
        );
        
        if (addNew) {
            addNewAuthor(firstAuthor);
        }
    }
}

// Update form submission to use author_id instead of author name
document.getElementById('addBookForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['bookTitle', 'bookYear', 'bookISBN', 'bookAuthor'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#dc2626';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });

    if (!isValid) {
        alert('Mohon lengkapi semua field yang wajib diisi (*)');
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('title', document.getElementById('bookTitle').value);
    formData.append('isbn', document.getElementById('bookISBN').value);
    formData.append('author_id', document.getElementById('bookAuthor').value); // Send author_id instead of name
    formData.append('publisher', document.getElementById('bookPublisher').value);
    formData.append('year', document.getElementById('bookYear').value);
    formData.append('category', document.getElementById('bookCategory').value);
    formData.append('stock', document.getElementById('bookStock').value);
    formData.append('description', document.getElementById('bookDescription').value);
    
    // Add pages if field exists
    const pagesField = document.getElementById('bookPages');
    if (pagesField && pagesField.value) {
        formData.append('pages', pagesField.value);
    }
    
    // Add cover image if uploaded
    if (fileInput.files && fileInput.files[0]) {
        formData.append('cover', fileInput.files[0]);
    }

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';
    
    try {
        const response = await fetch('php/save_book.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            
            // Reset form after successful submission
            resetForm();
            
            // Clear ISBN search
            isbnInput.value = '';
            showIsbnStatus('', '');
            isUpdatingExisting = false;
            currentBookData = null;
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Terjadi kesalahan saat menyimpan buku');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Update preview function to show author name instead of ID
function previewBook() {
    const title = document.getElementById('bookTitle').value;
    const authorSelect = document.getElementById('bookAuthor');
    const authorText = authorSelect.options[authorSelect.selectedIndex].text;
    const year = document.getElementById('bookYear').value;
    const category = document.getElementById('bookCategory');
    const stock = document.getElementById('bookStock').value;
    const description = document.getElementById('bookDescription').value;
    const publisher = document.getElementById('bookPublisher').value;
    const isbn = document.getElementById('bookISBN').value;
    
    // Get pages value if field exists
    let pages = '';
    const pagesField = document.getElementById('bookPages');
    if (pagesField) {
        pages = pagesField.value;
    }

    if (!title || !authorSelect.value || !year) {
        alert('Mohon isi setidaknya Judul, Pengarang, dan Tahun untuk preview');
        return;
    }

    // Update preview
    document.getElementById('previewBookTitle').textContent = title || '-';
    document.getElementById('previewBookAuthor').textContent = (authorText !== 'Pilih Pengarang') ? authorText : '-';
    document.getElementById('previewYear').textContent = year || '-';
    document.getElementById('previewStock').textContent = stock ? `Tersedia (${stock})` : 'Tersedia (-)';
    document.getElementById('previewDescription').textContent = description || 'Tidak ada deskripsi';
    document.getElementById('previewPublisher').textContent = publisher || '-';
    document.getElementById('previewISBN').textContent = isbn || '-';
    document.getElementById('previewPages').textContent = pages || '-';
    
    // Update category
    const categoryText = category.options[category.selectedIndex].text;
    document.getElementById('previewCategory').textContent = categoryText !== 'Pilih Kategori' ? categoryText : '-';

    // Update cover preview
    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewCover').src = e.target.result;
            document.getElementById('previewCover').style.display = 'block';
            document.getElementById('noCoverPreview').style.display = 'none';
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else if (previewImage.src && previewImage.src !== '') {
        // Use existing preview image (from ISBN fetch)
        document.getElementById('previewCover').src = previewImage.src;
        document.getElementById('previewCover').style.display = 'block';
        document.getElementById('noCoverPreview').style.display = 'none';
    } else {
        document.getElementById('previewCover').style.display = 'none';
        document.getElementById('noCoverPreview').style.display = 'flex';
    }

    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

// Load authors when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAuthors();
}); 