<?php

use Illuminate\Support\Facades\Route;
use App\Models\TamuUndangan;
use App\Http\Controllers\QRCodeController;


Route::get('/', function () {
    $guests = TamuUndangan::paginate(10); // pagination
    $total = TamuUndangan::count();
    $attended = TamuUndangan::where('status', 'Attended')->count();
    $absent = TamuUndangan::where('status', 'Absent')->count();

    
    return view('home', compact('guests', 'total', 'attended', 'absent'));
});

Route::get('/qr-scanner', [QRCodeController::class, 'index']);
Route::post('/scan', [QRCodeController::class, 'scan']);


