<?php

namespace App\Providers;

use App\Models\ScoreAudit;
use App\Models\Task;
use App\Models\User;
use App\Policies\ScoreAuditPolicy;
use App\Policies\TaskPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
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
    }
}
