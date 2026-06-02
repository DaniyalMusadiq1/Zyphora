<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'category',
        'icon',
        'action_url',
        'verification_type',
        'weight_w',
        'rarity_factor',
        'is_premium',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_premium' => 'boolean',
            'is_active' => 'boolean',
            'weight_w' => 'decimal:6',
            'rarity_factor' => 'decimal:6',
        ];
    }

    public function completers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_completions')
            ->withPivot('completed_at', 'status', 'proof_data', 'screenshot')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
