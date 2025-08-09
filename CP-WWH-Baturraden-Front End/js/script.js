// Data kamar simulasi untuk Villa Ebony
// Ini adalah data yang akan menentukan apa yang muncul di daftar pilihan kamar
const roomData = [
    {
        id: 'standard-basic-1',
        name: 'Standard - Free Breakfast With One Day Tour Trip',
        bedType: '1 double bed',
        capacity: 2,
        originalPrice: 382189,
        currentPrice: 286650,
        benefits: [/*'Gratis ONE_DAY_TOUR_TRIP'*/],
    policies: [/*'Tidak bisa refund'*/],
        availableRooms: 2
    },
    {
        id: 'standard-pay-at-hotel-1',
        name: 'Standard - Free Breakfast With One Day Tour Trip',
        bedType: '1 double bed',
        capacity: 2,
        originalPrice: 382189,
        currentPrice: 286650,
        benefits: [/*'Gratis ONE_DAY_TOUR_TRIP'*/],
        policies: [/*'Bayar di Hotel', 'Kebijakan pembatalan berlaku'*/],
        availableRooms: 2
    }
    // Anda bisa tambahkan lebih banyak jenis kamar di sini jika diperlukan
    // Contoh:
    // {
    //     id: 'deluxe-promo-1',
    //     name: 'Deluxe - Promo Akhir Tahun',
    //     bedType: '1 king bed',
    //     capacity: 3,
    //     originalPrice: 700000,
    //     currentPrice: 550000,
    //     benefits: ['Diskon 20%', 'Termasuk Sarapan'],
    //     policies: ['Tidak bisa refund'],
    //     availableRooms: 1
    // }
];

const roomOptionsList = document.getElementById('roomOptionsList');

/**
 * Merender daftar pilihan kamar secara dinamis berdasarkan data roomData.
 */
function renderRoomOptions() {
    roomOptionsList.innerHTML = ''; // Kosongkan daftar sebelumnya

    if (roomData.length === 0) {
        roomOptionsList.innerHTML = '<p class="text-muted text-center mt-3">Tidak ada pilihan kamar tersedia.</p>';
        return;
    }

    roomData.forEach(room => {
        // Membuat HTML untuk daftar keuntungan (benefits)
        const benefitsHtml = room.benefits.map(benefit => `<li><i class="fas fa-check-circle"></i> ${benefit}</li>`).join('');

        // Membuat HTML untuk kebijakan (policies) dengan ikon yang sesuai
        const policiesHtml = room.policies.map(policy => {
            let iconClass = 'fas fa-info-circle'; // Ikon default
            if (policy.includes('refund')) {
                iconClass = 'fas fa-exclamation-circle'; // Ikon khusus untuk "refund"
            } else if (policy.includes('Bayar di Hotel')) {
                iconClass = 'fas fa-money-bill-alt'; // Ikon khusus untuk "Bayar di Hotel"
            }
            return `<div class="policy"><i class="${iconClass}"></i> ${policy}</div>`;
        }).join('');

        // Membuat HTML lengkap untuk satu item pilihan kamar
        const roomHtml = `
            <div class="room-option-item">
                <div class="room-option-details">
                    <h6>${room.name}</h6>
                    <div class="sub-info"><i class="fas fa-bed"></i> ${room.bedType}</div>
                    <ul class="benefits">
                        ${benefitsHtml}
                    </ul>
                    ${policiesHtml}
                </div>
                <div class="room-option-capacity">
                    <i class="fas fa-user-friends"></i> ${room.capacity}
                </div>
                <div class="room-option-price-action">
                    <div class="current-price">Rp ${new Intl.NumberFormat('id-ID').format(room.currentPrice)}</div>
                    <div class="tax-info">Di luar pajak & biaya</div>
                    <button class="btn btn-select" data-room-id="${room.id}" data-price="${room.currentPrice}">Pilih</button>
                </div>
            </div>
        `;
        roomOptionsList.insertAdjacentHTML('beforeend', roomHtml);
    });

    // Menambahkan event listener ke semua tombol "Pilih" yang baru dirender
    document.querySelectorAll('.btn-select').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.dataset.roomId;
            const price = this.dataset.price;
            
            // --- SIMULASI ---
            // Di aplikasi nyata, di sini Anda akan mengarahkan pengguna ke formulir pemesanan
            // dengan membawa data kamar yang dipilih, misalnya:
            // window.location.href = `index.html?villa=Ebony&room=${roomId}&price=${price}`;
            
            alert(`Anda memilih kamar dengan ID: ${roomId} seharga Rp ${new Intl.NumberFormat('id-ID').format(price)}.\n\n(Ini adalah simulasi. Di aplikasi nyata akan mengarahkan ke form pemesanan dengan data terisi.)`);
        });
    });
}

// --- JavaScript untuk Back to Top Button ---
$(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
});
$('.back-to-top').click(function () {
    $('html, body').animate({scrollTop: 0}, 1500, 'easeOutExpo');
    return false;
});

// --- Inisialisasi Saat Halaman Dimuat ---
document.addEventListener('DOMContentLoaded', renderRoomOptions);