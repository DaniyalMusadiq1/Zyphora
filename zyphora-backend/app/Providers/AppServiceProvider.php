<?php

namespace App\Providers;

use App\Models\ScoreAudit;
use App\Models\Task;
use App\Models\User;
use App\Policies\ScoreAuditPolicy;
use App\Policies\TaskPolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(ScoreAudit::class, ScoreAuditPolicy::class);
        
        // Configure rate limiters
        $this->configureRateLimiters();
    }
    
    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiters(): void
    {
        RateLimiter::for('auth', function (object $request) {
            return [
                // Limit auth requests to 5 per minute per IP
                Limit::perMinute(5)->by($request->ip()),
                // Also limit by email if present
                Limit::perMinute(3)->by($request->email ?? $request->ip()),
            ];
        });

        RateLimiter::for('api', function (object $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('kyc', function (object $request) {
            return Limit::perHour(10)->by($request->user()?->id ?: $request->ip());
        });
    }
}
