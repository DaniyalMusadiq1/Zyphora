<?php

namespace App\Services;

use App\Models\UserScore;

class TokenAllocatorService
{
    public function buildMerkleTree(): array
    {
        $leaves = UserScore::query()
            ->orderBy('user_id')
            ->get(['user_id', 'ps_total'])
            ->map(fn ($s) => hash('sha256', $s->user_id.'|'.(string) $s->ps_total))
            ->values()
            ->all();

        $root = $this->reduceTree($leaves);

        UserScore::query()->update(['merkle_hash' => null]);
        UserScore::query()->chunk(100, function ($chunk) use ($root) {
            foreach ($chunk as $score) {
                $score->merkle_hash = $root;
                $score->save();
            }
        });

        return ['root' => $root, 'leaf_count' => count($leaves)];
    }

    /**
     * @param  list<string>  $hashes
     */
    private function reduceTree(array $hashes): string
    {
        if ($hashes === []) {
            return hash('sha256', 'empty');
        }

        while (count($hashes) > 1) {
            $next = [];
            $count = count($hashes);
            for ($i = 0; $i < $count; $i += 2) {
                $left = $hashes[$i];
                $right = $hashes[$i + 1] ?? $left;
                $next[] = hash('sha256', $left.$right);
            }
            $hashes = $next;
        }

        return $hashes[0];
    }

    public function exportAllocationsCsv(): string
    {
        $lines = ["user_id,ps_total,merkle_hash"];
        UserScore::query()->orderBy('user_id')->chunk(200, function ($chunk) use (&$lines) {
            foreach ($chunk as $row) {
                $lines[] = $row->user_id.','.(string) $row->ps_total.','.($row->merkle_hash ?? '');
            }
        });

        return implode("\n", $lines);
    }
}
