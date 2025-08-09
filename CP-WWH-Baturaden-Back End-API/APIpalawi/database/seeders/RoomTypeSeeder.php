<?php

namespace Database\Seeders;

use App\Models\RoomType; 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema; // 

class RoomTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RoomType::truncate();
        Schema::enableForeignKeyConstraints();

        $roomTypes = [
            // Data  Villa Ebony (villa_id: 1)
            ['villa_id' => 1, 'name' => 'Standar', 'total_rooms' => 2, 'capacity_per_room' => 2, 'price_per_night' => 350000, 'is_all_in' => false],
            ['villa_id' => 1, 'name' => 'Superior', 'total_rooms' => 6, 'capacity_per_room' => 2, 'price_per_night' => 450000, 'is_all_in' => false],
            ['villa_id' => 1, 'name' => 'Deluxe', 'total_rooms' => 4, 'capacity_per_room' => 2, 'price_per_night' => 500000, 'is_all_in' => false],
            ['villa_id' => 1, 'name' => 'VIP/Executive', 'total_rooms' => 2, 'capacity_per_room' => 2, 'price_per_night' => 600000, 'is_all_in' => false],
            ['villa_id' => 1, 'name' => 'All In Villa', 'total_rooms' => 14, 'capacity_per_room' => 28, 'price_per_night' => 6600000, 'is_all_in' => true],
            
            // Data  Villa Agathis (villa_id: 2)
            ['villa_id' => 2, 'name' => 'All In Villa', 'total_rooms' => 6, 'capacity_per_room' => 12, 'price_per_night' => 2700000, 'is_all_in' => true],
            
            // Data  Villa Accacia (villa_id: 3)
            ['villa_id' => 3, 'name' => 'All In Villa', 'total_rooms' => 4, 'capacity_per_room' => 8, 'price_per_night' => 2400000, 'is_all_in' => true],
        ];

        // Looping dan masukkan data menggunakan model
        foreach ($roomTypes as $type) {
            RoomType::create($type);
        }
    }
}
