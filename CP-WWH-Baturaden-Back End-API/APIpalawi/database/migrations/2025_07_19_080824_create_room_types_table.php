<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('villa_id')->constrained('villas')->onDelete('cascade');
            $table->string('name');
            $table->integer('total_rooms');
            $table->integer('capacity_per_room');
            $table->unsignedBigInteger('price_per_night');
            $table->boolean('is_all_in')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};