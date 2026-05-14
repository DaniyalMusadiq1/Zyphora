<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('phone_hash')->nullable()->unique();
            $table->string('device_id')->nullable()->index();
            $table->string('name')->nullable();
            $table->string('email')->nullable()->unique();
            $table->unsignedTinyInteger('kyc_tier')->default(0);
            $table->decimal('fraud_score', 12, 6)->default(0);
            $table->decimal('depth_score_d', 12, 6)->default(0);
            $table->timestamp('joined_at')->nullable();
            $table->decimal('early_weight_w', 12, 6)->default(1);
            $table->boolean('is_banned')->default(false);
            $table->foreignId('referrer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
