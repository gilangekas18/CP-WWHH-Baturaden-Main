<?php

namespace Database\Seeders;

use App\Models\Villa; 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema; 

class VillaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Villa::truncate();
        Schema::enableForeignKeyConstraints();

        // Penjelasan: Menggunakan Villa::create() lebih bersih.
        $villas = [
            ['id' => 1, 'name' => 'Villa Ebony'],
            ['id' => 2, 'name' => 'Villa Agathis'],
            ['id' => 3, 'name' => 'Villa Accacia'],
        ];

        // Looping dan masukkan data menggunakan model
        foreach ($villas as $villa) {
            Villa::create($villa);
        }
    }
}
