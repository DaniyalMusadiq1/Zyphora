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
            'phone'         => ['required_without:email', 'nullable', 'string', 'min:8', 'max:32'],
            'email'         => ['required_without:phone', 'nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'      => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'], // Strong password
            'username'      => ['required', 'string', 'min:3', 'max:24', 'unique:users,name', 'alpha_dash'], // Unique username
            'otp'           => ['required_with:phone', 'nullable', 'string', 'size:6'],
            'device_id'     => ['required', 'string', 'max:128'],
            'referrer_code' => ['nullable', 'string', 'max:64'],
        ]);

        // 1. Device Limit Check (Max 2 accounts per device)
        $devices->assertCanRegister($data['device_id']);

        // 2. Phone Verification (if provided)
        $phoneHash = null;
        if (!empty($data['phone'])) {
            $normalized = preg_replace('/\D+/', '', $data['phone']);
            $phoneHash  = hash('sha256', $normalized);
            
            // Check duplicate phone
            if (User::where('phone_hash', $phoneHash)->exists()) {
                throw ValidationException::withMessages(['phone' => ['Phone number already registered.']]);
            }

            // Verify OTP
            $this->assertOtpValid($phoneHash, $data['otp']);
        }

        // 3. Create User
        $user = User::create([
            'name'       => $data['username'], // Storing username in 'name' field as per model
            'email'      => $data['email'] ?? null,
            'phone_hash' => $phoneHash,
            'password'   => Hash::make($data['password']),
            'device_id'  => $data['device_id'],
            'joined_at'  => now(),
        ]);

        // 4. Send Email Verification (if email provided)
        if ($user->email) {
            $user->sendEmailVerificationNotification();
        }

        // 5. Bootstrap Relations
        UserScore::firstOrCreate(['user_id' => $user->id]);
        Streak::firstOrCreate(['user_id' => $user->id]);
        FraudScore::firstOrCreate(['user_id' => $user->id]);

        // 6. Handle Referral
        $referrerId = null;
        if (! empty($data['referrer_code'])) {
            $referrerId = $this->decodeReferrer((string) $data['referrer_code']);
            if ($referrerId) {
                Referral::firstOrCreate(
                    ['referrer_id' => $referrerId, 'referee_id' => $user->id],
                    ['quality_score' => 0, 'gamma_penalty' => 1]
                );
                User::where('id', $user->id)->update(['referrer_id' => $referrerId]);
            }
        }

        // 7. Attach Device
        $devices->attachUserDevice($user, $data['device_id']);

        // 8. Issue Token
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token'         => $token,
            'user_id'       => $user->id,
            'username'      => $user->name,
            'email'         => $user->email,
            'referral_code' => $this->encodeReferrer($user->id),
            'message'       => $user->email ? 'Registration successful. Please verify your email.' : 'Registration successful.',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // LOGIN (Phone + OTP)
    // ─────────────────────────────────────────────────────────────────────────────

    public function login(Request $request)
    {
        $data = $request->validate([
            'phone'     => ['required', 'string'],
            'otp'       => ['required', 'string', 'size:6'],
            'device_id' => ['required', 'string', 'max:128'],
        ]);

        $normalized = preg_replace('/\D+/', '', $data['phone']);
        $phoneHash  = hash('sha256', $normalized);

        $user = User::where('phone_hash', $phoneHash)->first();

        if (! $user) {
            throw ValidationException::withMessages(['phone' => ['Invalid credentials.']]);
        }

        if ($user->is_banned) {
            abort(403, 'Account suspended.');
        }

        $this->assertOtpValid($phoneHash, $data['otp']);

        // Attach device if not already attached (soft logic)
        // Service handles checks
        app(DeviceRegistryService::class)->attachUserDevice($user, $data['device_id']);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token'         => $token,
            'user_id'       => $user->id,
            'username'      => $user->name,
            'referral_code' => $this->encodeReferrer($user->id),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // LOGIN EMAIL
    // ─────────────────────────────────────────────────────────────────────────────

    public function loginEmail(Request $request)
    {
        $data = $request->validate([
            'email'     => ['required', 'string', 'email'],
            'password'  => ['required', 'string'],
            'device_id' => ['required', 'string', 'max:128'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        if ($user->is_banned) {
            abort(403, 'Account suspended.');
        }

        app(DeviceRegistryService::class)->attachUserDevice($user, $data['device_id']);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token'         => $token,
            'user_id'       => $user->id,
            'username'      => $user->name,
            'referral_code' => $this->encodeReferrer($user->id),
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
}