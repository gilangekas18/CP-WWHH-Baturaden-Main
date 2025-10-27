document.addEventListener('DOMContentLoaded', () => {
    const pesanButton = document.getElementById('pesan-accacia-btn');

    if (!pesanButton) {
        console.error('Tombol dengan ID "pesan-accacia-btn" tidak ditemukan.');
        return;
    }

    pesanButton.addEventListener('click', function(event) {
        event.preventDefault(); 

    
        const authToken = localStorage.getItem('authToken');

        if (authToken) {
     
            console.log('User sudah login. Mengarahkan ke form pemesanan...');

            window.location.href = this.href; 
        } else {
     
            alert('Anda harus login terlebih dahulu untuk dapat memesan.');
            window.location.href = '/includes/login.html'; 
        }
    });
});
