<?php

namespace App\Http\Controllers;

use App\Models\TamuUndangan;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $guests = TamuUndangan::query();
        return response()->json([
            'stats' => [
                'invitations' => $guests->count(),
                'attended_invitations' => (clone $guests)->where('status', 'Attended')->count(),
                'absent_invitations' => (clone $guests)->where('status', 'Absent')->count(),
            ],
            'recent_checkins' => TamuUndangan::query()->where('status', 'Attended')->latest('check_in_time')->limit(8)->get(),
        ]);
    }
}
