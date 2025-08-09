<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;
use Carbon\Carbon;
use App\Models\Payment;

class BookingController extends Controller
{
    /**
     * READ: Menampilkan semua data booking (Untuk Admin).
     */
    public function index()
    {
        $bookings = Booking::with(['roomType', 'payment', 'user'])->latest()->get();
        return response()->json($bookings);
    }

    /**
     * CREATE: Menyimpan data booking baru
     */
    public function store(Request $request)
    {
        // Validator tabel
        $validator = Validator::make($request->all(), [
            'room_type_id' => 'required|exists:room_types,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'num_rooms' => 'required|integer|min:1',
            'num_guests' => 'required|integer|min:1',
            'booker_name' => 'required|string|max:255',
            'booker_email' => 'required|email',
            'booker_phone' => 'required|string',
            'is_for_other_guest' => 'required|boolean',
            'guest_name' => 'required_if:is_for_other_guest,1|string|max:255|nullable',
            'guest_email' => 'required_if:is_for_other_guest,1|email|nullable',
            'guest_phone' => 'required_if:is_for_other_guest,1|string|nullable',
            'total_price' => 'required|numeric',
            'extra_beds' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:cash,qris',
            'proof_file' => 'required_if:payment_method,qris|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $booking = DB::transaction(function () use ($request, $validator) {

                // Ambil semua data yang sudah divalidasi
                $validatedData = $validator->validated();

                // Mengikat booking dengan user yang sedang login.
                $bookingData = array_merge($validatedData, [
                    'user_id' => Auth::id(),
                    'status' => 'pending'
                ]);

                // Hapus data yang tidak ada di tabel 'bookings' sebelum create
                unset($bookingData['payment_method'], $bookingData['proof_file']);

                $booking = Booking::create($bookingData);

                // Proses upload file bukti pembayaran
                $path = null;
                if ($request->hasFile('proof_file')) {
                    $path = $request->file('proof_file')->store('proofs', 'public');
                }

                // Buat data pembayaran
                $booking->payment()->create([
                    'method' => $request->payment_method, // Ambil dari request asli
                    'proof_of_payment' => $path,
                    'status' => $request->payment_method == 'qris' ? 'paid' : 'unpaid',
                ]);

                return $booking;
            });

            return response()->json([
                'message' => 'Booking berhasil dibuat.',
                'data' => $booking->load('payment')
            ], 201);
        } catch (Throwable $e) {
            Log::error('Gagal membuat booking: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server saat membuat booking.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * READ: Menampilkan satu data booking spesifik.
     */
    public function show(Booking $booking)
    {
        return response()->json($booking->load(['roomType', 'payment', 'user']));
    }

    /**
     * UPDATE: Memperbarui data booking.
     */
    public function update(Request $request, Booking $booking)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if ($user->hasRole(['super-admin', 'booking-manager'])) {
            $booking->update($validator->validated());
        } else {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melakukan tindakan ini.'], 403);
        }

        return response()->json([
            'message' => 'Booking berhasil diperbarui.',
            'data' => $booking
        ]);
    }

    /**
     * DELETE: Menghapus data booking.
     */
    public function destroy(Booking $booking)
    {
        if ($booking->payment && $booking->payment->proof_of_payment) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($booking->payment->proof_of_payment);
        }

        $booking->delete();
        return response()->json(['message' => 'Booking berhasil dihapus.'], 200);
    }
}
