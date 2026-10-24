<?php

namespace Database\Factories;

use App\Models\TamuUndangan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TamuUndanganFactory extends Factory
{
    protected $model = TamuUndangan::class;

    public function definition(): array
    {
        return [
            'guest_name' => fake()->name(),
            'category' => 'Friend',
            'qr_token' => (string) Str::uuid(),
            'status' => 'Absent',
        ];
    }
}
