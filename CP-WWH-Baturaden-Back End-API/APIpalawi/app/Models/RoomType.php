<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomType extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'villa_id',
        'name',
        'total_rooms',
        'capacity_per_room',
        'price_per_night',
        'is_all_in',
    ];

    /**
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_rooms' => 'integer',
        'capacity_per_room' => 'integer',
        'price_per_night' => 'integer',
        'is_all_in' => 'boolean',
    ];

    /**
     * Relasi ke Villa: Tipe kamar ini milik villa mana.
     */
    public function villa(): BelongsTo
    {
        return $this->belongsTo(Villa::class);
    }
}
