document.addEventListener('DOMContentLoaded', () => {

    // --- 1. KONFIGURASI & VARIABEL GLOBAL ---
    const API_URL = "http://192.168.248.194:8000/api"; 
    const ROOM_TYPE_ID = 6; // ID untuk "All In Villa Agathis"

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
    const detailRoomName = document.getElementById('detailRoomName');
    const detailRoomImage = document.getElementById('detailRoomImage');
    const detailFacilitiesList = document.getElementById('detailFacilitiesList');


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
            // Panggil fungsi untuk merender semua detail, bukan hanya harga
            renderRoomDetails(roomData);

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
    
    // Fungsi baru untuk merender semua detail kamar
    function renderRoomDetails(room) {
        if (!room) return;

        detailRoomName.textContent = room.name;
        // Anda bisa menambahkan path gambar ke model/controller jika perlu
        // detailRoomImage.src = room.image_path; 
        updatePriceDisplay(room.price_per_night);

        // Daftar fasilitas statis bisa diganti dengan data dari API jika ada
        const facilities = [
            "6 Kamar", "Akses Seluruh Fasilitas Villa", "Ideal untuk Rombongan/Acara",
            "Free Breakfast", "Free Tiket WWH", "WiFi", "Pantry", "Hot Shower",
            "Bath Amenities", "Teko Pemanas Air", "LED TV", "Air Mineral",
            "Resepsionis 24 Jam", "Keamanan 24 Jam", "Parkiran Luas"
        ];

        detailFacilitiesList.innerHTML = '';
        facilities.forEach(facilityText => {
            const span = document.createElement('span');
            // Logika ikon tetap sama
            const icon = document.createElement('i');
            let iconClass = 'fas fa-check-circle'; // default icon
            // (Tambahkan logika switch case untuk ikon di sini jika perlu)
            icon.className = iconClass;
            span.appendChild(icon);
            span.appendChild(document.createTextNode(" " + facilityText));
            detailFacilitiesList.appendChild(span);
        });
    }

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
        const isRoomDetailPage = currentPath.includes('room_agathis.html');

        navLinks.forEach(li => {
            const link = li.querySelector('a');
            const href = link ? link.getAttribute('href') : '';
            
            // Logika untuk menandai link "Room" sebagai aktif
            if (isRoomDetailPage && href.includes('room_agathis.html')) {
                 li.classList.add('active');
            } else {
                 li.classList.remove('active');
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
