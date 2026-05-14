<?php

namespace App\Services;

use App\Models\Referral;
use App\Models\User;

class ReferralGraphService
{
    /**
     * @return array{nodes: list<array{id:int,label:string,gamma:float}>, links: list<array{source:int,target:int}>}
     */
    public function graphDataset(): array
    {
        $referrals = Referral::query()->with(['referrer:id,name', 'referee:id,name'])->get();

        $nodesById = [];

        foreach ($referrals as $ref) {
            foreach ([$ref->referrer, $ref->referee] as $u) {
                if (! $u) {
                    continue;
                }
                $id = (int) $u->id;
                if (! isset($nodesById[$id])) {
                    $nodesById[$id] = [
                        'id' => $id,
                        'label' => $u->name ?? ('#'.$id),
                        'gamma' => (float) $ref->gamma_penalty,
                    ];
                }
            }
        }

        $nodes = array_values($nodesById);

        $links = [];
        foreach ($referrals as $ref) {
            $links[] = [
                'source' => (int) $ref->referrer_id,
                'target' => (int) $ref->referee_id,
                'gamma' => (float) $ref->gamma_penalty,
            ];
        }

        return ['nodes' => $nodes, 'links' => $links];
    }

    public function refreshQuality(User $referrer): void
    {
        Referral::query()->where('referrer_id', $referrer->id)->with('referee')->each(function (Referral $r) {
            $depth = min(1.0, (float) ($r->referee?->depth_score_d ?? 0));
            $r->quality_score = round($depth * (2.0 - (float) $r->gamma_penalty), 6);
            $r->save();
        });
    }
}
