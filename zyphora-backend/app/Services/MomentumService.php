<?php

namespace App\Services;

use App\Models\UserScore;

class MomentumService
{
    public function bump(UserScore $score, float $delta): UserScore
    {
        $score->momentum_m = round(max(0, (float) $score->momentum_m + $delta), 8);
        $score->save();

        return $score;
    }
}
