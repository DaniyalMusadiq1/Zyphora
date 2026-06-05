<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GovernanceController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\MineController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\ScoreController;
use App\Http\Controllers\Api\StreakController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Auth endpoints with rate limiting
Route::middleware(['throttle:auth'])->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('/otp', [AuthController::class, 'requestOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login-email', [AuthController::class, 'loginEmail']);
});

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/me', [AuthController::class, 'updateMe']);

    // Score & Streak endpoints (lightweight, no fraud check needed)
    Route::get('/score', [ScoreController::class, 'show']);
    Route::get('/streak', [StreakController::class, 'show']);
    Route::post('/streak/checkin', [StreakController::class, 'checkin']);
});

Route::middleware([
    'auth:sanctum',
    'throttle:api',
    'device.restrict',
    'fraud.check',
])->group(function () {
    // Mining & Tasks
    Route::post('/mine/checkin', [MineController::class, 'checkin']);
    Route::get('/mine/tasks', [TaskController::class, 'index']);
    Route::post('/mine/tasks/{id}/complete', [TaskController::class, 'complete']);

    // Referrals
    Route::get('/referral/generate', [ReferralController::class, 'generate']);
    Route::get('/referral/list', [ReferralController::class, 'list']);

    // Leaderboard
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);

    // KYC with rate limiting
    Route::post('/kyc/initiate', [KycController::class, 'initiate'])->middleware('throttle:kyc');
    Route::get('/kyc/status', [KycController::class, 'status']);
    Route::post('/kyc/submit', [KycController::class, 'submit'])->middleware('throttle:kyc');

    // Governance
    Route::get('/governance/proposals', [GovernanceController::class, 'proposals']);
    Route::post('/governance/vote', [GovernanceController::class, 'vote']);
});
