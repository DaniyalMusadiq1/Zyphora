<?php

namespace App\Services;

use App\Models\FraudScore;
use App\Models\User;

class FraudScorerService
{
    public function rescore(User $user): FraudScore
    {
        $row = FraudScore::firstOrCreate(['user_id' => $user->id]);

        $signals = [
            (float) $row->f1_device,
            (float) $row->f2_velocity,
            (float) $row->f3_geo,
            (float) $row->f4_pattern,
            (float) $row->f5_network,
            (float) $row->f6_identity,
            (float) $row->f7_timing,
        ];

        $sigma = array_sum($signals) / max(1, count($signals));
        $row->sigma_total = round($sigma, 6);

        if ($sigma >= 0.7) {
            $row->status = 'banned';
        } elseif ($sigma >= 0.45) {
            $row->status = 'suspended';
        } elseif ($sigma >= 0.2) {
            $row->status = 'flagged';
        } else {
            $row->status = 'clean';
        }

        $row->save();

        $user->fraud_score = $row->sigma_total;
        $user->save();

        return $row;
    }
}
