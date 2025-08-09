<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Villa extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Mendefinisikan kolom 'name' sebagai satu-satunya yang boleh
     * diisi secara massal.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Relasi ke RoomType: Satu villa bisa memiliki banyak tipe kamar.
     */
    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class);
    }
}
