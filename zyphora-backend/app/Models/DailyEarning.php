<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyEarning extends Model
{
    protected $fillable = [
        'user_id',
        'earned_pts',
        'multiplier_applied',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'earned_pts' => 'decimal:8',
            'multiplier_applied' => 'decimal:6',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
