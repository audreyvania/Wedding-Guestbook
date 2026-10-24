<?php

namespace Tests\Feature;

use App\Models\TamuUndangan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckInTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_routes_require_login(): void
    {
        $this->get('/api/dashboard')->assertRedirect('/login');
    }

    public function test_receptionist_can_check_in_but_cannot_manage_guests(): void
    {
        $receptionist = User::factory()->create(['role' => 'receptionist']);
        $guest = TamuUndangan::factory()->create();

        $this->actingAs($receptionist)->postJson('/api/check-in', [
            'qr_token' => $guest->qr_token,
        ])->assertOk();

        $this->actingAs($receptionist)->getJson('/api/guests')->assertForbidden();
        $this->actingAs($receptionist)->get('/')->assertForbidden();
    }

    public function test_check_in_records_attendance(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $guest = TamuUndangan::factory()->create();

        $this->actingAs($admin)->postJson('/api/check-in', [
            'qr_token' => $guest->qr_token,
        ])->assertOk()->assertJsonPath('guest.status', 'Attended');

        $this->assertDatabaseHas('tamu_undangan', ['id' => $guest->id, 'status' => 'Attended']);
    }

    public function test_check_in_requires_a_valid_qr_token(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))->postJson('/api/check-in', [
            'qr_token' => 'not-a-uuid',
        ])->assertUnprocessable();
    }
}
