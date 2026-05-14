<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserScore extends Model
{
    protected $fillable = [
        'user_id',
        'ps_total',
        'momentum_m',
        'catch_up_omega',
        'loyalty_l',
        'referral_r',
        'social_t',
        'governance_g',
        'zk_phi',
        'frozen_at',
        'merkle_hash',
    ];

    protected function casts(): array
    {
        return [
            'frozen_at' => 'datetime',
            'ps_total' => 'decimal:8',
            'momentum_m' => 'decimal:8',
            'catch_up_omega' => 'decimal:8',
            'loyalty_l' => 'decimal:8',
            'referral_r' => 'decimal:8',
            'social_t' => 'decimal:8',
            'governance_g' => 'decimal:8',
            'zk_phi' => 'decimal:8',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
