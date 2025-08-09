const API_URL = "http://192.168.248.194:8000/api"; // Ganti jika IP Anda berubah

/**
 * Helper function untuk mengambil token dari localStorage.
 * @returns {string|null} Token otentikasi atau null jika tidak ada.
 */
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

/**
 * ======================================================
 * === FUNGSI LOGIN UNIVERSAL (BARU) ====================
 * ======================================================
 * Fungsi untuk login user & admin melalui satu endpoint.
 */
export async function unifiedLogin(email, password) {
    try {
        // Target endpoint universal yang baru
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login gagal.');
        }
        // Simpan token dan data user ke localStorage
        if (data.access_token) {
            localStorage.setItem('authToken', data.access_token);
            localStorage.setItem('userData', JSON.stringify(data.user));
        }
        // Kembalikan seluruh data, termasuk 'redirect_to'
        return data;
    } catch (error) {
        console.error("Error saat login:", error);
        throw error;
    }
}


// --- Fungsi-fungsi lain yang tetap sama ---

export async function fetchAllVillas() {
    try {
        const response = await fetch(`${API_URL}/villas`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil data villa:", error);
        throw error;
    }
}

export async function fetchRoomTypeById(roomTypeId) {
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

export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 422) {
                const error = new Error("Data yang diberikan tidak valid.");
                error.details = data.errors;
                throw error;
            }
            throw new Error(data.message || 'Terjadi kesalahan pada server.');
        }

        return data;

    } catch (error) {
        throw error;
    }
}

export async function createBooking(bookingFormData) {
    const token = getAuthToken();
    if (!token) {
        const error = new Error('Otentikasi dibutuhkan. Silakan login terlebih dahulu.');
        throw error;
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
            if (response.status === 422 && data.errors) {
                const error = new Error("Data yang diberikan tidak valid.");
                error.details = data.errors;
                throw error;
            }
            throw new Error(data.message || 'Gagal membuat booking.');
        }
        return data;
    } catch (error) {
        console.error("Error saat membuat booking:", error);
        throw error;
    }
}

export async function fetchAllBookings() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Admin authentication required.');

    try {
        const response = await fetch(`${API_URL}/admin/bookings`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch bookings.');
        return await response.json();
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
}

/**
 * Mengupdate status booking (untuk admin).
 * @param {number} bookingId ID dari booking yang akan diupdate.
 * @param {string} newStatus Status baru ('pending', 'confirmed', dll).
 */
export async function updateBookingStatus(bookingId, newStatus) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Admin authentication required.');

    try {
        const response = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update booking status.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating booking:", error);
        throw error;
    }
}

/**
 * Menghapus booking (untuk admin).
 * @param {number} bookingId ID dari booking yang akan dihapus.
 */
export async function deleteBooking(bookingId) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Admin authentication required.');

    try {
        const response = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete booking.');
        return await response.json();
    } catch (error) {
        console.error("Error deleting booking:", error);
        throw error;
    }
}
