document.addEventListener('DOMContentLoaded', () => {

    // --- 1. KONFIGURASI & VARIABEL GLOBAL ---
    const API_URL = "http://192.168.248.194:8000/api"; 
    const ROOM_TYPE_ID = 7; // ID untuk "All In Villa Accacia"

    // --- 2. SELEKSI SEMUA ELEMEN DOM ---
    // Elemen untuk Halaman Detail & Edit Harga
    const priceDisplay = document.getElementById('detailRoomPrice');
    const editButton = document.getElementById('editPriceBtn');
    const modal = document.getElementById('editPriceModal');
    const overlay = document.getElementById('editModalOverlay');
    const editForm = document.getElementById('editPriceForm');
    const priceInput = document.getElementById('newPrice');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const modalAlert = document.getElementById('modalAlert');

    // Elemen untuk Sidebar (dari js ui)
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.sidebar .main-nav ul li');

    // --- 3. FUNGSI LOGIKA BACKEND (Mengambil & Mengirim Data) ---
    async function fetchRoomDetails() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/room-types/${ROOM_TYPE_ID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Gagal memuat data kamar.');
            
            const roomData = await response.json();
            updatePriceDisplay(roomData.price_per_night);
        } catch (error) {
            priceDisplay.textContent = 'Gagal memuat harga.';
            console.error(error);
        }
    }

    async function updateRoomPrice(newPrice) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/admin/room-types/${ROOM_TYPE_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ price_per_night: newPrice })
            });
            const result = await response.json();
            if (!response.ok) {
                const errorMessage = result.errors?.price_per_night?.[0] || result.message || 'Terjadi kesalahan.';
                throw new Error(errorMessage);
            }
            updatePriceDisplay(result.data.price_per_night);
            closeModal();
        } catch (error) {
            showModalAlert(error.message);
            console.error(error);
        }

        
    }

    // --- 4. FUNGSI LOGIKA UI & BANTUAN ---
    function updatePriceDisplay(price) {
        priceDisplay.textContent = `Harga Permalam Rp ${Number(price).toLocaleString('id-ID')}`;
    }

    function showModal() {
        if (modal && overlay) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        }
    }

    function closeModal() {
        if (modal && overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
            if (modalAlert) modalAlert.innerHTML = '';
            if (editForm) editForm.reset();
        }
    }
    
    function showModalAlert(message) {
        if (modalAlert) {
            modalAlert.innerHTML = `<div style="color: red; margin-bottom: 10px;">${message}</div>`;
        }
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
        // Jika berada di halaman detail kamar, tandai link "Room" sebagai aktif
        const isRoomDetailPage = currentPath.includes('room_accacia.html') || currentPath.includes('room_ebony.html') || currentPath.includes('room_agathis.html');

        navLinks.forEach(li => {
            const link = li.querySelector('a');
            const href = link ? link.getAttribute('href') : '';
            if (isRoomDetailPage && href.includes('room.html')) {
                li.classList.add('active');
            } else {
                 // Logika untuk halaman lain bisa ditambahkan di sini jika perlu
            }
        });
    }

    // --- 5. EVENT LISTENERS ---
    if (editButton) {
        editButton.addEventListener('click', () => {
            const currentPriceText = priceDisplay.textContent.replace(/[^0-9]/g, '');
            priceInput.value = currentPriceText;
            showModal();
        });
    }
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    if (editForm) {
        editForm.addEventListener('submit', (event) => {
            event.preventDefault();
            updateRoomPrice(priceInput.value);
        });
    }

    // Event Listeners untuk Sidebar (dari js ui)
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    if (sidebar) sidebar.addEventListener('click', e => e.stopPropagation());
    navLinks.forEach(li => li.querySelector('a').addEventListener('click', closeSidebar));

    // --- 6. INISIALISASI HALAMAN ---
    highlightActiveSidebarLink();
    fetchRoomDetails();
});
