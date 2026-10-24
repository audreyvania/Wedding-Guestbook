<?php

namespace App\Http\Controllers;

use App\Models\TamuUndangan;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(TamuUndangan::query()
            ->when($request->string('search')->toString(), fn ($query, $search) => $query->where('guest_name', 'like', "%{$search}%"))
            ->when($request->string('category')->toString(), fn ($query, $category) => $query->where('category', $category))
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
            ->latest()->paginate(12));
    }

    public function store(Request $request)
    {
        return response()->json(TamuUndangan::create($this->validated($request)), 201);
    }

    public function show(TamuUndangan $guest) { return response()->json($guest); }

    public function update(Request $request, TamuUndangan $guest)
    {
        $guest->update($this->validated($request));
        return response()->json($guest->fresh());
    }

    public function destroy(TamuUndangan $guest) { $guest->delete(); return response()->noContent(); }

    private function validated(Request $request): array
    {
        return $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:80'],
        ]);
    }
}
