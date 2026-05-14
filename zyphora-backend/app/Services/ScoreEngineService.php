<?php

namespace App\Services;

use App\Models\ScoreAudit;
use App\Models\User;
use App\Models\UserScore;

class ScoreEngineService
{
    public function recomputeForUser(User $user): UserScore
    {
        $score = UserScore::firstOrCreate(['user_id' => $user->id]);

        $oldPs = (string) $score->ps_total;

        $m = (float) $score->momentum_m;
        $omega = (float) $score->catch_up_omega;
        $l = (float) $score->loyalty_l;
        $r = (float) $score->referral_r;
        $t = (float) $score->social_t;
        $g = (float) $score->governance_g;
        $phi = (float) $score->zk_phi;

        $ps = $m * 0.22 + $omega * 0.14 + $l * 0.18 + $r * 0.16 + $t * 0.12 + $g * 0.10 + $phi * 0.08;
        $ps *= max(0.5, (float) $user->early_weight_w);
        $ps *= max(0.0, 1.0 - (float) $user->fraud_score);

        $score->ps_total = round($ps, 8);
        $score->save();

        ScoreAudit::create([
            'user_id' => $user->id,
            'old_score' => $oldPs,
            'new_score' => $score->ps_total,
            'trigger_event' => 'recompute',
        ]);

        return $score;
    }

    public function freezeAll(): void
    {
        $now = now();
        UserScore::query()->update(['frozen_at' => $now]);
    }
}
