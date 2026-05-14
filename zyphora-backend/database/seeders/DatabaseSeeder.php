<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\FraudScore;
use App\Models\GovernanceProposal;
use App\Models\Streak;
use App\Models\Task;
use App\Models\User;
use App\Models\UserScore;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Admin::query()->firstOrCreate(
            ['email' => 'admin@zyphora.local'],
            [
                'name' => 'Zyphora Superadmin',
                'password' => Hash::make('password'),
                'is_superadmin' => true,
            ]
        );

        Task::query()->firstOrCreate(
            ['title' => 'Daily check-in'],
            [
                'description' => 'Open the app and complete your daily check-in.',
                'weight_w' => 1,
                'rarity_factor' => 1,
                'is_premium' => false,
            ]
        );

        Task::query()->firstOrCreate(
            ['title' => 'Verify momentum'],
            [
                'description' => 'Review your momentum meter on the Mine tab.',
                'weight_w' => 1.5,
                'rarity_factor' => 1.2,
                'is_premium' => false,
            ]
        );

        GovernanceProposal::query()->firstOrCreate(
            ['title' => 'Genesis parameter vote'],
            [
                'description' => 'Approve baseline scoring weights for season 1.',
                'weight' => 1,
                'start_date' => now()->subDays(7)->toDateString(),
                'end_date' => now()->addDays(30)->toDateString(),
            ]
        );

        $this->call(DemoUserSeeder::class);

        User::factory()->count(5)->create()->each(function (User $user): void {
            UserScore::query()->firstOrCreate(['user_id' => $user->id]);
            Streak::query()->firstOrCreate(['user_id' => $user->id]);
            FraudScore::query()->firstOrCreate(['user_id' => $user->id]);
        });
    }
}
