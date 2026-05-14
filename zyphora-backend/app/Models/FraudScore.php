<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudScore extends Model
{
    protected $fillable = [
        'user_id',
        'f1_device',
        'f2_velocity',
        'f3_geo',
        'f4_pattern',
        'f5_network',
        'f6_identity',
        'f7_timing',
        'sigma_total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'f1_device' => 'decimal:6',
            'f2_velocity' => 'decimal:6',
            'f3_geo' => 'decimal:6',
            'f4_pattern' => 'decimal:6',
            'f5_network' => 'decimal:6',
            'f6_identity' => 'decimal:6',
            'f7_timing' => 'decimal:6',
            'sigma_total' => 'decimal:6',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
