<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GovernanceController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\MineController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\ScoreController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Route::prefix('auth')->middleware(['throttle:5,1'])->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('/otp', [AuthController::class, 'requestOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login-email', [AuthController::class, 'loginEmail']);
// });

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/me', [AuthController::class, 'updateMe']);
});

Route::middleware([
    'auth:sanctum',
    'throttle:60,1',
    'device.restrict',
    'fraud.check',
])->group(function () {
    Route::get('/score', [ScoreController::class, 'show']);
    Route::get('/streak', [StreakController::class, 'show']);
    Route::post('/streak/checkin', [StreakController::class, 'checkin']);

    Route::post('/mine/checkin', [MineController::class, 'checkin']);
    Route::get('/mine/tasks', [TaskController::class, 'index']);
    Route::post('/mine/tasks/{id}/complete', [TaskController::class, 'complete']);

    Route::get('/referral/generate', [ReferralController::class, 'generate']);
    Route::get('/referral/list', [ReferralController::class, 'list']);

    Route::get('/leaderboard', [LeaderboardController::class, 'index']);

    Route::post('/kyc/initiate', [KycController::class, 'initiate']);
    Route::get('/kyc/status', [KycController::class, 'status']);
    Route::post('/kyc/submit', [KycController::class, 'submit']);

    Route::get('/governance/proposals', [GovernanceController::class, 'proposals']);
    Route::post('/governance/vote', [GovernanceController::class, 'vote']);
});
