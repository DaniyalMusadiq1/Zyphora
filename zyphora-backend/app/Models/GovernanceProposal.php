<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GovernanceProposal extends Model
{
    protected $fillable = [
        'title',
        'description',
        'weight',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'weight' => 'decimal:8',
        ];
    }

    public function votes(): HasMany
    {
        return $this->hasMany(GovernanceVote::class, 'proposal_id');
    }
}
