// Import fungsi login universal dari pusat kontrol API kita
import { unifiedLogin } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const formMessageDiv = document.getElementById('form-message');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Reset UI form
            formMessageDiv.textContent = '';
            formMessageDiv.className = 'message-container';
            submitButton.disabled = true;
            submitButton.textContent = 'Memproses...';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Panggil fungsi universal dari api.js
                const loginData = await unifiedLogin(email, password);

                // =================================================================
                // === PENTING: Tampilkan data dari backend untuk debugging =======
                // =================================================================
                console.log('Data Lengkap dari Backend:', loginData);

                formMessageDiv.textContent = 'Login berhasil! Mengarahkan...';
                formMessageDiv.classList.add('success');

                // --- LOGIKA PENGALIHAN BERDASARKAN PERAN (ROLE) ---
                let redirectTo = '/index.html'; // Halaman default untuk user biasa

                // PERBAIKAN: Menggunakan optional chaining (?.) agar lebih aman.
                // Kode ini akan mencoba mengakses loginData.user.roles
                // tanpa menyebabkan error jika 'user' atau 'roles' tidak ada.
                const userRoles = loginData?.user?.roles;

                // Periksa apakah userRoles adalah sebuah array
                if (Array.isArray(userRoles)) {
                    // Cek apakah pengguna memiliki salah satu dari peran admin
                    const isAdmin = userRoles.some(role =>
                        role.name === 'super-admin' || role.name === 'booking-manager'
                    );

                    if (isAdmin) {
                        // Jika pengguna adalah admin, arahkan ke dashboard admin
                        redirectTo = '/adminpage/indexadmin.html';
                    }
                }

                // Arahkan ke halaman yang sesuai setelah 1.5 detik
                setTimeout(() => {
                    window.location.href = redirectTo;
                }, 1500);

            } catch (error) {
                formMessageDiv.textContent = error.message;
                formMessageDiv.classList.add('error');
                
                submitButton.disabled = false;
                submitButton.textContent = 'Masuk';
            }
        });
    }
});