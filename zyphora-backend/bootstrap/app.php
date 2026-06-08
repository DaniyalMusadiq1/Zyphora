<?php

use App\Http\Middleware\DeviceRestriction;
use App\Http\Middleware\FraudCheck;
use App\Http\Middleware\VerifyAppSessionToken;
use App\Http\Middleware\VerifyApiSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\RateLimiter; // Ensure this import is present

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'api.signature' => VerifyApiSignature::class,
            'app.session' => VerifyAppSessionToken::class,
            'device.restrict' => DeviceRestriction::class,
            'fraud.check' => FraudCheck::class,
            'throttle:api' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            'throttle:auth' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':auth',
            'throttle:kyc' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':kyc',
        ]);

        $middleware->prependToGroup('api', VerifyApiSignature::class);
    })
    ->withRateLimiting(function () { // Add this block back
        RateLimiter::for('auth', function (object $request) {
            return [
                // Limit auth requests to 5 per minute per IP
                \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->ip()),
                // Also limit by email if present
                \Illuminate\Cache\RateLimiting\Limit::perMinute(3)->by($request->email ?? $request->ip()),
            ];
        });

        RateLimiter::for('api', function (object $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('kyc', function (object $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perHour(10)->by($request->user()?->id ?: $request->ip());
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();