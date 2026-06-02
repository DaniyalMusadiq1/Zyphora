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

            // Get active tasks with proper filtering
            $tasks = Cache::remember('tasks:list:'.$user->id, $ttl, function () use ($user) {
                return Task::query()
                    ->active()
                    ->orderBy('category')
                    ->orderBy('weight_w', 'desc')
                    ->get();
            });

            // Get user's completed task IDs with status
            $completedTasks = $user->taskCompletions()
                ->select('task_id', 'status', 'completed_at')
                ->get()
                ->keyBy('task_id');

            // Enrich tasks with completion status
            $enrichedTasks = $tasks->map(function ($task) use ($completedTasks) {
                $completion = $completedTasks->get($task->id);
                
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'category' => $task->category ?? 'general',
                    'type' => $task->category ?? 'general',
                    'weight_w' => (float) $task->weight_w,
                    'rarity_factor' => (float) $task->rarity_factor,
                    'points' => round((float) $task->weight_w * (float) $task->rarity_factor, 2),
                    'is_completed' => $completion !== null,
                    'status' => $completion?->status ?? 'pending',
                    'completed_at' => $completion?->completed_at?->toIso8601String(),
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
                    'pending_count' => $enrichedTasks->where('is_completed', false)->count(),
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

            if (!$task->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'This task is no longer available',
                ], 400);
            }

            if ($user->taskCompletions()->where('task_id', $task->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task already completed',
                ], 409);
            }

            // Validate task completion if needed (for manual verification tasks)
            $proofData = null;
            $screenshot = null;
            
            if ($task->verification_type === 'manual') {
                $data = $request->validate([
                    'proof_data' => ['nullable', 'string'],
                    'screenshot' => ['nullable', 'string'],
                ]);
                $proofData = $data['proof_data'] ?? null;
                $screenshot = $data['screenshot'] ?? null;
            }

            DB::transaction(function () use ($user, $task, $momentum, $streaks, $proofData, $screenshot) {
                $status = $task->verification_type === 'auto' ? 'verified' : 'pending_verification';
                
                $user->taskCompletions()->attach($task->id, [
                    'completed_at' => now(),
                    'status' => $status,
                    'proof_data' => $proofData,
                    'screenshot' => $screenshot,
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
                'message' => "Task completed successfully! Earned ".round($task->weight_w * $task->rarity_factor, 2)." points",
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'points_earned' => round((float) $task->weight_w * (float) $task->rarity_factor, 2),
                    'new_score' => (float) ($freshScore?->total_pts ?? 0),
                    'status' => $task->verification_type === 'auto' ? 'verified' : 'pending_verification',
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
