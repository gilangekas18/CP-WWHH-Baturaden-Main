document.addEventListener('DOMContentLoaded', () => {

    // --- 1. KONFIGURASI & VARIABEL GLOBAL ---
    const API_URL = "http://192.168.248.194:8000/api"; 
    const VILLA_ID = 1; // ID untuk Villa Ebony
    let allRoomTypes = []; // Menyimpan semua data kamar
    let currentlySelectedRoomId = null; // Menyimpan ID kamar yang sedang ditampilkan di detail

    // --- 2. SELEKSI ELEMEN DOM ---
    const roomListContainer = document.getElementById('roomList');
    // Elemen Panel Detail
    const detailRoomName = document.getElementById('detailRoomName');
    const detailRoomImage = document.getElementById('detailRoomImage');
    const detailRoomPrice = document.getElementById('detailRoomPrice');
    const detailFacilitiesList = document.getElementById('detailFacilitiesList');
    const editButton = document.getElementById('editPriceBtn');
    // Elemen Modal
    const modal = document.getElementById('editPriceModal');
    const overlay = document.getElementById('editModalOverlay');
    const editForm = document.getElementById('editPriceForm');
    const priceInput = document.getElementById('newPrice');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const modalAlert = document.getElementById('modalAlert');
    // Elemen Sidebar
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('overlay');

    // --- 3. FUNGSI LOGIKA BACKEND ---
    async function fetchVillaData() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/villas/${VILLA_ID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Gagal memuat data villa.');
            const villaData = await response.json();
            allRoomTypes = villaData.room_types || [];
        } catch (error) {
            console.error(error);
            roomListContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    async function updateRoomPrice(roomId, newPrice) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/admin/room-types/${roomId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ price_per_night: newPrice })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal mengupdate harga.');
            
            // Update data di array lokal dan render ulang UI
            const roomIndex = allRoomTypes.findIndex(r => r.id == roomId);
            if (roomIndex !== -1) {
                allRoomTypes[roomIndex].price_per_night = result.data.price_per_night;
            }
            renderRoomList(allRoomTypes); // Render ulang daftar kiri
            updateRoomDetailPanel(roomId); // Render ulang panel kanan
            closeModal();

        } catch (error) {
            showModalAlert(error.message);
            console.error(error);
        }
    }

    // --- 4. FUNGSI LOGIKA UI ---
    function renderRoomList(rooms) {
        roomListContainer.innerHTML = '';
        if (rooms.length === 0) {
            roomListContainer.innerHTML = '<p>Tidak ada kamar ditemukan.</p>';
            return;
        }
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            roomCard.dataset.roomId = room.id;
            roomCard.innerHTML = `
                <img src="/img/FO EBONY.png" alt="${room.name}">
                <div class="room-details">
                    <h3>${room.name}</h3>
                    <p>Kapasitas ${room.capacity_per_room} orang</p>
                    <button class="view-btn">View</button>
                </div>
            `;
            roomListContainer.appendChild(roomCard);
        });
    }

    function updateRoomDetailPanel(roomId) {
        const room = allRoomTypes.find(r => r.id == roomId);
        if (!room) return;

        currentlySelectedRoomId = room.id;
        detailRoomName.textContent = room.name;
        detailRoomPrice.textContent = `Harga Per Malam Rp ${Number(room.price_per_night).toLocaleString('id-ID')}`;
        // Logika fasilitas bisa ditambahkan di sini
        detailFacilitiesList.innerHTML = `<span><i class="fas fa-check-circle"></i> Fasilitas A</span><span><i class="fas fa-check-circle"></i> Fasilitas B</span>`;
    }

    function showModal() {
        if (!currentlySelectedRoomId) {
            alert("Pilih kamar terlebih dahulu.");
            return;
        }
        const room = allRoomTypes.find(r => r.id == currentlySelectedRoomId);
        if (room) {
            priceInput.value = room.price_per_night;
            modal.style.display = 'block';
            overlay.style.display = 'block';
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        overlay.style.display = 'none';
        modalAlert.innerHTML = '';
        editForm.reset();
    }
    
    function showModalAlert(message) {
        modalAlert.innerHTML = `<div style="color: red; margin-bottom: 10px;">${message}</div>`;
    }

    // --- 5. EVENT LISTENERS ---
    roomListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('view-btn')) {
            const roomCard = event.target.closest('.room-card');
            const roomId = roomCard.dataset.roomId;
            updateRoomDetailPanel(roomId);
        }
    });

    editButton.addEventListener('click', showModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        updateRoomPrice(currentlySelectedRoomId, priceInput.value);
    });
    
    // Listeners untuk Sidebar
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', () => sidebar.classList.add('active'));
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('active'));
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => sidebar.classList.remove('active'));

    // --- 6. INISIALISASI HALAMAN ---
    async function initializePage() {
        await fetchVillaData();
        if (allRoomTypes.length > 0) {
            renderRoomList(allRoomTypes);
            updateRoomDetailPanel(allRoomTypes[0].id); // Tampilkan detail kamar pertama
        }
    }

    initializePage();
});
