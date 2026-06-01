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
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        try {
            $ttl = (int) config('zyphora.tasks_cache_ttl', 3600);
            $user = $request->user();

            $tasks = Cache::remember('tasks:list:'.$user->id, $ttl, function () {
                return Task::query()->orderBy('category')->orderBy('weight_w', 'desc')->get();
            });

            // Get user's completed task IDs
            $completedIds = $user->taskCompletions()->pluck('task_id')->toArray();

            // Enrich tasks with completion status
            $enrichedTasks = $tasks->map(function ($task) use ($completedIds) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'category' => $task->category,
                    'weight_w' => (float) $task->weight_w,
                    'rarity_factor' => (float) $task->rarity_factor,
                    'points' => (float) $task->weight_w * (float) $task->rarity_factor,
                    'is_completed' => in_array($task->id, $completedIds),
                    'icon' => $task->icon ?? 'task',
                    'action_url' => $task->action_url,
                    'verification_type' => $task->verification_type ?? 'auto',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'tasks' => $enrichedTasks,
                    'total_tasks' => $enrichedTasks->count(),
                    'completed_count' => $enrichedTasks->where('is_completed', true)->count(),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching tasks: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tasks',
            ], 500);
        }
    }

    public function complete(Request $request, int $id, MomentumService $momentum, StreakService $streaks)
    {
        try {
            $user = $request->user();
            $task = Task::query()->findOrFail($id);

            if ($user->taskCompletions()->where('task_id', $task->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task already completed',
                ], 409);
            }

            // Validate task completion if needed (for manual verification tasks)
            if ($task->verification_type === 'manual') {
                $data = $request->validate([
                    'proof_data' => ['nullable', 'string'],
                    'screenshot' => ['nullable', 'string'],
                ]);
            }

            DB::transaction(function () use ($user, $task, $momentum, $streaks) {
                $user->taskCompletions()->attach($task->id, [
                    'completed_at' => now(),
                    'status' => 'verified',
                ]);

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

            $freshScore = $user->fresh()->score;

            return response()->json([
                'success' => true,
                'message' => "Task completed successfully! Earned {$task->weight_w * $task->rarity_factor} points",
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'points_earned' => (float) $task->weight_w * (float) $task->rarity_factor,
                    'new_score' => (float) ($freshScore?->total_pts ?? 0),
                ],
            ], 200);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error completing task: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete task. Please try again.',
            ], 500);
        }
    }
}
