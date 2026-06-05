<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'app_token_hash')) {
                $table->string('app_token_hash', 128)->nullable()->after('remember_token');
            }
            if (! Schema::hasColumn('users', 'app_token_last_used_at')) {
                $table->timestamp('app_token_last_used_at')->nullable()->after('app_token_hash');
            }
            if (! Schema::hasColumn('users', 'app_token_expires_at')) {
                $table->timestamp('app_token_expires_at')->nullable()->after('app_token_last_used_at');
            }
            if (! Schema::hasColumn('users', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('is_banned');
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            if (! Schema::hasColumn('tasks', 'task_type')) {
                $table->string('task_type')->default('general')->after('category');
            }
            if (! Schema::hasColumn('tasks', 'verification_criteria')) {
                $table->text('verification_criteria')->nullable()->after('verification_type');
            }
            if (! Schema::hasColumn('tasks', 'proof_required')) {
                $table->boolean('proof_required')->default(false)->after('verification_criteria');
            }
            if (! Schema::hasColumn('tasks', 'proof_fields')) {
                $table->json('proof_fields')->nullable()->after('proof_required');
            }
            if (! Schema::hasColumn('tasks', 'video_url')) {
                $table->string('video_url')->nullable()->after('action_url');
            }
            if (! Schema::hasColumn('tasks', 'app_package')) {
                $table->string('app_package')->nullable()->after('video_url');
            }
            if (! Schema::hasColumn('tasks', 'social_url')) {
                $table->string('social_url')->nullable()->after('app_package');
            }
            if (! Schema::hasColumn('tasks', 'game_url')) {
                $table->string('game_url')->nullable()->after('social_url');
            }
        });

        Schema::table('task_completions', function (Blueprint $table) {
            if (! Schema::hasColumn('task_completions', 'proof_payload')) {
                $table->json('proof_payload')->nullable()->after('proof_data');
            }
            if (! Schema::hasColumn('task_completions', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('status');
            }
            if (! Schema::hasColumn('task_completions', 'review_notes')) {
                $table->text('review_notes')->nullable()->after('screenshot');
            }
        });
    }

    public function down(): void
    {
        Schema::table('task_completions', function (Blueprint $table) {
            foreach (['proof_payload', 'verified_at', 'review_notes'] as $column) {
                if (Schema::hasColumn('task_completions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            foreach ([
                'task_type',
                'verification_criteria',
                'proof_required',
                'proof_fields',
                'video_url',
                'app_package',
                'social_url',
                'game_url',
            ] as $column) {
                if (Schema::hasColumn('tasks', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            foreach (['app_token_hash', 'app_token_last_used_at', 'app_token_expires_at', 'admin_notes'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
