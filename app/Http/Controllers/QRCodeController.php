<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QRCodeController extends Controller
{
    public function index()
    {
        return view('qrscanner');
    }

    public function scan(Request $request)
{
    $qrData = $request->input('qr_code_data'); // isi QR = nama tamu

    $guest = \App\Models\TamuUndangan::where('nama', $qrData)->first();

    if ($guest) {
        $guest->status = 'Attended'; // update status jadi hadir
        $guest->save();

        return response()->json([
            'success' => true,
            'message' => $guest->nama . ' berhasil absen',
            'guest'   => $guest
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Tamu dengan nama ' . $qrData . ' tidak ditemukan'
    ]);
}
}
