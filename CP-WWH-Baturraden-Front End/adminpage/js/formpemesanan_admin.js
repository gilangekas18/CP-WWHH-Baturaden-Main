document.addEventListener('DOMContentLoaded', () => {

    // --- 1. KONFIGURASI & SELEKSI ELEMEN ---
    const API_URL = "http://192.168.248.194:8000/api";
    let selectedRoomData = null; // Untuk menyimpan detail kamar yang dipilih

    // Seleksi elemen-elemen dari form dan ringkasan
    const form = document.getElementById('formPemesanan');
    const alertContainer = document.getElementById('alert-container');
    const submitButton = form.querySelector('button[type="submit"]');

    // Elemen ringkasan di kanan
    const selectedInfoDisplay = document.getElementById('selectedVillaRoomInfo');
    const villaNameDisplay = document.getElementById('villaNameDisplay');
    const checkinDateDisplay = document.getElementById('checkinDateDisplay');
    const checkoutDateDisplay = document.getElementById('checkoutDateDisplay');
    const nightsCountDisplay = document.getElementById('nightsCountDisplay');
    const roomTypeDetailsDisplay = document.getElementById('roomTypeDetailsDisplay');
    const guestCountDisplay = document.getElementById('guestCountDisplay');
    const extraBedDisplay = document.getElementById('extraBedDisplay');
    const roomsNightsSummary = document.getElementById('roomsNightsSummary');
    const finalPriceDisplay = document.getElementById('finalPriceDisplay');
    const totalHargaDisplay = document.getElementById('totalHargaDisplay');

    // Elemen input form
    const guestTypeRadios = document.querySelectorAll('input[name="guestType"]');
    const actualGuestSection = document.getElementById('actualGuestSection');
    const paymentMethodRadios = document.querySelectorAll('input[name="metode"]');
    const qrisSection = document.getElementById('qrisSection');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const jumlahKamarInput = document.getElementById('jumlahKamar');
    const tamuInput = document.getElementById('tamu');
    const extraBedInput = document.getElementById('extraBed');


    // --- 2. FUNGSI-FUNGSI UTAMA ---

    /**
     * Mengambil detail satu tipe kamar dari backend.
     */
    async function fetchRoomTypeDetails(roomTypeId) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_URL}/room-types/${roomTypeId}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Gagal mengambil detail kamar.');
            return await response.json();
        } catch (error) {
            console.error(error);
            showAlert('danger', error.message);
            return null;
        }
    }

    /**
     * Mengirim data booking baru ke backend.
     */
    async function createBooking(formData) {
        const token = localStorage.getItem('authToken');
        submitButton.disabled = true;
        submitButton.textContent = 'Memproses...';

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 422 && result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join('\n');
                    throw new Error(`Data tidak valid:\n${errorMessages}`);
                }
                throw new Error(result.message || 'Gagal membuat booking.');
            }

            showAlert('success', 'Booking berhasil dibuat! Anda akan diarahkan kembali.');
            localStorage.removeItem('selectedRoomTypeId');
            setTimeout(() => window.location.href = 'adminreservasi.html', 2500);
            
        } catch (error) {
            showAlert('danger', error.message);
            submitButton.disabled = false;
            submitButton.textContent = 'Buat Reservasi';
        }
    }

    /**
     * Menghitung total harga dan mengupdate ringkasan di sisi kanan.
     */
    function updatePriceAndSummary() {
        if (!selectedRoomData) return;

        const checkin = new Date(checkinInput.value);
        const checkout = new Date(checkoutInput.value);
        const numRooms = parseInt(jumlahKamarInput.value) || 0;
        const numGuests = parseInt(tamuInput.value) || 0;
        const numExtraBeds = parseInt(extraBedInput.value) || 0;

        // Update ringkasan tanggal
        checkinDateDisplay.textContent = checkinInput.value ? formatDate(checkin) : '...';
        checkoutDateDisplay.textContent = checkoutInput.value ? formatDate(checkout) : '...';
        
        // Hitung jumlah malam
        let nights = 0;
        if (checkinInput.value && checkoutInput.value && checkout > checkin) {
            nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        }
        nightsCountDisplay.textContent = `${nights} Malam`;

        // Update ringkasan lainnya
        guestCountDisplay.textContent = `${numGuests} Tamu`;
        extraBedDisplay.textContent = numExtraBeds > 0 ? `${numExtraBeds} extra bed` : 'Tidak ada extra bed';
        roomsNightsSummary.textContent = `${numRooms} kamar x ${nights} malam`;

        // Hitung total harga
        const roomPrice = selectedRoomData.price_per_night || 0;
        const extraBedPrice = 150000; // Asumsi harga extra bed Rp 150.000
        const totalPrice = (numRooms * roomPrice * nights) + (numExtraBeds * extraBedPrice * nights);
        
        const formattedPrice = `Rp ${totalPrice.toLocaleString('id-ID')}`;
        finalPriceDisplay.textContent = formattedPrice;
        totalHargaDisplay.textContent = formattedPrice;
    }


    // --- 3. EVENT LISTENERS ---

    // Tampilkan/sembunyikan form untuk tamu lain
    guestTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            actualGuestSection.style.display = (radio.value === 'another') ? 'block' : 'none';
        });
    });

    // Tampilkan/sembunyikan form upload bukti QRIS
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            qrisSection.style.display = (radio.value === 'qris') ? 'block' : 'none';
        });
    });

    // Update harga setiap kali ada input yang berubah
    [checkinInput, checkoutInput, jumlahKamarInput, tamuInput, extraBedInput].forEach(input => {
        input.addEventListener('input', updatePriceAndSummary);
    });

    // Saat form disubmit
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Siapkan data untuk dikirim
        const formData = new FormData();
        formData.append('room_type_id', localStorage.getItem('selectedRoomTypeId'));
        formData.append('booker_name', document.getElementById('nama').value);
        formData.append('booker_email', document.getElementById('email').value);
        formData.append('booker_phone', document.getElementById('mobileNumber').value);
        
        const isForAnother = document.getElementById('bookingForAnother').checked;
        formData.append('is_for_other_guest', isForAnother ? '1' : '0');
        if (isForAnother) {
            formData.append('guest_name', document.getElementById('actualGuestNama').value);
        }

        formData.append('check_in_date', checkinInput.value);
        formData.append('check_out_date', checkoutInput.value);
        formData.append('num_rooms', jumlahKamarInput.value);
        formData.append('num_guests', tamuInput.value);
        formData.append('extra_beds', extraBedInput.value);
        formData.append('notes', document.getElementById('catatan').value);
        
        const paymentMethod = document.querySelector('input[name="metode"]:checked').value;
        formData.append('payment_method', paymentMethod);
        if (paymentMethod === 'qris') {
            const proofFile = document.getElementById('bukti').files[0];
            if (proofFile) {
                formData.append('proof_file', proofFile);
            }
        }

        // Ambil total harga dari kalkulasi terakhir
        const priceText = finalPriceDisplay.textContent.replace(/[^0-9]/g, '');
        formData.append('total_price', parseInt(priceText) || 0);

        createBooking(formData);
    });


    // --- 4. INISIALISASI HALAMAN ---

    async function initializePage() {
        const selectedRoomId = localStorage.getItem('selectedRoomTypeId');

        if (!localStorage.getItem('authToken') || !selectedRoomId) {
            alert('Sesi tidak valid atau kamar belum dipilih. Anda akan diarahkan kembali.');
            window.location.href = 'adminreservasi.html';
            return;
        }

        selectedRoomData = await fetchRoomTypeDetails(selectedRoomId);

        if (selectedRoomData) {
            // Isi ringkasan dengan data awal
            selectedInfoDisplay.textContent = `${selectedRoomData.villa.name} - ${selectedRoomData.name}`;
            villaNameDisplay.textContent = selectedRoomData.villa.name;
            roomTypeDetailsDisplay.textContent = selectedRoomData.name;
            updatePriceAndSummary(); // Panggil sekali untuk inisialisasi
        } else {
            selectedInfoDisplay.textContent = `Gagal memuat info kamar.`;
            selectedInfoDisplay.style.color = 'red';
        }
    }
    
    // --- Fungsi Bantuan ---
    function showAlert(type, message) {
        alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>`;
    }
    function formatDate(date) {
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    initializePage();
});
