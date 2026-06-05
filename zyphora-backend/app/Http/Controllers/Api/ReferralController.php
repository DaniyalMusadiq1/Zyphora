<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function generate(Request $request)
    {
        $code = $this->encode($request->user()->id);

        return response()->json([
            'referral_code' => $code,
            'share_url' => url('/r/'.$code),
        ]);
    }

    public function list(Request $request)
    {
        $refs = Referral::query()
            ->where('referrer_id', $request->user()->id)
            ->with(['referee' => function ($query) {
                $query->select('id', 'name', 'depth_score_d', 'fraud_score', 'kyc_tier');
            }])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['referrals' => $refs]);
    }

    private function encode(int $userId): string
    {
        return rtrim(strtr(base64_encode((string) $userId), '+/', '-_'), '=');
    }
}
