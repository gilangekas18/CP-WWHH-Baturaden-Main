document.addEventListener('DOMContentLoaded', function() {
    // --- Logika Sidebar Popup ---
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn'); // Tombol hamburger
    const closeSidebarBtn = document.getElementById('closeSidebarBtn'); // Tombol X di dalam sidebar
    const overlay = document.getElementById('overlay'); // Overlay

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Mencegah scrolling body
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Mengembalikan scrolling body
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', openSidebar);
    } else {
        console.warn("Elemen 'menuToggleBtn' tidak ditemukan.");
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    } else {
        console.warn("Elemen 'closeSidebarBtn' tidak ditemukan.");
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    if (sidebar) {
        sidebar.addEventListener('click', function(event) {
            event.stopPropagation(); // Mencegah event click menyebar ke overlay/body
        });
    }

    // --- Logika User Session Dropdown Popup ---
    const userDropdownContainer = document.getElementById('userDropdownContainer');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (userDropdownContainer && userDropdownMenu) {
        // Toggle dropdown saat container diklik
        userDropdownContainer.addEventListener('click', function(event) {
            userDropdownMenu.classList.toggle('active');
            event.stopPropagation(); // Mencegah klik menyebar ke document dan langsung menutup
        });

        // Tutup dropdown jika mengklik di luar
        document.addEventListener('click', function(event) {
            if (userDropdownMenu.classList.contains('active') && !userDropdownContainer.contains(event.target)) {
                userDropdownMenu.classList.remove('active');
            }
        });
    } else {
        console.warn("Elemen 'userDropdownContainer' atau 'userDropdownMenu' tidak ditemukan.");
    }

    // --- Logika Chart.js ---
    const bookingChartCtx = document.getElementById('bookingChart');
    if (bookingChartCtx) {
        const bookingData = {
            labels: ['Tiket.com', 'Traveloka', 'Booking.com', 'Airbnb'],
            datasets: [{
                data: [20, 40, 30, 10],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#E91E63'
                ],
                hoverOffset: 10,
                borderColor: '#fff',
                borderWidth: 2
            }]
        };

        const bookingConfig = {
            type: 'doughnut',
            data: bookingData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + '%';
                                }
                                return label;
                            }
                        },
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        displayColors: true
                    }
                }
            }
        };
        new Chart(bookingChartCtx, bookingConfig);
    } else {
        console.warn("Elemen 'bookingChart' tidak ditemukan. Pastikan ID sudah benar di HTML.");
    }

    // --- Logika Interaktivitas Sidebar Nav Links (untuk penanda active) ---
    const navLinks = document.querySelectorAll('.sidebar .main-nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            navLinks.forEach(item => item.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Tutup sidebar setelah mengklik item menu karena dia adalah popup
            closeSidebar(); 
        });
    });
});