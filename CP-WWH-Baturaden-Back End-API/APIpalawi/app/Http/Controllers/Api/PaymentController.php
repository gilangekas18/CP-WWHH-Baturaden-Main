<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking; // Import model Booking
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Import DB untuk transaksi
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Throwable;

class PaymentController extends Controller
{
    public function index()
    {
        return response()->json(Payment::with('booking')->latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id|unique:payments,booking_id',
            'method' => 'required|in:cash,qris',
            'proof_file' => 'required_if:method,qris|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $path = null;
        if ($request->hasFile('proof_file')) {
            $path = $request->file('proof_file')->store('proofs', 'public');
        }

        $payment = Payment::create([
            'booking_id' => $request->booking_id,
            'method' => $request->method,
            'proof_of_payment' => $path,
            'status' => 'paid',
        ]);

        return response()->json($payment, 201);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load('booking'));
    }

    /**
     * UPDATE
     * Memverifikasi pembayaran dan secara otomatis mengkonfirmasi booking.
     */
    public function update(Request $request, Payment $payment)
    {
        $validator = Validator::make($request->all(), [
            // Status yang diizinkan untuk di-update oleh admin
            'status' => 'required|in:unpaid,paid,verified',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Penjelasan: Menggunakan transaksi database.
        // Ini memastikan bahwa kedua update (Payment dan Booking) berhasil,
        // atau keduanya gagal. Tidak akan ada data yang setengah-setengah.
        try {
            DB::transaction(function () use ($payment, $request) {
                // Langkah 1: Update status payment
                $payment->update(['status' => $request->status]);

                // Langkah 2: Logika Bisnis Tambahan.
                // Jika status payment diubah menjadi 'verified', maka...
                if ($request->status === 'verified') {
                    // ...temukan booking yang terkait dan update statusnya menjadi 'confirmed'.
                    $payment->booking()->update(['status' => 'confirmed']);
                }
            });

            return response()->json([
                'message' => 'Status pembayaran berhasil diperbarui.',
                // Muat ulang relasi booking untuk menunjukkan data terbaru
                'data' => $payment->load('booking')
            ]);

        } catch (Throwable $e) {
            Log::error('Gagal update status pembayaran: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);
        }
    }

    public function destroy(Payment $payment)
    {
        if ($payment->proof_of_payment) {
            Storage::disk('public')->delete($payment->proof_of_payment);
        }
        $payment->delete();
        return response()->json(['message' => 'Payment record deleted successfully.']);
    }
}
