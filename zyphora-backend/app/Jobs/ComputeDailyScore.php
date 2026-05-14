<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\CatchUpService;
use App\Services\ScoreEngineService;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ComputeDailyScore implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $userId) {}

    public function handle(ScoreEngineService $engine, CatchUpService $catchUp): void
    {
        $user = User::query()->find($this->userId);
        if (! $user) {
            return;
        }

        $score = $user->score ?? $user->score()->create([]);
        $catchUp->applyOmega($user, $score);
        $engine->recomputeForUser($user);

        Cache::forget('leaderboard:top');
        Cache::forget('score:'.$user->id);
    }
}
