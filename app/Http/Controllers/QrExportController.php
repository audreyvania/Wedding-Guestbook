<?php

namespace App\Http\Controllers;

use App\Models\TamuUndangan;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Mpdf\Mpdf;
use Mpdf\Output\Destination;

class QrExportController extends Controller
{
    public function png(TamuUndangan $guest)
    {
        return response($this->pngFor($guest->qr_token), 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'attachment; filename="qr-'.str($guest->guest_name)->slug().'.png"',
        ]);
    }

    public function invitationSheet()
    {
        $guests = TamuUndangan::query()->orderBy('guest_name')->get();
        $cards = $guests->map(fn (TamuUndangan $guest) => '<div class="card"><img src="data:image/png;base64,'.base64_encode($this->pngFor($guest->qr_token)).'"><h3>'.e($guest->guest_name).'</h3><p>'.e($guest->category).'</p></div>')->implode('');
        return $this->pdf('<h1>Wedding Guestbook — Kartu QR Undangan</h1><div class="grid">'.$cards.'</div>', 'qr-undangan.pdf');
    }

    public function csv()
    {
        $guests = TamuUndangan::query()->orderBy('guest_name')->get();
        return response()->streamDownload(function () use ($guests) {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, ['Nama', 'Kategori', 'Status', 'Waktu Check-in']);
            foreach ($guests as $guest) fputcsv($stream, [$guest->guest_name, $guest->category, $guest->status, $guest->check_in_time]);
            fclose($stream);
        }, 'rekap-kehadiran.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function attendanceReport()
    {
        $rows = TamuUndangan::query()->orderByDesc('check_in_time')->get()->map(fn (TamuUndangan $guest) => '<tr><td>'.e($guest->guest_name).'</td><td>'.e($guest->category).'</td><td>'.e($guest->status).'</td><td>'.e($guest->check_in_time?->format('d M Y H:i') ?? '-').'</td></tr>')->implode('');
        return $this->pdf('<h1>Rekap Kehadiran</h1><table><thead><tr><th>Nama</th><th>Kategori</th><th>Status</th><th>Check-in</th></tr></thead><tbody>'.$rows.'</tbody></table>', 'rekap-kehadiran.pdf');
    }

    private function pngFor(string $token): string
    {
        return (new Builder(
            writer: new PngWriter(),
            data: $token,
            size: 340,
            margin: 12,
        ))->build()->getString();
    }

    private function pdf(string $content, string $filename)
    {
        $temp = storage_path('app/mpdf');
        File::ensureDirectoryExists($temp);
        File::ensureDirectoryExists($temp.'/mpdf');
        $mpdf = new Mpdf(['tempDir' => $temp, 'format' => 'A4']);
        $mpdf->WriteHTML('<style>body{font-family:sans-serif;color:#30242d}h1{color:#8c3d61}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}.card{border:1px solid #dbc3cf;padding:14px;text-align:center}.card img{width:150px;height:150px}.card h3{margin:4px 0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:7px;text-align:left}th{background:#f4dce6}</style>'.$content);
        return response($mpdf->Output('', Destination::STRING_RETURN), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => "attachment; filename=\"{$filename}\""]);
    }
}
