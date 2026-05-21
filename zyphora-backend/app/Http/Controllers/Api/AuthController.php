<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceRegistry;
use App\Models\FraudScore;
use App\Models\Referral;
use App\Models\Streak;
use App\Models\User;
use App\Models\UserScore;
use App\Services\DeviceRegistryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────────
    // REQUEST OTP
    // ─────────────────────────────────────────────────────────────────────────────

    public function requestOtp(Request $request)
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'min:8', 'max:32'],
        ]);

        $normalized = preg_replace('/\D+/', '', $data['phone']);
        $phoneHash  = hash('sha256', $normalized);

        // Check if user already exists for this phone (optional: prevent spamming)
        // But typically we allow OTP request even if exists for Login flow

        $otp = (string) random_int(100000, 999999);
        Cache::put('otp:' . $phoneHash, $otp, now()->addMinutes(10));

        $payload = ['status' => 'sent', 'message' => 'OTP sent successfully'];
        if (config('app.debug')) {
            $payload['otp'] = $otp;
        }

        return response()->json($payload);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // REGISTER (Phone + Email + Username + Password)
    // ─────────────────────────────────────────────────────────────────────────────


    public function register(Request $request, DeviceRegistryService $devices)
    {
        $data = $request->validate([
            'email'         => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'      => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'],
            'username'      => ['required', 'string', 'min:3', 'max:24', 'unique:users,name', 'alpha_dash'],
            'device_id'     => ['required', 'string', 'max:128'],
            'referral_code' => ['nullable', 'string', 'max:64'], // optional invite code
        ]);

        // 1. Device limit check (max 2 accounts)
        $devices->assertCanRegister($data['device_id']);

        // 2. Create user
        $user = User::create([
            'name'       => $data['username'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'device_id'  => $data['device_id'],
            'joined_at'  => now(),
        ]);

        // 3. Generate human-readable referral code: APP_NAME_username
        $appName = strtoupper(config('app.name', 'ZYPHORA'));
        $baseCode = $appName . '_' . $data['username'];
        $uniqueCode = $baseCode;
        $counter = 1;
        while (User::where('referral_code', $uniqueCode)->exists()) {
            $uniqueCode = $baseCode . ($counter++);
        }
        $user->referral_code = $uniqueCode;
        $user->save();

        // 4. Bootstrap relations
        UserScore::firstOrCreate(['user_id' => $user->id]);
        Streak::firstOrCreate(['user_id' => $user->id]);
        FraudScore::firstOrCreate(['user_id' => $user->id]);

        // 5. Handle referral (if someone invited this user)
        if (!empty($data['referral_code'])) {
            $referrer = User::where('referral_code', $data['referral_code'])->first();
            if ($referrer && $referrer->id !== $user->id) {
                Referral::firstOrCreate(
                    ['referrer_id' => $referrer->id, 'referee_id' => $user->id],
                    ['quality_score' => 0, 'gamma_penalty' => 1]
                );
                $user->referrer_id = $referrer->id;
                $user->save();
            }
        }

        // 6. Attach device (store IP, user agent, location)
        $devices->attachUserDevice($user, $data['device_id'], $request);

        // 7. Issue token
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token'         => $token,
            'user_id'       => $user->id,
            'username'      => $user->name,
            'email'         => $user->email,
            'referral_code' => $user->referral_code,
            'message'       => 'Registration successful.',
        ]);
    }

    public function loginEmail(Request $request)
    {
        $data = $request->validate([
            'email'     => ['required', 'string', 'email'],
            'password'  => ['required', 'string'],
            'device_id' => ['required', 'string', 'max:128'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        if ($user->is_banned) {
            abort(403, 'Account suspended.');
        }

        // Device limit check is not applied for login (only registration)
        app(DeviceRegistryService::class)->attachUserDevice($user, $data['device_id'], $request);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token'         => $token,
            'user_id'       => $user->id,
            'username'      => $user->name,
            'referral_code' => $user->referral_code,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────────

    private function assertOtpValid(string $phoneHash, string $otp): void
    {
        $cacheKey = 'otp:' . $phoneHash;
        $expected = Cache::get($cacheKey);

        if (! $expected || ! hash_equals((string) $expected, (string) $otp)) {
            throw ValidationException::withMessages(['otp' => ['Invalid or expired code.']]);
        }

        Cache::forget($cacheKey);
    }

    private function encodeReferrer(int $userId): string
    {
        return rtrim(strtr(base64_encode((string) $userId), '+/', '-_'), '=');
    }

    private function decodeReferrer(string $code): ?int
    {
        $b64 = strtr($code, '-_', '+/');
        $pad = strlen($b64) % 4;
        if ($pad) {
            $b64 .= str_repeat('=', 4 - $pad);
        }
        $raw = base64_decode($b64, true);
        return ($raw !== false && ctype_digit($raw)) ? (int) $raw : null;
    }
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'phone'          => $user->phone_hash ? 'registered' : null,
            'referral_code'  => $this->encodeReferrer($user->id),
            'joined_at'      => $user->joined_at,
            'is_banned'      => $user->is_banned,
            'fraud_score'    => $user->fraud_score,
        ]);
    }
}
