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
    $request->validate([
        'guest_name' => 'required|string|max:255',
        'number_of_guest' => 'required|integer|min:1',
    ]);

    TamuUndangan::create([
        'guest_name' => $request->guest_name,
        'number_of_guest' => $request->number_of_guest,
        'status' => 'Absent', // default
    ]);

    return redirect('/')
        ->with('success', 'Guest berhasil ditambahkan');
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

    public function checkIn($id)
{
    $guest = TamuUndangan::findOrFail($id);

    $guest->status = 'Attended';
    $guest->check_in_time = now();
    $guest->save();

    return redirect()->back()->with('success', 'Guest checked in');
}






// ADD NEW GUEST
public function create()
{
    return view('guests.create');
}

// FORM EDIT
public function edit($id)
{
    $guest = TamuUndangan::findOrFail($id);
    return view('guests.edit', compact('guest'));
}

// UPDATE DATA
public function update(Request $request, $id)
{
    $request->validate([
        'guest_name' => 'required',
        'number_of_guest' => 'required|integer|min:1',
    ]);

    $guest = TamuUndangan::findOrFail($id);
    $guest->update([
        'guest_name' => $request->guest_name,
        'number_of_guest' => $request->number_of_guest,
    ]);

    return redirect('/')->with('success', 'Guest updated successfully');
}

// DELETE DATA
public function destroy($id)
{
    TamuUndangan::findOrFail($id)->delete();
    return redirect()->back()->with('success', 'Guest deleted');
}

}

