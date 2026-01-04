<?php

use Illuminate\Support\Facades\Route;
use App\Models\TamuUndangan;
use App\Http\Controllers\QRCodeController;
use App\Http\Controllers\TamuUndanganController;



Route::get('/', function () {
    $guests = TamuUndangan::paginate(10); // pagination
    $total = TamuUndangan::count();
    $attended = TamuUndangan::where('status', 'Attended')->count();
    $absent = TamuUndangan::where('status', 'Absent')->count();

    
    return view('home', compact('guests', 'total', 'attended', 'absent'));
});

Route::get('/qr-scanner', [QRCodeController::class, 'index']);
Route::post('/scan', [QRCodeController::class, 'scan']);


// Route resource untuk tamu undangan
Route::resource('guests', TamuUndanganController::class);
Route::get('/guests/search', [TamuUndanganController::class, 'search'])->name('guests.search');
Route::post('/guests/attend', [TamuUndanganController::class, 'attend'])->name('guests.attend');
