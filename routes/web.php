<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\QrExportController;
use Illuminate\Support\Facades\Route;

Route::view('/login', 'app')->middleware('guest')->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('guest');

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/api/user', [AuthController::class, 'user']);
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/', fn () => view('app'));
    Route::view('/guests', 'app');

    Route::prefix('api')->group(function () {
        Route::apiResource('guests', GuestController::class);
        Route::get('/guests/{guest}/qr', [QrExportController::class, 'png']);
        Route::get('/qr-sheet.pdf', [QrExportController::class, 'invitationSheet']);
        Route::get('/reports.csv', [QrExportController::class, 'csv']);
        Route::get('/reports.pdf', [QrExportController::class, 'attendanceReport']);
    });
});

Route::middleware(['auth', 'role:admin,receptionist'])->group(function () {
    Route::get('/api/dashboard', DashboardController::class);
    Route::view('/scanner', 'app');
    Route::get('/api/check-in/search', [CheckInController::class, 'search']);
    Route::post('/api/check-in/lookup', [CheckInController::class, 'lookup']);
    Route::post('/api/check-in', [CheckInController::class, 'confirm']);
});

Route::middleware(['auth', 'role:receptionist'])->group(function () {
    Route::view('/reception', 'app');
    Route::get('/api/reception/guests', [GuestController::class, 'index']);
});
