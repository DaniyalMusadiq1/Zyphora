<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Streak extends Model
{
    protected $fillable = [
        'user_id',
        'current_streak',
        'best_streak',
        'shields_banked',
        'last_active_date',
        'streak_broken_at',
    ];

    protected function casts(): array
    {
        return [
            'last_active_date' => 'date',
            'streak_broken_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
