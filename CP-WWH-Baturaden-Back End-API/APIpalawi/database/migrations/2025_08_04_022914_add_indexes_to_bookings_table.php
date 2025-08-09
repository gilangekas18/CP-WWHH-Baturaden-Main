<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Menambahkan indeks pada kolom foreign key
            $table->index('user_id');
            $table->index('room_type_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Perintah untuk menghapus indeks jika migrasi di-rollback
            $table->dropIndex(['user_id']);
            $table->dropIndex(['room_type_id']);
        });
    }
};