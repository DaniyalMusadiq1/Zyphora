<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('ps_total', 18, 8)->default(0);
            $table->decimal('momentum_m', 18, 8)->default(0);
            $table->decimal('catch_up_omega', 18, 8)->default(0);
            $table->decimal('loyalty_l', 18, 8)->default(0);
            $table->decimal('referral_r', 18, 8)->default(0);
            $table->decimal('social_t', 18, 8)->default(0);
            $table->decimal('governance_g', 18, 8)->default(0);
            $table->decimal('zk_phi', 18, 8)->default(0);
            $table->timestamp('frozen_at')->nullable();
            $table->string('merkle_hash')->nullable();
            $table->timestamps();
            $table->unique('user_id');
        });

        Schema::create('streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('current_streak')->default(0);
            $table->integer('best_streak')->default(0);
            $table->unsignedTinyInteger('shields_banked')->default(0);
            $table->date('last_active_date')->nullable();
            $table->timestamp('streak_broken_at')->nullable();
            $table->timestamps();
            $table->unique('user_id');
        });

        Schema::create('daily_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('earned_pts', 18, 8)->default(0);
            $table->decimal('multiplier_applied', 12, 6)->default(1);
            $table->date('date');
            $table->timestamps();
            $table->unique(['user_id', 'date']);
            $table->index(['user_id', 'date']);
        });

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referee_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('quality_score', 12, 6)->default(0);
            $table->timestamp('matured_at')->nullable();
            $table->decimal('gamma_penalty', 12, 6)->default(1);
            $table->timestamps();
            $table->unique(['referrer_id', 'referee_id']);
        });

        Schema::create('device_registry', function (Blueprint $table) {
            $table->string('device_id')->primary();
            $table->unsignedTinyInteger('account_count')->default(0);
            $table->boolean('flagged')->default(false);
            $table->timestamps();
        });

        Schema::create('fraud_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('f1_device', 12, 6)->default(0);
            $table->decimal('f2_velocity', 12, 6)->default(0);
            $table->decimal('f3_geo', 12, 6)->default(0);
            $table->decimal('f4_pattern', 12, 6)->default(0);
            $table->decimal('f5_network', 12, 6)->default(0);
            $table->decimal('f6_identity', 12, 6)->default(0);
            $table->decimal('f7_timing', 12, 6)->default(0);
            $table->decimal('sigma_total', 12, 6)->default(0);
            $table->string('status')->default('clean');
            $table->timestamps();
            $table->unique('user_id');
        });

        Schema::create('kyc_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider_reference')->nullable();
            $table->unsignedTinyInteger('tier')->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('governance_proposals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('weight', 18, 8)->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('governance_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('proposal_id')->constrained('governance_proposals')->cascadeOnDelete();
            $table->boolean('vote');
            $table->decimal('alignment_score', 12, 6)->default(0);
            $table->timestamps();
            $table->unique(['user_id', 'proposal_id']);
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('weight_w', 12, 6)->default(1);
            $table->decimal('rarity_factor', 12, 6)->default(1);
            $table->boolean('is_premium')->default(false);
            $table->timestamps();
        });

        Schema::create('task_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->timestamp('completed_at')->useCurrent();
            $table->timestamps();
            $table->unique(['user_id', 'task_id']);
        });

        Schema::create('score_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('old_score', 18, 8)->nullable();
            $table->decimal('new_score', 18, 8)->nullable();
            $table->string('trigger_event')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_action_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('admins')->cascadeOnDelete();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_action_logs');
        Schema::dropIfExists('score_audits');
        Schema::dropIfExists('task_completions');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('governance_votes');
        Schema::dropIfExists('governance_proposals');
        Schema::dropIfExists('kyc_verifications');
        Schema::dropIfExists('fraud_scores');
        Schema::dropIfExists('device_registry');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('daily_earnings');
        Schema::dropIfExists('streaks');
        Schema::dropIfExists('user_scores');
    }
};
