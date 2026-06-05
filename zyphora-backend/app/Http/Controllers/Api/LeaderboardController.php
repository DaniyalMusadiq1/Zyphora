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
        $page = (int) $request->get('page', 1);
        $limit = (int) $request->get('limit', 50);
        
        // Enforce reasonable limits
        $limit = min(max($limit, 1), 100);

        $cacheKey = "leaderboard:top:{$page}:{$limit}";

        $result = Cache::remember($cacheKey, $ttl, function () use ($limit) {
            return UserScore::query()
                ->with(['user' => function ($query) {
                    $query->select('id', 'name', 'referral_code');
                }])
                ->orderByDesc('ps_total')
                ->limit(100)
                ->get()
                ->map(fn ($s) => [
                    'user_id' => $s->user_id,
                    'name' => $s->user?->name ?? 'Miner',
                    'referral_code' => $s->user?->referral_code ?? null,
                    'ps_total' => $s->ps_total,
                ]);
        });
        
        // Apply pagination manually since we're using cached collection
        $total = count($result);
        $offset = ($page - 1) * $limit;
        $paginatedRows = array_slice($result->toArray(), $offset, $limit);

        return response()->json([
            'success' => true,
            'data' => $paginatedRows,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'last_page' => (int) ceil($total / $limit),
                'has_more' => $offset + $limit < $total,
            ],
        ]);
    }
}
