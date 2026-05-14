<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KycVerification;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class KycController extends Controller
{
    public function initiate(Request $request)
    {
        $cap = (int) config('zyphora.kyc_tier_cap_default', 3);
        $user = $request->user();

        $data = $request->validate([
            'tier_requested' => ['required', 'integer', 'min:1', 'max:'.$cap],
        ]);

        if ((int) $user->kyc_tier >= (int) $data['tier_requested']) {
            throw ValidationException::withMessages([
                'tier_requested' => ['Already verified at this tier or higher.'],
            ]);
        }

        $verification = KycVerification::query()->create([
            'user_id' => $user->id,
            'provider_reference' => 'stub-'.uniqid(),
            'tier' => (int) $data['tier_requested'],
            'status' => 'pending',
        ]);

        return response()->json([
            'verification_id' => $verification->id,
            'redirect_url' => url('/kyc/stub/'.$verification->id),
            'tier_cap' => $cap,
        ]);
    }
}
