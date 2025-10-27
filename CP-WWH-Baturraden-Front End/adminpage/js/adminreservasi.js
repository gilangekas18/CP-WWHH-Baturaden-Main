document.addEventListener('DOMContentLoaded', function () {
    const API_URL = "http://localhost:8000/api";

    // --- 4. SELEKSI SEMUA ELEMEN DOM -----------------------------------
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

    //fitur download, secarh, date
    const dateFilterInput = document.querySelector('.date-filter input');
    const downloadBtn = document.querySelector('.download-btn');

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

    // Variabel global untuk menyimpan data dari API
    let allBookings = [];

    // --- 1. KEAMANAN & INISIALISASI DASAR ------------------------------
    // Cek otentikasi sebelum menjalankan kode apapun
    if (!localStorage.getItem('authToken')) {
        alert('Anda harus login sebagai admin untuk mengakses halaman ini.');
        window.location.href = '/includes/login.html'; 
        return;
    }

    // --- 2. FUNGSI-FUNGSI API (Komunikasi dengan Backend) --------------

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

    // --- Fungsi ambil tanggal dari input text ---
    function getFilterDate() {
        if (!dateFilterInput || !dateFilterInput.value) return null;
        // Format input: "20 Jan - 20 Jan 2025" => ambil tanggal awal
        const dateStr = dateFilterInput.value.split('-')[0].trim();
        return new Date(dateStr);
    }

    // --- Fungsi filter data berdasarkan pencarian dan tanggal ---
    window.applyFilters = function () {
        if (!allBookings) return allBookings;

        const searchTerm = searchInput.value.toLowerCase();
        const filterDate = getFilterDate();

        // Jika tidak ada search dan tidak ada filter tanggal, tampilkan semua
        if (!searchTerm && !filterDate) {
            renderTable(allBookings);
            return allBookings;
        }

        const filtered = allBookings.filter(b => {
            const matchesName = searchTerm
                ? b.booker_name && b.booker_name.toLowerCase().includes(searchTerm)
                : true;

            let matchesDate = true;
            if (filterDate) {
                const checkIn = new Date(b.check_in_date);
                matchesDate = checkIn.toDateString() === filterDate.toDateString();
            }

            return matchesName && matchesDate;
        });

        renderTable(filtered);
        return filtered; // Mengembalikan data yang sedang tampil
    }

    // --- Event Listener untuk pencarian dan tanggal ---
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilterInput) dateFilterInput.addEventListener('input', applyFilters);

    // --- Fungsi Download CSV ---
    function downloadCSV(data) {
        if (!data || data.length === 0) {
            alert('Tidak ada data untuk diunduh.');
            return;
        }

        const headers = ["ID", "Booker Name", "Phone", "Room", "Check-in", "Check-out", "Price", "Status"];
        const rows = data.map(b => [
            b.id,
            b.booker_name || '',
            b.booker_phone || '',
            b.room_type ? `${b.num_rooms}x ${b.room_type.name}` : '',
            b.check_in_date,
            b.check_out_date,
            b.total_price,
            b.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "reservations.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Event Listener tombol Download ---
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const filteredData = applyFilters(); // ambil data hasil filter terakhir
            downloadCSV(filteredData);
        });
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
    // --- 3. FUNGSI-FUNGSI UI & BANTUAN (Helpers) -----------------------

    // --- Fungsi untuk Tabel Data ---
    function renderTable(bookings) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (!Array.isArray(bookings) || bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Tidak ada data reservasi ditemukan.</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const status = (booking.status || 'pending').toLowerCase();
        const row = document.createElement('tr');
        row.dataset.id = booking.id;
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>
                <div>${booking.booker_name || '-'}</div>
                <small>${booking.booker_phone || '-'}</small>
            </td>
            <td>${booking.room_type ? booking.room_type.name : '-'}</td>
            <td>${formatDate(booking.check_in_date)}</td>
            <td>${formatDate(booking.check_out_date)}</td>
            <td>${formatCurrency(booking.total_price)}</td>
            <td><span class="status-badge ${status}">${booking.status || '-'}</span></td>
            <td>${booking.num_rooms || 0}</td>
            <td>${booking.num_guests || 0}</td>
            <td>
                <button class="action-btn update-btn" data-id="${booking.id}" data-status="${booking.status}" title="Update Status"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${booking.id}" title="Delete Booking"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// === Klik baris untuk menampilkan detail ===
if (tableBody) {
    tableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (!row) return;

        const bookingId = row.dataset.id;
        const selectedBooking = allBookings.find(b => b.id == bookingId);
        if (!selectedBooking) return;

        // Hapus detail lain jika ada
        document.querySelectorAll('.detail-row').forEach(r => r.remove());

        // Jika sudah terbuka, tutup
        const existing = document.querySelector(`#detail-row-${bookingId}`);
        if (existing) {
            existing.remove();
            return;
        }

        // Ambil relasi payment (kalau ada)
        const payment = selectedBooking.payment || null;
        const paymentMethod = payment?.method ? payment.method.toUpperCase() : '-';
        const paymentStatus = payment?.status || '-';
        const paymentProof = payment?.proof_of_payment || null;

        // Buat baris detail
        const detailRow = document.createElement('tr');
        detailRow.classList.add('detail-row');
        detailRow.id = `detail-row-${bookingId}`;
        detailRow.innerHTML = `
            <td colspan="10" style="background-color:#f9f9f9;">
                <div style="padding:10px; line-height:1.6;">
                    <h5 style="margin-bottom:8px;">📋 Detail Lengkap Reservasi</h5>
                    <strong>ID Booking:</strong> ${selectedBooking.id}<br>
                    <strong>Nama Pemesan:</strong> ${selectedBooking.booker_name || '-'}<br>
                    <strong>Email Pemesan:</strong> ${selectedBooking.booker_email || '-'}<br>
                    <strong>No. Telepon:</strong> ${selectedBooking.booker_phone || '-'}<br>
                    <strong>Tamu Lain (Jika Ada):</strong> ${selectedBooking.guest_name || '-'}<br>
                    <strong>Tipe Kamar:</strong> ${selectedBooking.room_type?.name || '-'}<br>
                    <strong>Check-in:</strong> ${formatDate(selectedBooking.check_in_date)}<br>
                    <strong>Check-out:</strong> ${formatDate(selectedBooking.check_out_date)}<br>
                    <strong>Jumlah Kamar:</strong> ${selectedBooking.num_rooms}<br>
                    <strong>Jumlah Tamu:</strong> ${selectedBooking.num_guests}<br>
                    <strong>Harga Total:</strong> ${formatCurrency(selectedBooking.total_price)}<br>
                    <strong>Status Reservasi:</strong> ${selectedBooking.status}<br>
                    <hr>
                    <h5 style="margin-bottom:8px;">💳 Detail Pembayaran</h5>
                    <strong>Metode:</strong> ${paymentMethod}<br>
                    <strong>Status Pembayaran:</strong> ${paymentStatus}<br>
                    ${
                        paymentProof
                        ? `<div style="margin-top:8px;">
                                <strong>Bukti Pembayaran:</strong><br>
                                <img src="/storage/${paymentProof}" alt="Bukti Pembayaran" width="200" style="border:1px solid #ccc; margin-top:5px;">
                            </div>`
                        : '<em>Tidak ada bukti pembayaran.</em>'
                    }
                </div>
            </td>
        `;

        // Sisipkan baris di bawah data utama
        row.insertAdjacentElement('afterend', detailRow);
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



    // --- 5. SETUP SEMUA EVENT LISTENER ---------------------------------

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
        button.addEventListener('click', function () {
            const villaCard = this.closest('.villa-card');
            const villaName = villaCard.querySelector('h4').textContent.trim();
            let destinationFile = '';

            if (villaName === 'Villa Ebony') destinationFile = 'addadmin_ebony.html';
            else if (villaName === 'Villa Acacia') destinationFile = 'addadmin_accacia.html';
            else if (villaName === 'Villa Agathis') destinationFile = 'addadmin_agathis.html';

            if (destinationFile) window.location.href = destinationFile;
        });
    });

    // --- 6. INISIALISASI HALAMAN ---------------------------------------

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