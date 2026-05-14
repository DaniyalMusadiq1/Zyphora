<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ReferralGraphService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateReferralQuality implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $referrerId) {}

    public function handle(ReferralGraphService $graph): void
    {
        $referrer = User::query()->find($this->referrerId);
        if (! $referrer) {
            return;
        }

        $graph->refreshQuality($referrer);
    }
}
