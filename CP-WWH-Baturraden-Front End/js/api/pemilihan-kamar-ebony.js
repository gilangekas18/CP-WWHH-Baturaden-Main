// =====================================================================
// === PUSAT KONTROL HALAMAN DINAMIS ===================================
// =====================================================================

// Alamat IP backend Anda. Pastikan ini adalah alamat yang benar!
const API_URL = "http://192.168.248.194:8000/api";
// ID untuk Villa Ebony adalah 1 (berdasarkan seeder kita)
const VILLA_EBONY_ID = 1;

/**
 * Fungsi ini akan berjalan otomatis saat seluruh struktur halaman HTML selesai dimuat.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Memanggil fungsi utama untuk memuat data kamar dari backend
    loadAndDisplayRoomOptions(VILLA_EBONY_ID);
    
    // Menjalankan kembali script-script original Anda untuk fungsionalitas tambahan
    initializeOriginalPageScripts();
});

/**
 * Fungsi utama untuk mengambil data dari API dan menampilkannya di halaman.
 * @param {number} villaId - ID villa yang akan ditampilkan.
 */
async function loadAndDisplayRoomOptions(villaId) {
    const roomListContainer = document.getElementById('roomOptionsList');
    
    try {
        // 1. Ambil data villa dari backend menggunakan fetch
        const response = await fetch(`${API_URL}/villas/${villaId}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data dari server. Status: ${response.status}`);
        }
        const villaData = await response.json();

        // 2. Kosongkan pesan "Memuat pilihan kamar..."
        roomListContainer.innerHTML = ''; 

        if (!villaData.room_types || villaData.room_types.length === 0) {
            roomListContainer.innerHTML = '<p>Tidak ada tipe kamar yang tersedia untuk villa ini.</p>';
            return;
        }

        // 3. Loop melalui setiap tipe kamar yang didapat dari backend
        villaData.room_types.forEach(roomType => {
            // Buat elemen div baru untuk setiap kamar
            const roomElement = document.createElement('div');
            roomElement.className = 'room-option-item';
            
            // PENTING: Menyimpan ID unik dari database ke dalam elemen HTML
            roomElement.setAttribute('data-room-type-id', roomType.id);

            // Format harga menjadi Rupiah agar terlihat rapi
            const formattedPrice = new Intl.NumberFormat('id-ID', {
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0
            }).format(roomType.price_per_night);

            // Isi elemen dengan struktur HTML yang sama persis seperti milik Anda
            // Ini memastikan tampilan tidak berubah
            roomElement.innerHTML = `
                <div class="room-option-details">
                    <h6>${roomType.name}</h6>
                    <p class="sub-info"><i class="fas fa-bed"></i> 1 Kasur (Detail bervariasi)</p>
                    <ul class="benefits">
                        <li><i class="fas fa-check-circle"></i> AC</li>
                        <li><i class="fas fa-check-circle"></i> TV</li>
                        <li><i class="fas fa-check-circle"></i> Kamar Mandi Dalam</li>
                    </ul>
                    <p class="policy"><i class="fas fa-exclamation-triangle"></i> Syarat & Ketentuan berlaku</p>
                </div>
                <div class="room-option-capacity">
                    <i class="fas fa-user-friends"></i> ${roomType.capacity_per_room}
                </div>
                <div class="room-option-price-action">
                    <span class="current-price">${formattedPrice}</span>
                    <span class="tax-info">per malam (belum termasuk pajak)</span>
                    <span class="available-rooms">Tersedia: ${roomType.total_rooms} Kamar</span>
                    <button class="btn btn-primary btn-select">Pesan Sekarang</button>
                </div>
            `;
            
            // 4. Masukkan elemen kamar yang sudah jadi ke dalam wadah di halaman
            roomListContainer.appendChild(roomElement);
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat memuat data kamar:", error);
        roomListContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Gagal memuat data kamar. Pastikan backend berjalan dan alamat IP sudah benar.</p>`;
    }
}

/**
 * Menambahkan satu event listener ke parent container untuk menangani semua klik tombol "Pesan Sekarang".
 */
document.getElementById('roomOptionsList').addEventListener('click', function(event) {
    // Cek apakah yang diklik adalah tombol dengan class 'btn-select'
    if (event.target && event.target.classList.contains('btn-select')) {
        
        const roomItem = event.target.closest('.room-option-item');
        
        if (roomItem) {
            // Ambil ID tipe kamar dari data attribute yang sudah kita simpan
            const roomTypeId = roomItem.getAttribute('data-room-type-id');
            
            // Sebelum redirect, cek apakah user sudah login (dengan melihat localStorage)
            if (!localStorage.getItem('authToken')) {
                alert('Anda harus login terlebih dahulu untuk dapat memesan kamar.');
                window.location.href = '/includes/login.html'; // Arahkan ke halaman login
                return; // Hentikan proses
            }

            // Jika sudah login, arahkan user ke halaman form pemesanan dengan membawa ID kamar
            console.log(`Mengarahkan ke form pemesanan untuk Room Type ID: ${roomTypeId}`);
            window.location.href = `pemesanan.html?roomTypeId=${roomTypeId}`;
        }
    }
});


/**
 * Fungsi untuk menjalankan kembali script-script original Anda (carousel, back-to-top, dll)
 */
function initializeOriginalPageScripts() {
    // JavaScript untuk Back to Top (dari kode Anda)
    if (typeof $ !== 'undefined') { // Cek jika jQuery sudah dimuat
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('.back-to-top').fadeIn('slow');
            } else {
                $('.back-to-top').fadeOut('slow');
            }
        });
        $('.back-to-top').click(function () {
            $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
            return false;
        });
    }

    // Fungsi untuk carousel dots (dari kode Anda)
    const mainImage = document.getElementById('mainRoomImage');
    const dotsContainer = document.getElementById('carouselDotsContainer');
    if (!mainImage || !dotsContainer) return;

    const images = [
        'img/FO EBONY.png', 'img/HALL EBONY.png', 'img/STANDART.png',
        'img/DELUXE.png', 'img/PANTRY.png', 'img/SECOND FLOOR.png',
        'img/VIP.png', 'img/KM VIP.png', 'img/SUPERRIOR.png', 'img/BALKON.png'
    ];
    
    dotsContainer.innerHTML = ''; // Kosongkan dulu jika ada
    images.forEach(() => dotsContainer.innerHTML += '<span class="carousel-dot"></span>');
    
    const carouselDots = dotsContainer.querySelectorAll('.carousel-dot');
    if(carouselDots.length > 0) carouselDots[0].classList.add('active');

    let currentImageIndex = 0;
    carouselDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentImageIndex = index;
            updateCarousel();
        });
    });

    function updateCarousel() {
        if (images[currentImageIndex]) {
            mainImage.src = images[currentImageIndex];
            carouselDots.forEach(d => d.classList.remove('active'));
            if (carouselDots[currentImageIndex]) {
                carouselDots[currentImageIndex].classList.add('active');
            }
        }
    }

    setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateCarousel();
    }, 5000);
}
