<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration adds missing indexes for better query performance
     * and scalability as identified in the project analysis.
     */
    public function up(): void
    {
        // Add indexes to users table for common queries
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasIndex('users', 'users_referral_code_index')) {
                $table->index('referral_code', 'users_referral_code_index');
            }
            if (!Schema::hasIndex('users', 'users_fraud_score_index')) {
                $table->index('fraud_score', 'users_fraud_score_index');
            }
            if (!Schema::hasIndex('users', 'users_kyc_tier_index')) {
                $table->index('kyc_tier', 'users_kyc_tier_index');
            }
            if (!Schema::hasIndex('users', 'users_joined_at_index')) {
                $table->index('joined_at', 'users_joined_at_index');
            }
        });

        // Add indexes to kyc_verifications for status lookups
        Schema::table('kyc_verifications', function (Blueprint $table) {
            if (!Schema::hasIndex('kyc_verifications', 'kyc_verifications_status_index')) {
                $table->index('status', 'kyc_verifications_status_index');
            }
            if (!Schema::hasIndex('kyc_verifications', 'kyc_verifications_user_status_index')) {
                $table->index(['user_id', 'status'], 'kyc_verifications_user_status_index');
            }
            if (!Schema::hasIndex('kyc_verifications', 'kyc_verifications_created_at_index')) {
                $table->index('created_at', 'kyc_verifications_created_at_index');
            }
        });

        // Add indexes to fraud_scores for filtering
        Schema::table('fraud_scores', function (Blueprint $table) {
            if (!Schema::hasIndex('fraud_scores', 'fraud_scores_sigma_total_index')) {
                $table->index('sigma_total', 'fraud_scores_sigma_total_index');
            }
            if (!Schema::hasIndex('fraud_scores', 'fraud_scores_status_index')) {
                $table->index('status', 'fraud_scores_status_index');
            }
        });

        // Add indexes to referrals for common queries
        Schema::table('referrals', function (Blueprint $table) {
            if (!Schema::hasIndex('referrals', 'referrals_quality_score_index')) {
                $table->index('quality_score', 'referrals_quality_score_index');
            }
            if (!Schema::hasIndex('referrals', 'referrals_matured_at_index')) {
                $table->index('matured_at', 'referrals_matured_at_index');
            }
        });

        // Add indexes to user_scores for leaderboard queries
        Schema::table('user_scores', function (Blueprint $table) {
            if (!Schema::hasIndex('user_scores', 'user_scores_ps_total_index')) {
                $table->index('ps_total', 'user_scores_ps_total_index');
            }
            if (!Schema::hasIndex('user_scores', 'user_scores_updated_at_index')) {
                $table->index('updated_at', 'user_scores_updated_at_index');
            }
        });

        // Add indexes to streaks for active user queries
        Schema::table('streaks', function (Blueprint $table) {
            if (!Schema::hasIndex('streaks', 'streaks_current_streak_index')) {
                $table->index('current_streak', 'streaks_current_streak_index');
            }
            if (!Schema::hasIndex('streaks', 'streaks_last_active_date_index')) {
                $table->index('last_active_date', 'streaks_last_active_date_index');
            }
        });

        // Add indexes to task_completions for verification queries
        Schema::table('task_completions', function (Blueprint $table) {
            if (!Schema::hasIndex('task_completions', 'task_completions_completed_at_index')) {
                $table->index('completed_at', 'task_completions_completed_at_index');
            }
            if (!Schema::hasIndex('task_completions', 'task_completions_status_index')) {
                $table->index('status', 'task_completions_status_index');
            }
        });

        // Add indexes to daily_earnings for aggregation queries
        Schema::table('daily_earnings', function (Blueprint $table) {
            if (!Schema::hasIndex('daily_earnings', 'daily_earnings_date_index')) {
                $table->index('date', 'daily_earnings_date_index');
            }
        });

        // Add indexes to governance tables
        Schema::table('governance_proposals', function (Blueprint $table) {
            if (!Schema::hasIndex('governance_proposals', 'governance_proposals_status_index')) {
                $table->index('status', 'governance_proposals_status_index');
            }
            if (!Schema::hasIndex('governance_proposals', 'governance_proposals_ends_at_index')) {
                $table->index('ends_at', 'governance_proposals_ends_at_index');
            }
        });

        Schema::table('governance_votes', function (Blueprint $table) {
            if (!Schema::hasIndex('governance_votes', 'governance_votes_proposal_id_index')) {
                $table->index('proposal_id', 'governance_votes_proposal_id_index');
            }
            if (!Schema::hasIndex('governance_votes', 'governance_votes_created_at_index')) {
                $table->index('created_at', 'governance_votes_created_at_index');
            }
        });

        // Add index to score_audits for audit trail queries
        Schema::table('score_audits', function (Blueprint $table) {
            if (!Schema::hasIndex('score_audits', 'score_audits_user_created_index')) {
                $table->index(['user_id', 'created_at'], 'score_audits_user_created_index');
            }
        });

        // Add index to admin_action_logs for audit queries
        Schema::table('admin_action_logs', function (Blueprint $table) {
            if (!Schema::hasIndex('admin_action_logs', 'admin_action_logs_target_user_index')) {
                $table->index('target_user_id', 'admin_action_logs_target_user_index');
            }
            if (!Schema::hasIndex('admin_action_logs', 'admin_action_logs_created_at_index')) {
                $table->index('created_at', 'admin_action_logs_created_at_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop all added indexes
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_referral_code_index');
            $table->dropIndex('users_fraud_score_index');
            $table->dropIndex('users_kyc_tier_index');
            $table->dropIndex('users_joined_at_index');
        });

        Schema::table('kyc_verifications', function (Blueprint $table) {
            $table->dropIndex('kyc_verifications_status_index');
            $table->dropIndex('kyc_verifications_user_status_index');
            $table->dropIndex('kyc_verifications_created_at_index');
        });

        Schema::table('fraud_scores', function (Blueprint $table) {
            $table->dropIndex('fraud_scores_sigma_total_index');
            $table->dropIndex('fraud_scores_status_index');
        });

        Schema::table('referrals', function (Blueprint $table) {
            $table->dropIndex('referrals_quality_score_index');
            $table->dropIndex('referrals_matured_at_index');
        });

        Schema::table('user_scores', function (Blueprint $table) {
            $table->dropIndex('user_scores_ps_total_index');
            $table->dropIndex('user_scores_updated_at_index');
        });

        Schema::table('streaks', function (Blueprint $table) {
            $table->dropIndex('streaks_current_streak_index');
            $table->dropIndex('streaks_last_active_date_index');
        });

        Schema::table('task_completions', function (Blueprint $table) {
            $table->dropIndex('task_completions_completed_at_index');
            $table->dropIndex('task_completions_status_index');
        });

        Schema::table('daily_earnings', function (Blueprint $table) {
            $table->dropIndex('daily_earnings_date_index');
        });

        Schema::table('governance_proposals', function (Blueprint $table) {
            $table->dropIndex('governance_proposals_status_index');
            $table->dropIndex('governance_proposals_ends_at_index');
        });

        Schema::table('governance_votes', function (Blueprint $table) {
            $table->dropIndex('governance_votes_proposal_id_index');
            $table->dropIndex('governance_votes_created_at_index');
        });

        Schema::table('score_audits', function (Blueprint $table) {
            $table->dropIndex('score_audits_user_created_index');
        });

        Schema::table('admin_action_logs', function (Blueprint $table) {
            $table->dropIndex('admin_action_logs_target_user_index');
            $table->dropIndex('admin_action_logs_created_at_index');
        });
    }
};
