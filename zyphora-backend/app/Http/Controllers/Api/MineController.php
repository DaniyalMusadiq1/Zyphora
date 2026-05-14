<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ComputeDailyScore;
use App\Jobs\FraudScan;
use App\Models\DailyEarning;
use App\Services\MomentumService;
use App\Services\StreakService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MineController extends Controller
{
    public function checkin(Request $request, StreakService $streaks, MomentumService $momentum)
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $streaks, $momentum) {
            $streaks->recordActivity($user);

            $today = Carbon::today()->toDateString();
            $earning = DailyEarning::query()->firstOrNew([
                'user_id' => $user->id,
                'date' => $today,
            ]);
            $earning->earned_pts = (float) ($earning->earned_pts ?? 0) + 1;
            $earning->multiplier_applied = 1;
            $earning->save();

            $score = $user->score()->firstOrCreate([]);
            $momentum->bump($score, 0.01);
        });

        ComputeDailyScore::dispatch($user->id);
        FraudScan::dispatch($user->id);

        return response()->json([
            'status' => 'ok',
            'streak' => $user->fresh()->streak,
        ]);
    }
}
