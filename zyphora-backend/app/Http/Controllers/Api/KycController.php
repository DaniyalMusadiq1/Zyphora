<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KycVerification;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class KycController extends Controller
{
    public function initiate(Request $request)
    {
        try {
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
                'success' => true,
                'data' => [
                    'verification_id' => $verification->id,
                    'redirect_url' => url('/kyc/stub/'.$verification->id),
                    'tier_cap' => $cap,
                    'status' => $verification->status,
                    'tier' => $verification->tier,
                ],
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error initiating KYC: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate KYC verification',
            ], 500);
        }
    }

    public function status(Request $request)
    {
        try {
            $user = $request->user();
            
            $latestKyc = KycVerification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestKyc) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'status' => 'not_started',
                        'tier' => 0,
                        'kyc_tier' => (int) $user->kyc_tier,
                        'steps' => [
                            ['label' => 'Mobile', 'done' => (bool) $user->phone_verified_at],
                            ['label' => 'Identity', 'done' => false],
                            ['label' => 'Liveness', 'done' => false],
                        ],
                    ],
                ], 200);
            }

            $steps = [
                ['label' => 'Mobile', 'done' => (bool) $user->phone_verified_at],
                ['label' => 'Identity', 'done' => in_array($latestKyc->status, ['verified', 'approved'])],
                ['label' => 'Liveness', 'done' => $latestKyc->status === 'verified' && (bool) $latestKyc->liveness_check],
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'verification_id' => $latestKyc->id,
                    'status' => $latestKyc->status,
                    'tier' => $latestKyc->tier,
                    'kyc_tier' => (int) $user->kyc_tier,
                    'provider_reference' => $latestKyc->provider_reference,
                    'created_at' => $latestKyc->created_at->toISOString(),
                    'updated_at' => $latestKyc->updated_at->toISOString(),
                    'steps' => $steps,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching KYC status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch KYC status',
            ], 500);
        }
    }

    public function submit(Request $request)
    {
        try {
            $user = $request->user();
            
            $data = $request->validate([
                'verification_id' => ['required', 'exists:kyc_verifications,id'],
                'document_type' => ['nullable', 'string', 'in:passport,national_id,drivers_license'],
                'document_front' => ['nullable', 'string', 'max:5000000'],
                'document_back' => ['nullable', 'string', 'max:5000000'],
                'selfie' => ['nullable', 'string', 'max:5000000'],
                'liveness_check' => ['nullable', 'boolean'],
            ]);

            // Validate document data format (base64 or URL)
            foreach (['document_front', 'document_back', 'selfie'] as $field) {
                if (!empty($data[$field])) {
                    // Check if it's a valid base64 string or URL
                    if (!filter_var($data[$field], FILTER_VALIDATE_URL)) {
                        // If not a URL, validate base64 format
                        if (!preg_match('/^[a-zA-Z0-9\/\+\=]+$/', $data[$field])) {
                            throw ValidationException::withMessages([
                                $field => ['Invalid format. Must be a valid URL or base64 encoded string.']
                            ]);
                        }
                    }
                }
            }

            $verification = KycVerification::where('id', $data['verification_id'])
                ->where('user_id', $user->id)
                ->firstOrFail();

            if ($verification->status !== 'pending') {
                throw ValidationException::withMessages([
                    'verification_id' => ['This verification is already processed.'],
                ]);
            }

            $verification->update([
                'document_type' => $data['document_type'] ?? null,
                'document_front' => $data['document_front'] ?? null,
                'document_back' => $data['document_back'] ?? null,
                'selfie' => $data['selfie'] ?? null,
                'liveness_check' => $data['liveness_check'] ?? false,
                'status' => 'reviewing',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'KYC documents submitted successfully. Awaiting review.',
                'data' => [
                    'verification_id' => $verification->id,
                    'status' => $verification->status,
                ],
            ], 200);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error submitting KYC: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit KYC documents',
            ], 500);
        }
    }
}
