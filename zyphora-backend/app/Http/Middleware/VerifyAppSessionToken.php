<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyAppSessionToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $token = (string) $request->header('X-App-Token', '');
        $hash = $user->app_token_hash;

        if ($token === '' || ! $hash || ! hash_equals($hash, hash('sha256', $token))) {
            abort(419, 'App session expired.');
        }

        if ($user->app_token_expires_at && now()->greaterThan($user->app_token_expires_at)) {
            $user->forceFill([
                'app_token_hash' => null,
                'app_token_last_used_at' => null,
                'app_token_expires_at' => null,
            ])->save();

            abort(419, 'App session expired.');
        }

        $ttlDays = max(1, (int) config('zyphora.app_token_ttl_days', 30));
        $user->forceFill([
            'app_token_last_used_at' => now(),
            'app_token_expires_at' => now()->addDays($ttlDays),
        ])->save();

        return $next($request);
    }
}
