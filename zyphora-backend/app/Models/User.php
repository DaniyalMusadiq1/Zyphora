<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'phone_hash',
        'device_id',
        'name',
        'email',
        'kyc_tier',
        'fraud_score',
        'depth_score_d',
        'joined_at',
        'early_weight_w',
        'is_banned',
        'referrer_id',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'joined_at' => 'datetime',
            'is_banned' => 'boolean',
            'kyc_tier' => 'integer',
            'fraud_score' => 'decimal:6',
            'depth_score_d' => 'decimal:6',
            'early_weight_w' => 'decimal:6',
        ];
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referralsGiven(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function score(): HasOne
    {
        return $this->hasOne(UserScore::class);
    }

    public function streak(): HasOne
    {
        return $this->hasOne(Streak::class);
    }

    public function dailyEarnings(): HasMany
    {
        return $this->hasMany(DailyEarning::class);
    }

    public function fraudScore(): HasOne
    {
        return $this->hasOne(FraudScore::class);
    }

    public function kycVerifications(): HasMany
    {
        return $this->hasMany(KycVerification::class);
    }

    public function governanceVotes(): HasMany
    {
        return $this->hasMany(GovernanceVote::class);
    }

    public function taskCompletions(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_completions')
            ->withPivot('completed_at')
            ->withTimestamps();
    }
}
