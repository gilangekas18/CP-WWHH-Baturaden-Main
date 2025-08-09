// --- 1. KONFIGURASI URL API ---
// Ganti dengan alamat IP laptop Anda yang didapatkan dari `php artisan serve --host=0.0.0.0`
const API_BASE_URL = 'http://192.168.1.10:8000/api'; // Contoh: Sesuaikan dengan IP Anda!

// Variabel global untuk menyimpan data villa dan jenis kamar yang diambil dari API
let allVillasData = [];

// --- 2. FUNGSI UNTUK MENGAMBIL DAN MENAMPILKAN DATA DARI API ---

// Fungsi untuk mengambil daftar villa dan jenis kamar dari API
// Menerima parameter tanggal untuk filter ketersediaan
async function fetchAndDisplayVillas(checkInDate = null, checkOutDate = null) {
    const villasContainer = document.getElementById('villas-container');
    villasContainer.innerHTML = '<p>Memuat daftar villa...</p>'; // Tampilkan loading

    let url = `${API_BASE_URL}/available-villas`;
    const params = new URLSearchParams();
    if (checkInDate) params.append('check_in_date', checkInDate);
    if (checkOutDate) params.append('check_out_date', checkOutDate);

    if (params.toString()) {
        url += `?${params.toString()}`; // Tambahkan parameter tanggal ke URL
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json' // Beri tahu server kita ingin JSON
            }
        });
        if (!response.ok) {
            // Jika ada error validasi tanggal dari backend
            const errorResult = await response.json();
            throw new Error(errorResult.message || `HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        allVillasData = result.data; // Simpan data villa ke variabel global

        // Perbarui tampilan daftar villa dengan ketersediaan
        villasContainer.innerHTML = formatVillaList(allVillasData, checkInDate && checkOutDate);

        // Isi dropdown pilihan villa di formulir
        populateVillaSelect(allVillasData);

        // Setelah data di-refresh, muat ulang juga dropdown jenis kamar jika ada villa yang sudah dipilih
        const currentSelectedVillaId = document.getElementById('villa_select').value;
        if (currentSelectedVillaId) {
            populateRoomTypeSelect(currentSelectedVillaId);
        }

        console.log('Data villa dan jenis kamar berhasil diambil (dengan ketersediaan):', allVillasData);
    } catch (error) {
        console.error('Gagal mengambil data villa:', error);
        villasContainer.innerHTML = `<p style="color: red;">Gagal memuat daftar villa: ${error.message}.</p>`;
    }
}

// Fungsi untuk memformat daftar villa agar siap ditampilkan di HTML
function formatVillaList(villas, showAvailability = false) {
    let html = '';
    if (villas.length === 0) {
        return '<p>Tidak ada villa tersedia.</p>';
    }
    villas.forEach(villa => {
        let villaAvailabilityText = '';
        if (showAvailability) {
            villaAvailabilityText = ` (Tersedia: ${villa.available_villa_rooms} dari ${villa.total_villa_rooms} unit)`;
        } else {
            villaAvailabilityText = ` (Total: ${villa.total_villa_rooms} unit)`;
        }

        html += `<h3>${villa.name}${villaAvailabilityText}</h3>`;
        if (villa.is_one_package_villa) {
            html += `<p style="font-style: italic; color: #888;">(Villa ini harus dipesan sebagai satu paket dengan ${villa.total_villa_rooms} unit kamar.)</p>`;
        }
        if (villa.room_types && villa.room_types.length > 0) {
            html += '<ul>';
            villa.room_types.forEach(roomType => {
                let roomTypeAvailabilityText = '';
                if (showAvailability) {
                    roomTypeAvailabilityText = ` (Tersedia: ${roomType.available_rooms} dari ${roomType.quantity})`;
                } else {
                    roomTypeAvailabilityText = ` (Total: ${roomType.quantity})`;
                }
                html += `<li><strong>${roomType.type_name}</strong> (Kapasitas: ${roomType.capacity} orang, Harga/malam: Rp ${roomType.price_per_night.toLocaleString('id-ID')})${roomTypeAvailabilityText}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>Tidak ada jenis kamar tersedia untuk villa ini.</p>';
        }
    });
    return html;
}

