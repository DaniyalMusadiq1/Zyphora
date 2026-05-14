<?php

namespace App\Services;

use App\Models\Streak;
use App\Models\User;
use Carbon\CarbonInterface;

class StreakService
{
    public function recordActivity(User $user, ?CarbonInterface $date = null): Streak
    {
        $day = ($date ?? now())->toDateString();

        $streak = Streak::firstOrCreate(
            ['user_id' => $user->id],
            [
                'current_streak' => 0,
                'best_streak' => 0,
                'shields_banked' => 0,
                'last_active_date' => null,
            ]
        );

        $last = $streak->last_active_date?->toDateString();

        if ($last === $day) {
            return $streak;
        }

        $yesterday = now()->subDay()->toDateString();

        if ($last === $yesterday) {
            $streak->current_streak += 1;
        } elseif ($last !== null) {
            $streak->current_streak = 1;
            $streak->streak_broken_at = now();
        } else {
            $streak->current_streak = 1;
        }

        $streak->best_streak = max((int) $streak->best_streak, (int) $streak->current_streak);
        $streak->last_active_date = $day;
        $streak->save();

        return $streak;
    }
}
