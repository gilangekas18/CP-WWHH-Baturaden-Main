<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Metode untuk registrasi user baru.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Berikan role 'user' secara default
        $user->assignRole('user');

        $token = $user->createToken('auth_token_user')->plainTextToken;

        return response()->json([
            'message' => 'User successfully registered',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    /**
     * === FUNGSI LOGIN UNIVERSAL (BARU) ================================
     * Metode login tunggal untuk semua pengguna (user & admin).
     * Backend akan memeriksa peran dan memberitahu frontend tujuan redirect.
     */
    public function unifiedLogin(Request $request)
    {
        // Validasi input
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // otentikasi
        if (Auth::attempt($credentials)) {
            /** @var \App\Models\User $user */
            $user = Auth::user(); // Ambil data user yang berhasil login

            // 3. KEAMANAN :Periksa peran (role) user
            if ($user->hasRole(['super-admin', 'booking-manager'])) {
                // --- JIKA DIA ADALAH ADMIN ---
                $token = $user->createToken('auth_token_admin')->plainTextToken;
                
                // Kembalikan respons dengan tujuan redirect ke dashboard admin
                return response()->json([
                    'message'        => 'Admin login successful',
                    'access_token'   => $token,
                    'token_type'     => 'Bearer',
                    'user'           => $user,
                    'redirect_to'    => 'admin-dashboard.html' // Petunjuk untuk frontend
                ]);

            } else {
                // --- JIKA DIA ADALAH USER BIASA ---
                $token = $user->createToken('auth_token_user')->plainTextToken;

                // Kembalikan respons dengan tujuan redirect ke halaman utama
                return response()->json([
                    'message'        => 'User login successful',
                    'access_token'   => $token,
                    'token_type'     => 'Bearer',
                    'user'           => $user,
                    'redirect_to'    => 'index.html' // Petunjuk untuk frontend
                ]);
            }
        }

        // Jika otentikasi gagal
        return response()->json(['message' => 'Email atau password salah.'], 401);
    }


    /**
     * Logout berlaku untuk semua user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Successfully logged out']);
    }
}