// Fungsi untuk mengisi dropdown #villa_select di formulir
function populateVillaSelect(villas) {
    const villaSelect = document.getElementById('villa_select');
    villaSelect.innerHTML = '<option value="">-- Pilih Villa --</option>'; // Reset dropdown
    villas.forEach(villa => {
        const option = document.createElement('option');
        option.value = villa.id;
        option.textContent = villa.name;
        option.dataset.totalRooms = villa.total_villa_rooms; // Simpan total kamar villa
        option.dataset.availableRooms = villa.available_villa_rooms; // Tambahkan available_villa_rooms
        option.dataset.isOnePackage = villa.is_one_package_villa ? 'true' : 'false'; // Flag satu paket
        villaSelect.appendChild(option);
    });
}

// Fungsi untuk mengisi dropdown #room_type_select berdasarkan villa yang dipilih
function populateRoomTypeSelect(selectedVillaId) {
    const roomTypeSelect = document.getElementById('room_type_select');
    const numberOfRoomsInput = document.getElementById('number_of_rooms');
    const villaSelect = document.getElementById('villa_select');
    const selectedOption = villaSelect.options[villaSelect.selectedIndex];
    
    // Default reset nilai input jumlah kamar
    numberOfRoomsInput.value = 1;
    numberOfRoomsInput.readOnly = false;
    numberOfRoomsInput.min = 1;
    numberOfRoomsInput.max = 999;

    roomTypeSelect.innerHTML = '<option value="">-- Pilih Jenis Kamar --</option>'; // Reset dropdown
    roomTypeSelect.disabled = true; // Nonaktifkan secara default

    const selectedVilla = allVillasData.find(villa => villa.id == selectedVillaId);

    if (selectedVilla) {
        if (selectedVilla.is_one_package_villa) {
            // Untuk villa 'satu paket', sembunyikan atau nonaktifkan pilihan jenis kamar
            const packageRoomType = selectedVilla.room_types[0]; // Ambil jenis kamar 'paket'
            if (packageRoomType) {
                roomTypeSelect.innerHTML = `<option value="${packageRoomType.id}">Semua Kamar (${selectedVilla.total_villa_rooms} unit) - Tersedia: ${packageRoomType.available_rooms}</option>`;
                roomTypeSelect.disabled = true; // Dropdown jenis kamar dinonaktifkan
                numberOfRoomsInput.value = selectedVilla.total_villa_rooms; // Set jumlah kamar otomatis ke total
                numberOfRoomsInput.min = selectedVilla.total_villa_rooms; // Batasi min
                numberOfRoomsInput.max = selectedVilla.total_villa_rooms; // Batasi max
                numberOfRoomsInput.readOnly = true; // Nonaktifkan input jumlah kamar
                numberOfRoomsInput.dataset.availableRooms = packageRoomType.available_rooms; // Simpan ketersediaan paket
            } else {
                roomTypeSelect.innerHTML = `<option value="">Tidak ada paket kamar</option>`;
            }

        } else if (selectedVilla.room_types && selectedVilla.room_types.length > 0) {
            // Untuk villa biasa, isi dropdown dengan jenis kamar dan ketersediaan
            selectedVilla.room_types.forEach(roomType => {
                const option = document.createElement('option');
                option.value = roomType.id;
                // Tampilkan ketersediaan di dropdown
                option.textContent = `${roomType.type_name} (Kapasitas: ${roomType.capacity} orang, Tersedia: ${roomType.available_rooms} dari ${roomType.quantity})`;
                option.dataset.availableRooms = roomType.available_rooms; // Simpan ketersediaan
                roomTypeSelect.appendChild(option);
            });
            roomTypeSelect.disabled = false; // Aktifkan jika ada jenis kamar
        }
    }
}

// --- 3. FUNGSI UNTUK MENGIRIM DATA FORMULIR KE API (BOOKING) ---

