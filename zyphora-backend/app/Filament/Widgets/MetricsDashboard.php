<?php

namespace App\Filament\Widgets;

use App\Models\DailyEarning;
use App\Models\Streak;
use App\Models\User;
use App\Models\KycVerification;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class MetricsDashboard extends BaseWidget
{
    protected ?string $heading = 'Zyphora Platform Metrics';

    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        $today = now()->toDateString();

        $dau = DailyEarning::query()->whereDate('date', $today)->distinct()->count('user_id');

        $mau = DailyEarning::query()
            ->whereBetween('date', [now()->subDays(30)->toDateString(), now()->toDateString()])
            ->distinct()
            ->count('user_id');

        $avgStreak = round((float) (Streak::query()->avg('current_streak') ?? 0), 2);

        $totalUsers = User::count();
        $verifiedUsers = User::where('kyc_tier', '>', 0)->count();
        $pendingKyc = KycVerification::where('status', 'pending')->count();
        
        $fraudAlerts = DB::table('fraud_scores')
            ->where('sigma_total', '>=', 0.5)
            ->count();

        $tierRows = User::query()
            ->select('kyc_tier', DB::raw('count(*) as c'))
            ->groupBy('kyc_tier')
            ->orderBy('kyc_tier')
            ->get();

        $tierLabel = $tierRows->map(fn ($r) => 'T'.$r->kyc_tier.':'.$r->c)->implode(' · ') ?: 'No users';

        return [
            Stat::make('👥 Total Miners', number_format($totalUsers))
                ->description('Registered users on platform')
                ->color('primary'),
            
            Stat::make('✅ KYC Verified', number_format($verifiedUsers))
                ->description(($totalUsers > 0 ? round(($verifiedUsers / $totalUsers) * 100, 1) : 0) . '% of total users')
                ->color('success'),
            
            Stat::make('⏳ Pending KYC', number_format($pendingKyc))
                ->description('Awaiting admin review')
                ->color('warning'),
            
            Stat::make('📊 DAU', number_format($dau))
                ->description('Active miners today')
                ->color('info'),
            
            Stat::make('📈 MAU (30d)', number_format($mau))
                ->description('Active in last 30 days')
                ->color('info'),
            
            Stat::make('🔥 Avg Streak', $avgStreak)
                ->description('Mean current streak length')
                ->color('success'),
            
            Stat::make('⚠️ Fraud Alerts', number_format($fraudAlerts))
                ->description('High-risk accounts flagged')
                ->color($fraudAlerts > 0 ? 'danger' : 'success'),
            
            Stat::make('🏷️ Tier Distribution', $tierLabel)
                ->description('Counts by KYC tier')
                ->color('gray'),
        ];
    }
}
