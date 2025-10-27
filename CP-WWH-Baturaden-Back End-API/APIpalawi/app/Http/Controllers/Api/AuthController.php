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
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            // Muat data role agar dikirim ke frontend
            $user->load('roles');

            if ($user->hasRole(['super-admin', 'booking-manager'])) {
                // --- ADMIN ---
                $token = $user->createToken('auth_token_admin')->plainTextToken;

                return response()->json([
                    'message'      => 'Admin login successful',
                    'access_token' => $token,
                    'token_type'   => 'Bearer',
                    'user'         => $user, // sudah berisi roles
                    'redirect_to'  => 'admin-dashboard.html'
                ]);
            } else {
                // --- USER BIASA ---
                $token = $user->createToken('auth_token_user')->plainTextToken;

                return response()->json([
                    'message'      => 'User login successful',
                    'access_token' => $token,
                    'token_type'   => 'Bearer',
                    'user'         => $user, // sudah berisi roles
                    'redirect_to'  => 'index.html'
                ]);
            }
        }

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
