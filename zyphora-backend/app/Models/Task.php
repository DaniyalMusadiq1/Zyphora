<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'weight_w',
        'rarity_factor',
        'is_premium',
    ];

    protected function casts(): array
    {
        return [
            'is_premium' => 'boolean',
            'weight_w' => 'decimal:6',
            'rarity_factor' => 'decimal:6',
        ];
    }

    public function completers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_completions')
            ->withPivot('completed_at')
            ->withTimestamps();
    }
}
