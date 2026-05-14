<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserScore;

class CatchUpService
{
    public function applyOmega(User $user, UserScore $score): UserScore
    {
        $networkAvg = (float) UserScore::query()->avg('ps_total');
        $userPs = (float) $score->ps_total;
        $gap = max(0.0, $networkAvg - $userPs);
        $omega = min(1.0, $gap / max(1.0, $networkAvg));
        $score->catch_up_omega = round($omega, 8);
        $score->save();

        return $score;
    }
}
