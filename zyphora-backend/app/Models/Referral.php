<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    protected $fillable = [
        'referrer_id',
        'referee_id',
        'quality_score',
        'matured_at',
        'gamma_penalty',
    ];

    protected function casts(): array
    {
        return [
            'matured_at' => 'datetime',
            'quality_score' => 'decimal:6',
            'gamma_penalty' => 'decimal:6',
        ];
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referee_id');
    }
}
