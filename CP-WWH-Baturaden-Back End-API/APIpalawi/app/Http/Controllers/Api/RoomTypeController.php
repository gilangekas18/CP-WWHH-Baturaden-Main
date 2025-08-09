<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; // Import Validator

class RoomTypeController extends Controller
{
    /**
     * Menampilkan daftar semua tipe kamar dari semua villa.
     */
    public function index()
    {
        // Mengambil semua tipe kamar, dan memuat data villa pemiliknya
        $roomTypes = RoomType::with('villa')->get();

        return response()->json($roomTypes);
    }

    /**
     * Menampilkan satu tipe kamar spesifik berdasarkan ID-nya.
     */
    public function show(RoomType $roomType)
    {
        // Laravel akan otomatis menemukan RoomType berdasarkan ID di URL
        return response()->json($roomType->load('villa'));
    }

    // fungsi update harga
    public function update(Request $request, RoomType $roomType)
    {
        // 1. Validasi data yang masuk
        // PERUBAHAN: Validasi sekarang hanya mengizinkan 'price_per_night'
        $validator = Validator::make($request->all(), [
            'price_per_night' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Update data di database
        $roomType->update($validator->validated());

        // 3. Kembalikan respons sukses beserta data yang sudah diupdate
        return response()->json([
            'message' => 'Room type details updated successfully.',
            'data' => $roomType
        ]);
    }
}
