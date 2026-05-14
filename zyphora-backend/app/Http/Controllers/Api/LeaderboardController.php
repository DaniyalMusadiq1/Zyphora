<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $ttl = (int) config('zyphora.leaderboard_cache_ttl', 600);

        $rows = Cache::remember('leaderboard:top', $ttl, function () {
            return UserScore::query()
                ->with('user:id,name')
                ->orderByDesc('ps_total')
                ->limit(100)
                ->get()
                ->map(fn ($s) => [
                    'user_id' => $s->user_id,
                    'name' => $s->user?->name ?? 'Miner',
                    'ps_total' => $s->ps_total,
                ]);
        });

        return response()->json(['leaderboard' => $rows]);
    }
}
