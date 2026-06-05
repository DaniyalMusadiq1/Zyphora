<?php

use App\Http\Middleware\DeviceRestriction;
use App\Http\Middleware\FraudCheck;
use App\Http\Middleware\VerifyAppSessionToken;
use App\Http\Middleware\VerifyApiSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

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
        ]);

        $middleware->prependToGroup('api', VerifyApiSignature::class);
        
        // Configure rate limiters
        RateLimiter::for('auth', function ($request) {
            return Limit::perMinute(5)->by($request->ip());
        });
        
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
        
        RateLimiter::for('kyc', function ($request) {
            return Limit::perHour(10)->by($request->user()?->id ?: $request->ip());
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
