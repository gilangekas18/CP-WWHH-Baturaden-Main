document.addEventListener('DOMContentLoaded', () => {

    const API_URL = "http://192.168.248.194:8000/api"; // Pastikan URL ini benar
    const authButtonContainer = document.getElementById('auth-button-container');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link'); // Diperbarui untuk mencakup dropdown

    /**
     * Fungsi untuk memeriksa apakah ada token login di localStorage.
     */
    function isLoggedIn() {
        return !!localStorage.getItem('authToken');
    }

    /**
     * Fungsi yang menjalankan proses logout setelah dikonfirmasi.
     */
    async function performLogout() {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Hapus data dari localStorage terlepas dari sukses atau gagalnya API call
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // === PERBAIKAN UTAMA: Arahkan kembali ke halaman saat ini ===
            // Ini akan memaksa browser untuk memuat ulang halaman sepenuhnya 
            // dan memperbarui tombol login/logout.
            window.location.href = window.location.pathname;
        }
    }

    /**
     * Fungsi untuk menampilkan popup konfirmasi logout.
     */
    function showLogoutConfirmation() {
        const oldModal = document.getElementById('logoutConfirmModal');
        if (oldModal) oldModal.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'logout-modal-overlay';

        const modal = document.createElement('div');
        modal.id = 'logoutConfirmModal';
        modal.className = 'logout-modal';
        modal.innerHTML = `
            <p>Apakah Anda yakin ingin logout?</p>
            <div class="logout-modal-actions">
                <button id="confirmLogoutBtn" class="btn-confirm">Ya</button>
                <button id="cancelLogoutBtn" class="btn-cancel">Tidak</button>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        document.body.appendChild(modal);

        const closeModal = () => {
            modal.remove();
            modalOverlay.remove();
        };

        document.getElementById('confirmLogoutBtn').addEventListener('click', () => {
            performLogout();
            closeModal();
        });
        document.getElementById('cancelLogoutBtn').addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
    }

    /**
     * Fungsi untuk membuat dan menampilkan tombol yang sesuai (Login atau Logout).
     */
    function updateAuthButton() {
        if (!authButtonContainer) return;

        if (isLoggedIn()) {
            authButtonContainer.innerHTML = `<a href="#" id="logoutButton" class="nav-item nav-link">Logout</a>`;
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    showLogoutConfirmation(); // Panggil popup konfirmasi
                });
            }
        } else {
            authButtonContainer.innerHTML = `<a href="/includes/login.html" class="nav-item nav-link">Login</a>`;
        }
    }

    /**
     * Fungsi untuk menambahkan CSS untuk modal ke dalam halaman.
     */
    function injectModalCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .logout-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); z-index: 1050; }
            .logout-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 25px 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1051; text-align: center; width: 90%; max-width: 350px; }
            .logout-modal p { margin: 0 0 20px 0; font-size: 1.2em; color: #333; }
            .logout-modal-actions { display: flex; justify-content: center; gap: 15px; }
            .logout-modal-actions button { border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: opacity 0.2s; }
            .logout-modal-actions button:hover { opacity: 0.8; }
            .logout-modal-actions .btn-confirm { background-color: #dc3545; color: white; }
            .logout-modal-actions .btn-cancel { background-color: #6c757d; color: white; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Fungsi untuk menandai link navbar yang aktif, termasuk dropdown.
     */
    function highlightActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const villaPages = ['ebony.html', 'agathis.html', 'accacia.html'];

        navLinks.forEach(link => {
            // Hapus kelas 'active' dari semua link terlebih dahulu
            link.classList.remove('active');

            const linkPage = link.getAttribute('href')?.split('/').pop();

            // Cek untuk link biasa
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }

            // Cek khusus untuk dropdown Villa
            if (link.classList.contains('dropdown-toggle') && villaPages.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    // Jalankan semua fungsi inisialisasi
    injectModalCSS();
    updateAuthButton();
    highlightActiveNavLink();
});
