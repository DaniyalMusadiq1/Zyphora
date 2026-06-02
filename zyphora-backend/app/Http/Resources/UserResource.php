<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'referral_code' => $this->referral_code,
            'kyc_tier' => $this->kyc_tier,
            'fraud_score' => $this->fraud_score,
            'is_banned' => $this->is_banned,
            'joined_at' => $this->joined_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            
            // Relationships
            'score' => $this->whenLoaded('score', fn () => $this->score?->toArray()),
            'streak' => $this->whenLoaded('streak', fn () => $this->streak?->toArray()),
            'referrer' => $this->whenLoaded('referrer', fn () => [
                'id' => $this->referrer->id,
                'name' => $this->referrer->name,
            ]),
        ];
    }
}
