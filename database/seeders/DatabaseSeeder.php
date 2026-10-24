<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@wedding.test')],
            [
                'name' => env('ADMIN_NAME', 'Wedding Admin'),
                'role' => 'admin',
                'password' => bcrypt(env('ADMIN_PASSWORD', 'change-me-now')),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => env('RECEPTIONIST_EMAIL', 'penerima@wedding.test')],
            [
                'name' => env('RECEPTIONIST_NAME', 'Penerima Tamu'),
                'role' => 'receptionist',
                'password' => bcrypt(env('RECEPTIONIST_PASSWORD', 'change-me-now')),
            ],
        );
    }
}
