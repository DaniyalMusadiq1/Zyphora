<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceRegistry extends Model
{
    protected $table = 'device_registry';   // ← crucial

    protected $fillable = [
        'device_id',
        'user_id',
        'ip_address',
        'user_agent',
        'location_city',
        'location_country',
        'last_used_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}