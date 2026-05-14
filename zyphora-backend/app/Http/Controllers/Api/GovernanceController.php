<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GovernanceProposal;
use App\Models\GovernanceVote;
use Illuminate\Http\Request;

class GovernanceController extends Controller
{
    public function proposals(Request $request)
    {
        $items = GovernanceProposal::query()
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhereDate('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhereDate('end_date', '>=', now());
            })
            ->orderByDesc('weight')
            ->get();

        return response()->json(['proposals' => $items]);
    }

    public function vote(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'proposal_id' => ['required', 'integer', 'exists:governance_proposals,id'],
            'agree' => ['required', 'boolean'],
        ]);

        GovernanceVote::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'proposal_id' => $data['proposal_id'],
            ],
            [
                'vote' => $data['agree'],
                'alignment_score' => $data['agree'] ? 1 : 0,
            ]
        );

        return response()->json(['status' => 'ok']);
    }
}
