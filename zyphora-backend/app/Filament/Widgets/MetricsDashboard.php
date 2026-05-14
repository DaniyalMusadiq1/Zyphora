<?php

namespace App\Filament\Widgets;

use App\Models\DailyEarning;
use App\Models\Streak;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class MetricsDashboard extends BaseWidget
{
    protected ?string $heading = 'Zyphora metrics';

    protected function getStats(): array
    {
        $today = now()->toDateString();

        $dau = DailyEarning::query()->whereDate('date', $today)->distinct()->count('user_id');

        $mau = DailyEarning::query()
            ->whereBetween('date', [now()->subDays(30)->toDateString(), now()->toDateString()])
            ->distinct()
            ->count('user_id');

        $avgStreak = round((float) (Streak::query()->avg('current_streak') ?? 0), 2);

        $tierRows = User::query()
            ->select('kyc_tier', DB::raw('count(*) as c'))
            ->groupBy('kyc_tier')
            ->orderBy('kyc_tier')
            ->get();

        $tierLabel = $tierRows->map(fn ($r) => 'T'.$r->kyc_tier.':'.$r->c)->implode(' · ');

        return [
            Stat::make('DAU (check-ins today)', $dau)->description('Distinct miners with earnings today'),
            Stat::make('MAU (30d)', $mau)->description('Distinct miners active in last 30 days'),
            Stat::make('Avg streak', $avgStreak)->description('Mean current streak length'),
            Stat::make('Tier distribution', $tierLabel ?: '—')->description('Counts by kyc_tier'),
        ];
    }
}