async function submitBookingForm(event) {
    event.preventDefault(); // Mencegah form submit default browser

    const form = event.target;
    const formData = new FormData(form); // Mengambil semua data form, termasuk file input type="file"

    const responseMessageDiv = document.getElementById('response-message');
    responseMessageDiv.classList.remove('success', 'error'); // Bersihkan status sebelumnya
    responseMessageDiv.textContent = 'Mengirim pemesanan...';

    // Penyesuaian data sebelum dikirim (sesuai logika backend Laravel)
    const bookingFor = formData.get('booking_for');
    if (bookingFor === 'Saya tamu yang menginap') {
        formData.delete('occupant_full_name');
        formData.delete('occupant_email');
        formData.delete('occupant_phone_number');
    }

    const paymentMethod = formData.get('payment_method');
    if (paymentMethod !== 'Qris') {
        formData.delete('payment_proof_file'); // Hapus file jika bukan Qris
    } else {
        const paymentFile = formData.get('payment_proof_file');
        if (!paymentFile || paymentFile.name === '') {
            responseMessageDiv.classList.add('error');
            responseMessageDiv.textContent = 'Untuk pembayaran Qris, bukti pembayaran wajib diunggah.';
            return; // Hentikan proses jika file Qris tidak ada
        }
    }

    // --- Validasi Ketersediaan di Frontend (Sebelum Kirim ke Backend) ---
    const selectedVillaOption = document.getElementById('villa_select').options[document.getElementById('villa_select').selectedIndex];
    const isOnePackageVilla = selectedVillaOption.dataset.isOnePackage === 'true';
    const totalVillaRooms = parseInt(selectedVillaOption.dataset.totalRooms);
    const requestedRooms = parseInt(formData.get('number_of_rooms'));

    let roomTypeAvailable = 0;
    const selectedRoomTypeOption = document.getElementById('room_type_select').options[document.getElementById('room_type_select').selectedIndex];
    if (selectedRoomTypeOption && selectedRoomTypeOption.dataset.availableRooms) {
        roomTypeAvailable = parseInt(selectedRoomTypeOption.dataset.availableRooms);
    } else if (isOnePackageVilla && selectedVillaOption.dataset.availableRooms) { // Untuk villa paket, ambil dari villa level
        roomTypeAvailable = parseInt(selectedVillaOption.dataset.availableRooms);
    }


    if (isOnePackageVilla) {
        // Untuk villa 'satu paket', pastikan jumlah kamar yang diminta sama dengan total kamar villa
        if (requestedRooms !== totalVillaRooms) {
             responseMessageDiv.classList.add('error');
             responseMessageDiv.textContent = `Untuk Villa ${selectedVillaOption.textContent.trim()}, Anda harus memesan semua ${totalVillaRooms} kamar sebagai satu paket.`;
             return;
        }
        // Dan pastikan ketersediaan total villa mencukupi (dari data yang diambil dari API)
        if (requestedRooms > roomTypeAvailable) {
            responseMessageDiv.classList.add('error');
            responseMessageDiv.textContent = `Maaf, Villa ${selectedVillaOption.textContent.trim()} tidak tersedia sepenuhnya untuk tanggal yang dipilih. Hanya tersedia ${roomTypeAvailable} unit.`;
            return;
        }
    } else { // Untuk villa non-'satu paket'
        // Validasi ketersediaan untuk jenis kamar spesifik
        if (requestedRooms > roomTypeAvailable) {
            responseMessageDiv.classList.add('error');
            responseMessageDiv.textContent = `Maaf, hanya ada ${roomTypeAvailable} kamar tipe ini yang tersedia untuk tanggal yang dipilih. Anda meminta ${requestedRooms}.`;
            return;
        }
    }
    // --- Akhir Validasi Ketersediaan di Frontend ---

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            responseMessageDiv.classList.add('success');
            responseMessageDiv.textContent = `Pemesanan Berhasil! ID Booking: ${result.booking_id}. Status: ${result.booking_details.booking_status}`;
            form.reset();
            // Sembunyikan bagian kondisional setelah reset
            document.getElementById('occupant_details').classList.add('hidden');
            document.getElementById('payment_proof_section').classList.add('hidden');
            document.getElementById('room_type_select').disabled = true; // Nonaktifkan lagi room type
            document.getElementById('number_of_rooms').readOnly = false; // Reset readOnly jumlah kamar
            document.getElementById('number_of_rooms').min = 1; // Reset min
            document.getElementById('number_of_rooms').max = 999; // Reset max
            document.getElementById('number_of_rooms').value = 1; // Reset value

            // Setelah booking berhasil, muat ulang ketersediaan berdasarkan tanggal filter saat ini
            const ciFilter = document.getElementById('check_in_date_filter').value;
            const coFilter = document.getElementById('check_out_date_filter').value;
            fetchAndDisplayVillas(ciFilter, coFilter); // Muat ulang data villa dengan tanggal filter
            
            // Juga, reset dropdown villa & room type di form
            populateVillaSelect(allVillasData); // Populate ulang dropdown villa
            populateRoomTypeSelect(''); // Reset dropdown room type di form booking

            console.log('Pemesanan berhasil:', result);
        } else {
            responseMessageDiv.classList.add('error');
            let errorMessage = result.message || 'Terjadi kesalahan.';
            if (result.errors) {
                for (const field in result.errors) {
                    errorMessage += `<br>- ${result.errors[field].join(', ')}`;
                }
            }
            responseMessageDiv.innerHTML = `Pemesanan Gagal: ${errorMessage}`;
            console.error('Pemesanan gagal:', result);
        }
    } catch (error) {
        console.error('Terjadi kesalahan jaringan atau tak terduga:', error);
        responseMessageDiv.classList.add('error');
        responseMessageDiv.textContent = 'Terjadi kesalahan jaringan atau tak terduga. Silakan coba lagi.';
    }
}

