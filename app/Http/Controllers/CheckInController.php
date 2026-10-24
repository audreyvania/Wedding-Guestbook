<?php

namespace App\Http\Controllers;

use App\Models\TamuUndangan;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->validate(['q' => ['required', 'string', 'min:2', 'max:255']])['q'];

        return response()->json(
            TamuUndangan::query()
                ->where('guest_name', 'like', "%{$query}%")
                ->orderBy('guest_name')
                ->limit(8)
                ->get()
        );
    }

    public function lookup(Request $request)
    {
        $token = $request->validate(['qr_token' => ['required', 'uuid']])['qr_token'];
        $guest = TamuUndangan::query()->where('qr_token', $token)->first();
        return $guest ? response()->json($guest) : response()->json(['message' => 'QR undangan tidak ditemukan.'], 404);
    }

    public function confirm(Request $request)
    {
        $data = $request->validate(['qr_token' => ['required', 'uuid']]);
        $guest = TamuUndangan::query()->where('qr_token', $data['qr_token'])->first();
        if (! $guest) return response()->json(['message' => 'QR undangan tidak ditemukan.'], 404);
        $guest->update(['status' => 'Attended', 'check_in_time' => now()]);
        return response()->json(['message' => "Kehadiran {$guest->guest_name} berhasil dicatat.", 'guest' => $guest->fresh()]);
    }
}
