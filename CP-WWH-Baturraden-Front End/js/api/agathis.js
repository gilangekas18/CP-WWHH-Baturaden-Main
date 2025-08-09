/**
 * Fungsi ini akan berjalan otomatis saat halaman Villa Agathis selesai dimuat.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Cari tombol "Pesan Sekarang" berdasarkan ID spesifik untuk Agathis
    const pesanButton = document.getElementById('pesan-agathis-btn');

    // Jika tombolnya tidak ditemukan, hentikan eksekusi
    if (!pesanButton) {
        console.error('Tombol dengan ID "pesan-agathis-btn" tidak ditemukan.');
        return;
    }

    // Tambahkan event listener untuk klik pada tombol tersebut
    pesanButton.addEventListener('click', function(event) {
        // 1. Mencegah link langsung berjalan agar kita bisa cek dulu
        event.preventDefault(); 

        // 2. Cek apakah ada token login di localStorage
        const authToken = localStorage.getItem('authToken');

        if (authToken) {
            // 3. JIKA SUDAH LOGIN: Lanjutkan ke halaman pemesanan
            console.log('User sudah login. Mengarahkan ke form pemesanan...');
            // Ambil tujuan dari href tombol itu sendiri
            window.location.href = this.href; 
        } else {
            // 4. JIKA BELUM LOGIN: Tampilkan peringatan dan arahkan ke halaman login
            alert('Anda harus login terlebih dahulu untuk dapat memesan.');
            window.location.href = 'login.html'; // Ganti dengan nama file halaman login Anda
        }
    });
});