// --- 4. LISTENER EVENT (Inisialisasi Saat Halaman Dimuat) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil elemen input tanggal filter
    const checkInDateFilterInput = document.getElementById('check_in_date_filter');
    const checkOutDateFilterInput = document.getElementById('check_out_date_filter');
    const checkAvailabilityBtn = document.getElementById('check_availability_btn');

    // 2. Event listener untuk tombol "Cek Ketersediaan"
    if (checkAvailabilityBtn) {
        checkAvailabilityBtn.addEventListener('click', () => {
            const ciDate = checkInDateFilterInput.value;
            const coDate = checkOutDateInput.value;
            if (ciDate && coDate && new Date(coDate) > new Date(ciDate)) {
                fetchAndDisplayVillas(ciDate, coDate);
            } else {
                alert('Mohon masukkan tanggal Check-in dan Check-out yang valid (Check-out harus setelah Check-in).');
                // Optional: fetch and display without dates, or clear current display
                fetchAndDisplayVillas(); // Reset to show total quantity if dates invalid
            }
        });
    }

    // 3. Event listener untuk submit formulir pemesanan
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', submitBookingForm);
    }

    // 4. Event listener untuk perubahan pilihan "Pemesanan Untuk"
    const bookingForSelect = document.getElementById('booking_for');
    const occupantDetailsDiv = document.getElementById('occupant_details');
    const occupantFields = occupantDetailsDiv.querySelectorAll('input');

    if (bookingForSelect) {
        bookingForSelect.addEventListener('change', function() {
            if (this.value === 'Saya memesan Untuk Orang lain') {
                occupantDetailsDiv.classList.remove('hidden');
                occupantFields.forEach(field => field.setAttribute('required', 'required'));
            } else {
                occupantDetailsDiv.classList.add('hidden');
                occupantFields.forEach(field => field.removeAttribute('required'));
            }
        });
        bookingForSelect.dispatchEvent(new Event('change')); // Inisialisasi awal
    }

    // 5. Event listener untuk perubahan metode pembayaran
    const paymentMethodSelect = document.getElementById('payment_method');
    const paymentProofSection = document.getElementById('payment_proof_section');
    const paymentProofFile = document.getElementById('payment_proof_file');

    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            if (this.value === 'Qris') {
                paymentProofSection.classList.remove('hidden');
            } else {
                paymentProofSection.classList.add('hidden');
                paymentProofFile.value = ''; // Hapus file yang dipilih jika beralih dari Qris
            }
        });
        paymentMethodSelect.dispatchEvent(new Event('change')); // Inisialisasi awal
    }

    // 6. Event listener untuk perubahan pilihan villa guna mengisi jenis kamar
    const villaSelect = document.getElementById('villa_select');
    if (villaSelect) {
        villaSelect.addEventListener('change', function() {
            populateRoomTypeSelect(this.value);
        });
    }
    
    // 7. Auto-set check-in/check-out date fields in booking form from filter dates
    //    and ensure they are updated when filter dates change
    const updateBookingFormDates = () => {
        document.getElementById('check_in_date').value = checkInDateFilterInput.value;
        document.getElementById('check_out_date').value = checkOutDateFilterInput.value;
    };
    
    if (checkInDateFilterInput) checkInDateFilterInput.addEventListener('change', updateBookingFormDates);
    if (checkOutDateFilterInput) checkOutDateFilterInput.addEventListener('change', updateBookingFormDates);
    
    // Set default dates for tomorrow/day after tomorrow for easier testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const formatToYYYYMMDD = (date) => date.toISOString().split('T')[0];

    checkInDateFilterInput.value = formatToYYYYMMDD(tomorrow);
    checkOutDateFilterInput.value = formatToYYYYMMDD(dayAfterTomorrow);
    updateBookingFormDates(); // Update booking form dates initially

    // Initial fetch of villas without specific dates (will show total quantity)
    fetchAndDisplayVillas();
});