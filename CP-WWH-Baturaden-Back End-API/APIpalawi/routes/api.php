<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VillaController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;


//===== ROUTE PUBLIC TIDAK PERLU LOGIN ======
// --- Otentikasi ---
Route::post('/register', [AuthController::class, 'register']);

// PERUBAHAN: Menggunakan satu endpoint login universal
Route::post('/login', [AuthController::class, 'unifiedLogin']);

// --- Menampilkan Data Villa & Kamar ---
Route::get('/villas', [VillaController::class, 'index']);
Route::get('/villas/{villa}', [VillaController::class, 'show']);
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::get('/room-types/{roomType}', [RoomTypeController::class, 'show']);


// === RUTE TERPROTEKSI (Wajib Login via Sanctum) ===
Route::middleware('auth:sanctum')->group(function () {

    // --- Rute untuk SEMUA user yang sudah login (user biasa & admin) ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // --- Rute Booking (Sekarang Wajib Login) ---
    Route::post('/bookings', [BookingController::class, 'store']);

    // === RUTE KHUSUS ADMIN ===
    Route::prefix('admin')->group(function () {

        // --- Booking Manager & Super Admin (akses booking) ---
        Route::middleware('role:super-admin|booking-manager')->group(function () {
            Route::get('/bookings', [BookingController::class, 'index']);
            Route::get('/bookings/{booking}', [BookingController::class, 'show']);
            Route::put('/bookings/{booking}', [BookingController::class, 'update']);
        });

        // --- Super Admin saja (akses penuh) ---
        Route::middleware('role:super-admin')->group(function () {
            Route::put('/room-types/{roomType}', [RoomTypeController::class, 'update']);
            Route::get('/payments', [PaymentController::class, 'index']);
            Route::get('/payments/{payment}', [PaymentController::class, 'show']);
            Route::put('/payments/{payment}', [PaymentController::class, 'update']);
            Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);
            Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);
        });
    });

    // --- Upload bukti pembayaran (user biasa) ---
    Route::post('/payments', [PaymentController::class, 'store']);
});
