<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Villa; 

class VillaController extends Controller
{
    public function index()
    {
        // 'with('roomTypes')' adalah kunci untuk memuat data kamar
        // yang berelasi dengan setiap villa (Eager Loading).
        $villas = Villa::with('roomTypes')->get();

        return response()->json($villas);
    }

    /**
     * Metode untuk menampilkan SATU villa spesifik berdasarkan ID-nya,
     * beserta detail kamar di dalamnya.
     */
    public function show(Villa $villa)
    {
        return response()->json($villa->load('roomTypes'));
    }
}