<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GovernanceVote extends Model
{
    protected $fillable = [
        'user_id',
        'proposal_id',
        'vote',
        'alignment_score',
    ];

    protected function casts(): array
    {
        return [
            'vote' => 'boolean',
            'alignment_score' => 'decimal:6',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(GovernanceProposal::class, 'proposal_id');
    }
}
