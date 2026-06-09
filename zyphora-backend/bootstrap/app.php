<?php

use App\Http\Middleware\DeviceRestriction;
use App\Http\Middleware\FraudCheck;
use App\Http\Middleware\VerifyAppSessionToken;
use App\Http\Middleware\VerifyApiSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withProviders([
        \App\Providers\Filament\AdminPanelProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'api.signature'   => VerifyApiSignature::class,
            'app.session'     => VerifyAppSessionToken::class,
            'device.restrict' => DeviceRestriction::class,
            'fraud.check'     => FraudCheck::class,
            'throttle:api'    => \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            'throttle:auth'   => \Illuminate\Routing\Middleware\ThrottleRequests::class.':auth',
            'throttle:kyc'    => \Illuminate\Routing\Middleware\ThrottleRequests::class.':kyc',
        ]);

        // Only runs on API routes, never touches /admin or web routes
        $middleware->prependToGroup('api', VerifyApiSignature::class);

        // Exclude admin panel from any global web middleware interference
        $middleware->validateCsrfTokens(except: [
            'admin/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();