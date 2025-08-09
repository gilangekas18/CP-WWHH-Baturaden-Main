// Import fungsi registerUser dari pusat kontrol API kita
import { registerUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const formMessageDiv = document.getElementById('form-message');

    // Helper function untuk membersihkan semua pesan error sebelumnya
    const clearErrors = () => {
        document.querySelectorAll('.error-message-inline').forEach(el => el.textContent = '');
        formMessageDiv.textContent = '';
        formMessageDiv.className = 'message-container';
    };

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearErrors(); // Bersihkan error lama setiap kali submit

            submitButton.disabled = true;
            submitButton.textContent = 'Mendaftarkan...';

            const formData = new FormData(registerForm);
            const userData = Object.fromEntries(formData.entries());

            try {
                await registerUser(userData);

                // Menampilkan pesan sukses di bawah tombol
                formMessageDiv.textContent = 'Register berhasil, silahkan login';
                formMessageDiv.classList.add('success'); // Tambahkan class untuk styling hijau

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                // Logika baru untuk menampilkan error inline
                if (error.details) {
                    // Jika error memiliki detail (artinya ini error validasi dari Laravel)
                    // 'error.details' adalah objek seperti { email: ["email sudah ada"], password: ["password tidak cocok"] }
                    for (const field in error.details) {
                        const errorElement = document.getElementById(`${field}-error`);
                        if (errorElement) {
                            // Tampilkan pesan error pertama untuk field tersebut
                            errorElement.textContent = error.details[field][0];
                        }
                    }
                } else {
                    // Jika ini error umum (seperti server down)
                    formMessageDiv.textContent = error.message;
                    formMessageDiv.classList.add('error'); // Tambahkan class untuk styling merah
                }
                
                // Aktifkan kembali tombol jika registrasi gagal
                submitButton.disabled = false;
                submitButton.textContent = 'Daftar';
            }
        });
    }
});
