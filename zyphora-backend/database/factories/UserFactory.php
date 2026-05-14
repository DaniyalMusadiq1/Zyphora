<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'phone_hash' => hash('sha256', fake()->unique()->numerify('##########')),
            'device_id' => Str::uuid()->toString(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'kyc_tier' => fake()->numberBetween(0, 3),
            'fraud_score' => 0,
            'joined_at' => now(),
            'early_weight_w' => 1,
            'is_banned' => false,
            'password' => null,
            'remember_token' => Str::random(10),
        ];
    }
}
