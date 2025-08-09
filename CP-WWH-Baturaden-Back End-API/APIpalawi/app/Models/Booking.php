<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'room_type_id',
        'check_in_date',
        'check_out_date',
        'num_rooms',
        'num_guests',
        'booker_name',
        'booker_email',
        'booker_phone',
        'is_for_other_guest',
        'guest_name',
        'guest_email',
        'guest_phone',
        'extra_beds',
        'total_price',
        'notes',
        'status',
    ];

    /**
     * Relasi ke RoomType: Booking untuk tipe kamar.
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    /**
     * Relasi ke User: Booking dibuat oleh siapa.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}