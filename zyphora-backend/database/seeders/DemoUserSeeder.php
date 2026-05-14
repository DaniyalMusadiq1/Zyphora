<?php

namespace Database\Seeders;

use App\Models\FraudScore;
use App\Models\Streak;
use App\Models\User;
use App\Models\UserScore;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'daniyal@gmail.com'],
            [
                'name' => null,
                'password' => Hash::make('Alpha@1234'),
                'phone_hash' => null,
                'device_id' => null,
                'joined_at' => now(),
            ]
        );

        UserScore::query()->firstOrCreate(['user_id' => $user->id]);
        Streak::query()->firstOrCreate(['user_id' => $user->id]);
        FraudScore::query()->firstOrCreate(['user_id' => $user->id]);
    }
}
