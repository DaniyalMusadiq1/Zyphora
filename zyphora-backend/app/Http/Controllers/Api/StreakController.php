<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Streak;
use App\Services\StreakService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StreakController extends Controller
{
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            $streak = $user->streak ?? new Streak([
                'current_streak' => 0,
                'best_streak' => 0,
                'shields_banked' => 0,
                'last_active_date' => null,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'current_streak' => (int) $streak->current_streak,
                    'best_streak' => (int) $streak->best_streak,
                    'shields_banked' => (int) $streak->shields_banked,
                    'last_active_date' => $streak->last_active_date?->toDateString(),
                    'streak_broken_at' => $streak->streak_broken_at?->toISOString(),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching streak: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch streak data',
            ], 500);
        }
    }

    public function checkin(Request $request, StreakService $streakService)
    {
        try {
            $user = $request->user();
            
            DB::transaction(function () use ($user, $streakService) {
                $streak = $streakService->recordActivity($user);
                
                // Award points for check-in
                if ($streak->wasRecentlyCreated || $streak->current_streak > 1) {
                    $bonusPoints = min($streak->current_streak * 10, 500);
                    $user->score()->firstOrCreate([])->increment('ps_total', $bonusPoints);
                }
            });

            $freshStreak = $user->fresh()->streak;

            return response()->json([
                'success' => true,
                'message' => 'Check-in successful! Keep the streak alive!',
                'data' => [
                    'current_streak' => (int) $freshStreak->current_streak,
                    'best_streak' => (int) $freshStreak->best_streak,
                    'shields_banked' => (int) $freshStreak->shields_banked,
                    'last_active_date' => $freshStreak->last_active_date?->toDateString(),
                    'points_earned' => min($freshStreak->current_streak * 10, 500),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error checking in streak: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record check-in. Please try again.',
            ], 500);
        }
    }
}
