<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ScoreController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $ttl = (int) config('zyphora.score_cache_ttl', 300);

        $score = Cache::remember('score:'.$user->id, $ttl, function () use ($user) {
            return UserScore::query()->firstOrCreate(['user_id' => $user->id]);
        });

        return response()->json(['score' => $score]);
    }
}
