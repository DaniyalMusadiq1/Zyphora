<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ComputeDailyScore;
use App\Models\DailyEarning;
use App\Models\Task;
use App\Services\MomentumService;
use App\Services\StreakService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $ttl = (int) config('zyphora.tasks_cache_ttl', 3600);

        $tasks = Cache::remember('tasks:list', $ttl, fn () => Task::query()->orderBy('id')->get());

        return response()->json(['tasks' => $tasks]);
    }

    public function complete(Request $request, int $id, MomentumService $momentum, StreakService $streaks)
    {
        $user = $request->user();
        $task = Task::query()->findOrFail($id);

        if ($user->taskCompletions()->where('task_id', $task->id)->exists()) {
            return response()->json(['message' => 'Task already completed'], 409);
        }

        DB::transaction(function () use ($user, $task, $momentum, $streaks) {
            $user->taskCompletions()->attach($task->id, ['completed_at' => now()]);

            $points = (float) $task->weight_w * (float) $task->rarity_factor;
            $today = Carbon::today()->toDateString();

            $earning = DailyEarning::query()->firstOrNew([
                'user_id' => $user->id,
                'date' => $today,
            ]);
            $earning->earned_pts = (float) ($earning->earned_pts ?? 0) + $points;
            $earning->multiplier_applied = 1;
            $earning->save();

            $score = $user->score()->firstOrCreate([]);
            $momentum->bump($score, min(0.05, $points / 1000));
            $streaks->recordActivity($user);
        });

        ComputeDailyScore::dispatch($user->id);

        return response()->json(['status' => 'ok']);
    }
}
