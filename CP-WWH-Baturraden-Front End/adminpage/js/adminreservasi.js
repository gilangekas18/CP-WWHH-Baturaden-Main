// =======================================================================
// === FILE JAVASCRIPT GABUNGAN UNTUK HALAMAN RESERVASI ADMIN ==========
// =======================================================================
document.addEventListener('DOMContentLoaded', function () {

    // -------------------------------------------------------------------
    // --- 1. KEAMANAN & INISIALISASI DASAR ------------------------------
    // -------------------------------------------------------------------

    // Cek otentikasi sebelum menjalankan kode apapun
    if (!localStorage.getItem('authToken')) {
        alert('Anda harus login sebagai admin untuk mengakses halaman ini.');
        window.location.href = '/login.html'; // Ganti dengan halaman login Anda
        return;
    }

    // Variabel global untuk menyimpan data dari API
    let allBookings = [];
    const API_URL = "http://192.168.248.194:8000/api"; // Sesuaikan jika perlu


    // -------------------------------------------------------------------
    // --- 2. FUNGSI-FUNGSI API (Komunikasi dengan Backend) --------------
    // -------------------------------------------------------------------

    async function fetchAllBookings() {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Admin authentication required.');

        const response = await fetch(`${API_URL}/admin/bookings`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('Akses ditolak. Pastikan Anda login dengan akun admin.');
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengambil data booking.');
        }
        return await response.json();
    }

    async function updateBookingStatus(bookingId, newStatus) {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Admin authentication required.');

        const response = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Gagal mengupdate status.');
        }
        return await response.json();
    }

    async function deleteBooking(bookingId) {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Admin authentication required.');

        const response = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal menghapus booking.');
        return await response.json();
    }


    // -------------------------------------------------------------------
    // --- 3. FUNGSI-FUNGSI UI & BANTUAN (Helpers) -----------------------
    // -------------------------------------------------------------------

    // --- Fungsi untuk Tabel Data ---
    function renderTable(bookings) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Tidak ada data reservasi ditemukan.</td></tr>';
            return;
        }
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const status = (booking.status || 'pending').toLowerCase();
            row.innerHTML = `
                <td data-label="ID"><strong>${booking.id}</strong></td>
                <td data-label="Booker Details"><div>${booking.booker_name || 'N/A'}</div><small>${booking.booker_phone || ''}</small></td>
                <td data-label="Room Details">${booking.room_type ? `${booking.num_rooms}x ${booking.room_type.name}` : 'N/A'}</td>
                <td data-label="Check-in">${formatDate(booking.check_in_date)}</td>
                <td data-label="Check-out">${formatDate(booking.check_out_date)}</td>
                <td data-label="Price">${formatCurrency(booking.total_price)}</td>
                <td data-label="Status"><span class="status-badge ${status}">${booking.status}</span></td>
                <td data-label="Actions">
                    <button class="action-btn update-btn" data-id="${booking.id}" data-status="${booking.status}" title="Update Status"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${booking.id}" title="Delete Booking"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- Fungsi untuk Modal Update ---
    function openUpdateModal(bookingId, currentStatus) {
        if (updateModal && updateModalOverlay && modalBookingIdText && hiddenBookingIdInput && statusSelect) {
            hiddenBookingIdInput.value = bookingId;
            modalBookingIdText.textContent = bookingId;
            statusSelect.value = currentStatus;
            updateModal.classList.add('active');
            updateModalOverlay.classList.add('active');
        }
    }

    function closeUpdateModal() {
        if (updateModal && updateModalOverlay) {
            updateModal.classList.remove('active');
            updateModalOverlay.classList.remove('active');
        }
    }
    
    // --- Fungsi untuk Modal Add Booking (Villa) ---
    function openVillaModal() {
        if (selectVillaModal && addBookingModalOverlay) {
            selectVillaModal.classList.add('active');
            addBookingModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeVillaModal() {
        if (selectVillaModal && addBookingModalOverlay) {
            selectVillaModal.classList.remove('active');
            addBookingModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // --- Fungsi untuk Sidebar ---
    function openSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function highlightActiveSidebarLink() {
        const currentPath = window.location.pathname.split('/').pop();
        navLinks.forEach(li => {
            const link = li.querySelector('a');
            if (link) {
                const hrefPath = link.getAttribute('href');
                if (hrefPath && hrefPath.split('/').pop() === currentPath) {
                    li.classList.add('active');
                } else {
                    li.classList.remove('active');
                }
            }
        });
    }

    // --- Fungsi Bantuan Lainnya ---
    function showAlert(type, message) {
        if (alertContainer) {
            alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            setTimeout(() => alertContainer.innerHTML = '', 5000);
        }
    }
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function formatCurrency(number) {
        if (isNaN(number)) return 'N/A';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }


    // -------------------------------------------------------------------
    // --- 4. SELEKSI SEMUA ELEMEN DOM -----------------------------------
    // -------------------------------------------------------------------

    // Elemen untuk Data & Notifikasi
    const tableBody = document.getElementById('reservation-table-body');
    const alertContainer = document.getElementById('alert-container');
    const searchInput = document.getElementById('searchInput');

    // Elemen untuk Sidebar
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('overlay'); // Overlay umum untuk sidebar
    const navLinks = document.querySelectorAll('.sidebar .main-nav ul li');

    // Elemen untuk Modal Update Status
    const updateModal = document.getElementById('updateStatusModal');
    const updateModalOverlay = document.getElementById('updateModalOverlay');
    const closeUpdateModalBtn = document.getElementById('closeUpdateModal');
    const updateForm = document.getElementById('updateStatusForm');
    const hiddenBookingIdInput = document.getElementById('hiddenBookingId');
    const modalBookingIdText = document.getElementById('modalBookingId');
    const statusSelect = document.getElementById('bookingStatus');

    // Elemen untuk Modal Add Booking (Villa)
    const addBookingBtn = document.getElementById('addBookingBtn');
    const selectVillaModal = document.getElementById('selectVillaModal');
    const closeVillaModalBtn = document.getElementById('closeVillaModal');
    const addBookingModalOverlay = document.getElementById('addBookingModalOverlay'); // Overlay khusus modal
    const selectVillaButtons = document.querySelectorAll('.villa-card .select-villa-btn');


    // -------------------------------------------------------------------
    // --- 5. SETUP SEMUA EVENT LISTENER ---------------------------------
    // -------------------------------------------------------------------

    // Listener untuk aksi pada Tabel Reservasi (Update & Delete)
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const bookingId = button.dataset.id;
            if (button.classList.contains('update-btn')) {
                openUpdateModal(bookingId, button.dataset.status);
            } else if (button.classList.contains('delete-btn')) {
                handleDelete(bookingId);
            }
        });
    }

    // Listener untuk Form Update Status
    if (updateForm) {
        updateForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const bookingId = hiddenBookingIdInput.value;
            const newStatus = statusSelect.value;
            try {
                await updateBookingStatus(bookingId, newStatus);
                showAlert('success', `Status Booking ID ${bookingId} berhasil diperbarui.`);
                closeUpdateModal();
                loadBookings();
            } catch (error) {
                showAlert('danger', `Gagal memperbarui status: ${error.message}`);
            }
        });
    }

    // Listener untuk Pencarian
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredBookings = allBookings.filter(b => b.booker_name && b.booker_name.toLowerCase().includes(searchTerm));
            renderTable(filteredBookings);
        });
    }
    
    // Listener untuk Sidebar
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    if (sidebar) sidebar.addEventListener('click', e => e.stopPropagation());
    navLinks.forEach(link => link.addEventListener('click', closeSidebar));

    // Listener untuk Modal Update Status (Tombol Close)
    if (closeUpdateModalBtn) closeUpdateModalBtn.addEventListener('click', closeUpdateModal);
    if (updateModalOverlay) updateModalOverlay.addEventListener('click', closeUpdateModal);

    // Listener untuk Modal Add Booking (Villa)
    if (addBookingBtn) addBookingBtn.addEventListener('click', openVillaModal);
    if (closeVillaModalBtn) closeVillaModalBtn.addEventListener('click', closeVillaModal);
    if (addBookingModalOverlay) addBookingModalOverlay.addEventListener('click', closeVillaModal);
    if (selectVillaModal) selectVillaModal.addEventListener('click', e => e.stopPropagation());

    // Listener untuk tombol-tombol pilih villa di dalam modal
    selectVillaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const villaCard = this.closest('.villa-card');
            const villaName = villaCard.querySelector('h4').textContent.trim();
            let destinationFile = '';

            if (villaName === 'Villa Ebony') destinationFile = 'addadmin_ebony.html';
            else if (villaName === 'Villa Acacia') destinationFile = 'addadmin_accacia.html';
            else if (villaName === 'Villa Agathis') destinationFile = 'addadmin_agathis.html';
            
            if (destinationFile) window.location.href = destinationFile;
        });
    });

    
    // -------------------------------------------------------------------
    // --- 6. INISIALISASI HALAMAN ---------------------------------------
    // -------------------------------------------------------------------

    async function loadBookings() {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Memuat data...</td></tr>`;
        try {
            allBookings = await fetchAllBookings();
            renderTable(allBookings);
        } catch (error) {
            showAlert('danger', `Gagal memuat data: ${error.message}`);
        }
    }
    
    // Jalankan fungsi-fungsi yang perlu dieksekusi saat halaman pertama kali dimuat
    highlightActiveSidebarLink();
    loadBookings();

});