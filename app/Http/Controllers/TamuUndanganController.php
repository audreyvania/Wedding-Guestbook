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
}

