<?php

namespace App\Services;

use App\Models\FraudScore;
use App\Models\User;
use App\Models\DeviceRegistry;
use Carbon\Carbon;

class FraudScorerService
{
    public function rescore(User $user): FraudScore
    {
        $row = FraudScore::firstOrCreate(['user_id' => $user->id]);

        // F1: Device Risk - Check if device has multiple accounts
        $deviceCount = DeviceRegistry::where('device_id', $user->devices()->first()?->device_id)
            ->distinct('user_id')
            ->count('user_id');
        $row->f1_device = min(1.0, ($deviceCount - 1) * 0.5);

        // F2: Velocity - Check registration and activity velocity
        $accountAgeHours = max(1, $user->created_at->diffInHours());
        $row->f2_velocity = min(1.0, 24 / $accountAgeHours); // Higher score for newer accounts

        // F3: Geo Risk - Check for IP/location inconsistencies
        $recentLogins = DeviceRegistry::where('user_id', $user->id)
            ->orderBy('last_used_at', 'desc')
            ->limit(5)
            ->get(['location_country', 'ip_address']);
        
        $uniqueCountries = $recentLogins->pluck('location_country')->filter()->unique()->count();
        $row->f3_geo = min(1.0, ($uniqueCountries - 1) * 0.25);

        // F4: Pattern Detection - Check for bot-like behavior
        $taskCompletions = $user->taskCompletions()
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->count();
        $row->f4_pattern = min(1.0, $taskCompletions / 20); // Flag if >20 tasks/hour

        // F5: Network Risk - Check IP reputation (simplified)
        $ipAddress = $user->devices()->first()?->ip_address;
        $isPrivateIp = $ipAddress && (
            filter_var($ipAddress, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false
        );
        $row->f5_network = $isPrivateIp ? 0.3 : 0.0;

        // F6: Identity Verification Status
        $row->f6_identity = $user->kyc_tier >= 2 ? 0.0 : ($user->phone_hash ? 0.2 : 0.5);

        // F7: Timing Anomalies - Check for unusual activity hours
        $recentActivity = $user->streak()
            ->where('last_activity', '>=', Carbon::now()->subDays(7))
            ->first();
        
        $row->f7_timing = 0.0; // Can be enhanced with ML-based timing analysis

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
