<?php

namespace App\Http\Controllers;

use App\Models\TamuUndangan;
use Illuminate\Http\Request;

class TamuUndanganController extends Controller
{
    public function index()
    {
        $guests = TamuUndangan::all();
        return view('tamu.index', compact('guests'));
    }

    public function store(Request $request)
    {
        TamuUndangan::create([
            'guest_name' => $request->guest_name,
            'number_of_guest' => $request->number_of_guest,
        ]);

        return redirect()->back()->with('success', 'Tamu berhasil ditambahkan');
    }

    // AJAX search
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $guests = TamuUndangan::where('guest_name', 'like', "%$query%")->get();

        return response()->json($guests);
    }

    // Update status jadi Attended
    public function attend(Request $request)
    {
        $guest = TamuUndangan::find($request->guest_id);
        $guest->number_of_guest = $request->number_of_guest;
        $guest->status = 'Attended';
        $guest->save();

        return response()->json(['success' => true]);
    }
}

