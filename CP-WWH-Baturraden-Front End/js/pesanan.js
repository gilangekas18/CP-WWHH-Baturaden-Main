document.addEventListener('DOMContentLoaded', () => {
    // === VALIDASI ELEMEN HTML =============================
    //  Memeriksa apakah semua elemen HTML yang dibutuhkan ada sebelum menjalankan logika apa pun.
    const requiredElementIds = [
        'formPemesanan', 'selectedVillaRoomInfo', 'roomNameDisplay', 'check_in_date',
        'check_out_date', 'num_rooms', 'finalPriceDisplay', 'nightsCountDisplay',
        'checkinDateDisplay', 'checkoutDateDisplay', 'priceSummaryText',
        'roomPriceSubtotal', 'alert-container', 'submitButton',
        'room_type_id', 'total_price' // Memastikan input tersembunyi juga ada
    ];

    for (const id of requiredElementIds) {
        if (!document.getElementById(id)) {
            console.error(`Elemen HTML krusial dengan ID "${id}" tidak ditemukan. Script tidak dapat berjalan.`);
            // Menampilkan pesan error yang jelas di halaman
            const body = document.querySelector('body');
            if (body) {
                const errorDiv = document.createElement('div');
                errorDiv.style.backgroundColor = 'red';
                errorDiv.style.color = 'white';
                errorDiv.style.padding = '20px';
                errorDiv.style.position = 'fixed';
                errorDiv.style.top = '0';
                errorDiv.style.left = '0';
                errorDiv.style.width = '100%';
                errorDiv.style.zIndex = '9999';
                errorDiv.innerHTML = `<b>Error Konfigurasi HTML:</b> Elemen dengan ID <strong>"${id}"</strong> tidak ditemukan. Harap periksa file HTML Anda dan pastikan semua ID sudah benar.`;
                body.prepend(errorDiv);
            }
            return; // Menghentikan eksekusi script jika ada elemen yang hilang
        }
    }



    // === PENGATURAN & FUNGSI API ==========================
    const API_URL = "http://localhost:8000/api"; // \URL IP


    async function fetchRoomTypeById(roomTypeId) {
        try {
            const response = await fetch(`${API_URL}/room-types/${roomTypeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Gagal mengambil data untuk Room Type ID ${roomTypeId}:`, error);
            throw error;
        }
    }

    async function createBooking(bookingFormData) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Otentikasi dibutuhkan. Silakan login terlebih dahulu.');
        }
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: bookingFormData
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.message || 'Gagal membuat booking.';

                let errorDetails = '';
                if (data.errors) {
                    errorDetails = '<ul>' + Object.values(data.errors).map(e => `<li>${e[0]}</li>`).join('') + '</ul>';
                }
                throw new Error(`${errorMessage} ${errorDetails}`);
            }
            return data;
        } catch (error) {
            console.error("Error saat membuat booking:", error);
            throw error;
        }
    }


    // === LOGIKA HALAMAN PEMESANAN =========================

    // Ambil semua elemen penting dari halaman
    const form = document.getElementById('formPemesanan');
    const roomInfoDiv = document.getElementById('selectedVillaRoomInfo');
    const roomNameDisplay = document.getElementById('roomNameDisplay');
    const checkinInput = document.getElementById('check_in_date');
    const checkoutInput = document.getElementById('check_out_date');
    const numRoomsInput = document.getElementById('num_rooms');
    const finalPriceDisplay = document.getElementById('finalPriceDisplay');
    const nightsCountDisplay = document.getElementById('nightsCountDisplay');
    const checkinDateDisplay = document.getElementById('checkinDateDisplay');
    const checkoutDateDisplay = document.getElementById('checkoutDateDisplay');
    const priceSummaryText = document.getElementById('priceSummaryText');
    const roomPriceSubtotal = document.getElementById('roomPriceSubtotal');
    const alertContainer = document.getElementById('alert-container');
    const submitButton = document.getElementById('submitButton');

    // Ambil juga elemen input tersembunyi
    const hiddenRoomTypeIdInput = document.getElementById('room_type_id');
    const hiddenTotalPriceInput = document.getElementById('total_price');

    let selectedRoomData = null;

    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const calculateTotalPrice = () => {
        if (!selectedRoomData || !checkinInput.value || !checkoutInput.value) return;

        const checkinDate = new Date(checkinInput.value);
        const checkoutDate = new Date(checkoutInput.value);
        if (checkinDate >= checkoutDate) {
            nightsCountDisplay.textContent = `0 malam`;
            finalPriceDisplay.textContent = formatCurrency(0);
            return;
        };

        const numRooms = parseInt(numRoomsInput.value) || 1;
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        const totalRoomPrice = selectedRoomData.price_per_night * numRooms * nights;

        priceSummaryText.textContent = `Harga Kamar (${numRooms} kamar x ${nights} malam)`;
        roomPriceSubtotal.textContent = formatCurrency(totalRoomPrice);
        finalPriceDisplay.textContent = formatCurrency(totalRoomPrice);
        nightsCountDisplay.textContent = `${nights} malam`;
        checkinDateDisplay.textContent = checkinInput.value;
        checkoutDateDisplay.textContent = checkoutInput.value;

        // Isi nilai input tersembunyi dengan harga total
        hiddenTotalPriceInput.value = totalRoomPrice;
    };

    const initializePage = async () => {
        if (!localStorage.getItem('authToken')) {
            showAlert('Anda harus login untuk mengakses halaman ini. Anda akan diarahkan ke halaman login.', 'danger');
            setTimeout(() => {
                window.location.href = `login.html?redirect=${window.location.pathname}${window.location.search}`;
            }, 3000);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const roomTypeId = params.get('roomTypeId');

        if (!roomTypeId) {
            showAlert('Error: Tipe kamar tidak ditemukan. Silakan kembali dan pilih kamar.', 'danger');
            form.style.display = 'none';
            return;
        }

        // Isi nilai input tersembunyi dengan ID kamar
        hiddenRoomTypeIdInput.value = roomTypeId;

        try {
            selectedRoomData = await fetchRoomTypeById(roomTypeId);

            roomInfoDiv.innerHTML = `<strong>${selectedRoomData.villa.name}</strong> - ${selectedRoomData.name}`;
            roomNameDisplay.textContent = `${selectedRoomData.villa.name} - ${selectedRoomData.name}`;

            const userData = JSON.parse(localStorage.getItem('userData'));
            if (userData) {
                document.getElementById('booker_name').value = userData.name || '';
                document.getElementById('booker_email').value = userData.email || '';
            }

            const today = new Date().toISOString().split('T')[0];
            checkinInput.setAttribute('min', today);

            [checkinInput, checkoutInput, numRoomsInput].forEach(input => {
                input.addEventListener('change', calculateTotalPrice);
            });

        } catch (error) {
            showAlert(`Gagal memuat detail kamar. ${error.message}`, 'danger');
        }
    };

    document.querySelectorAll('input[name="guestType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('actualGuestSection').style.display = e.target.value === 'true' ? 'block' : 'none';
        });
    });

    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('qrisSection').style.display = e.target.value === 'qris' ? 'block' : 'none';
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Memproses...';
        alertContainer.innerHTML = '';

        const formData = new FormData(form);

        const isForOtherValue = document.querySelector('input[name="guestType"]:checked').value;
        formData.append('is_for_other_guest', isForOtherValue === 'true' ? '1' : '0');

        if (isForOtherValue !== 'true') {
            formData.delete('guest_name');
            formData.delete('guest_email');
            formData.delete('guest_phone');
        }




        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const proofFileInput = document.getElementById('proof_file');
        if (proofFileInput) {
            formData.delete('proof_file');
        }

        try {
            // 1️⃣ Buat booking
            const result = await createBooking(formData);
            showAlert(`Pemesanan berhasil dibuat! ID Booking Anda: <strong>${result.data.id}</strong>`, 'success');

            // 2️⃣ Jika metode pembayaran QRIS, upload bukti
            const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

            if (selectedPaymentMethod === 'qris') {
                const proofFileInput = document.getElementById('proof_file');
                if (!proofFileInput || proofFileInput.files.length === 0) {
                    showAlert('Silakan upload bukti transfer Qris.', 'danger');
                    return;
                }

                const paymentFormData = new FormData();
                paymentFormData.append('booking_id', result.data.id);
                paymentFormData.append('method', 'qris');
                paymentFormData.append('proof_file', proofFileInput.files[0]);

                const token = localStorage.getItem('authToken');
                const paymentResponse = await fetch(`${API_URL}/payments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: paymentFormData
                });

                const paymentResult = await paymentResponse.json();

                if (paymentResponse.status >= 400) {
                    let errorMessage = paymentResult.message || 'Gagal upload bukti pembayaran.';
                    if (paymentResult.errors) {
                        errorMessage += '<ul>' + Object.values(paymentResult.errors).map(e => `<li>${e[0]}</li>`).join('') + '</ul>';
                    }
                    showAlert(errorMessage, 'danger');
                    return;
                }


                showAlert('Bukti pembayaran berhasil diunggah!', 'success');
            }


            form.reset();
        } catch (error) {
            showAlert(`Gagal membuat pemesanan: ${error.message}`, 'danger');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Kirim Pemesanan';
        }
    });


    const showAlert = (message, type = 'info') => {
        alertContainer.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
    };

    initializePage();
});
