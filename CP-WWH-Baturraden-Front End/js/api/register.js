// Import fungsi registerUser dari pusat kontrol API 
import { registerUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const formMessageDiv = document.getElementById('form-message');

    const clearErrors = () => {
        document.querySelectorAll('.error-message-inline').forEach(el => el.textContent = '');
        formMessageDiv.textContent = '';
        formMessageDiv.className = 'message-container';
    };

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearErrors(); 

            submitButton.disabled = true;
            submitButton.textContent = 'Mendaftarkan...';

            const formData = new FormData(registerForm);
            const userData = Object.fromEntries(formData.entries());

            try {
                await registerUser(userData);

                formMessageDiv.textContent = 'Register berhasil, silahkan login';
                formMessageDiv.classList.add('success'); 

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                if (error.details) {
                    for (const field in error.details) {
                        const errorElement = document.getElementById(`${field}-error`);
                        if (errorElement) {
                            errorElement.textContent = error.details[field][0];
                        }
                    }
                } else {
                    formMessageDiv.textContent = error.message;
                    formMessageDiv.classList.add('error'); 
                }
            
                submitButton.disabled = false;
                submitButton.textContent = 'Daftar';
            }
        });
    }
});
