document.addEventListener('DOMContentLoaded', () => {

    // --- 1. KONFIGURASI & VARIABEL GLOBAL ---
    const API_URL = "http://192.168.248.194:8000/api"; // Sesuaikan jika IP Anda berubah
    const VILLA_ID = 1; // ID untuk Villa Ebony
    
    // --- 2. SELEKSI SEMUA ELEMEN DOM ---
    const roomOptionsList = document.getElementById('roomOptionsList');
    // Elemen untuk Sidebar (dari js ui)
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.sidebar .main-nav ul li');

    // --- 3. FUNGSI LOGIKA BACKEND (Mengambil Data) ---
    async function fetchVillaData(villaId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Otentikasi dibutuhkan. Silakan login kembali.');
            window.location.href = '/login.html';
            return null;
        }
        try {
            const response = await fetch(`${API_URL}/villas/${villaId}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`Gagal mengambil data Villa ID ${villaId}. Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching villa data:", error);
            if (roomOptionsList) {
                roomOptionsList.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
            }
            return null;
        }
    }

    // --- 4. FUNGSI LOGIKA UI (Menampilkan & Mengelola Tampilan) ---
    function renderRoomTypes(roomTypes) {
        if (!roomOptionsList) return;
        roomOptionsList.innerHTML = '';
        if (!roomTypes || roomTypes.length === 0) {
            roomOptionsList.innerHTML = '<p style="text-align: center;">Tidak ada tipe kamar tersedia untuk villa ini.</p>';
            return;
        }
        roomTypes.forEach(room => {
            const roomItem = document.createElement('div');
            roomItem.className = 'room-option-item';
            roomItem.dataset.roomId = room.id;
            roomItem.innerHTML = `
                <div class="room-option-details">
                    <h6>${room.name}</h6>
                    <p class="sub-info"><i class="fas fa-info-circle"></i> ${room.is_all_in ? 'Seluruh unit Villa' : `Kamar untuk ${room.capacity_per_room} orang`}</p>
                </div>
                <div class="room-option-capacity"><i class="fas fa-user-friends"></i> ${room.capacity_per_room}</div>
                <div class="room-option-price-action">
                    <span class="current-price">Rp ${Number(room.price_per_night).toLocaleString('id-ID')}</span>
                    <button class="btn-select-room">Pilih</button>
                </div>
            `;
            roomOptionsList.appendChild(roomItem);
        });
    }

    // Fungsi untuk Sidebar (dari js ui)
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
        const currentPath = window.location.pathname;
        navLinks.forEach(li => {
            const link = li.querySelector('a');
            if (link && link.getAttribute('href').includes(currentPath.split('/').pop())) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    // --- 5. EVENT LISTENERS (Menghubungkan Aksi Pengguna) ---
    if (roomOptionsList) {
        roomOptionsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-select-room')) {
                const roomItem = event.target.closest('.room-option-item');
                const selectedRoomId = roomItem.dataset.roomId;
                if (selectedRoomId) {
                    localStorage.setItem('selectedRoomTypeId', selectedRoomId);
                    alert(`Anda memilih kamar dengan ID: ${selectedRoomId}. \nSekarang Anda akan diarahkan ke form pengisian data.`);
                    window.location.href = `formpemesanan_admin.html`;
                }
            }
        });
    }

    // Event Listeners untuk Sidebar (dari js ui)
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    if (sidebar) sidebar.addEventListener('click', e => e.stopPropagation());
    navLinks.forEach(link => link.addEventListener('click', closeSidebar));

    // --- 6. INISIALISASI HALAMAN ---
    async function initializePage() {
        if (!localStorage.getItem('authToken')) {
            alert('Otentikasi dibutuhkan.');
            window.location.href = '/login.html';
            return;
        }
        
        // Inisialisasi UI
        highlightActiveSidebarLink();

        // Inisialisasi Data
        const villaData = await fetchVillaData(VILLA_ID);
        if (villaData && villaData.room_types) {
            renderRoomTypes(villaData.room_types);
        }
    }

    // Jalankan semuanya
    initializePage();
});
