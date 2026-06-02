<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'icon' => $this->icon,
            'action_url' => $this->action_url,
            'verification_type' => $this->verification_type,
            'points' => round($this->weight_w * $this->rarity_factor * 100),
            'weight_w' => $this->weight_w,
            'rarity_factor' => $this->rarity_factor,
            'is_premium' => $this->is_premium,
            'is_active' => $this->is_active,
            'is_completed' => $this->whenPivotLoaded('task_completions', fn () => true),
            'status' => $this->whenPivotLoaded('task_completions', fn () => 
                $this->pivot->status ?? 'pending'
            ),
            'completed_at' => $this->whenPivotLoaded('task_completions', fn () => 
                $this->pivot->completed_at?->toIso8601String()
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
