<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            // Asumsi user yang login yang melakukan booking.
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('room_type_id')->constrained('room_types');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->integer('num_rooms');
            $table->integer('num_guests');
            $table->string('booker_name');
            $table->string('booker_email');
            $table->string('booker_phone');
            $table->boolean('is_for_other_guest')->default(false);
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->integer('extra_beds')->default(0);
            $table->unsignedBigInteger('total_price');
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, completed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};