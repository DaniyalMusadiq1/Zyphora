<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScoreAudit extends Model
{
    protected $fillable = [
        'user_id',
        'old_score',
        'new_score',
        'trigger_event',
    ];

    protected function casts(): array
    {
        return [
            'old_score' => 'decimal:8',
            'new_score' => 'decimal:8',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
