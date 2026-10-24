<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class TamuUndangan extends Model
{
    use HasFactory;
    protected $table = 'tamu_undangan';

    protected $fillable = [
        'qr_code',
        'guest_name',
        'category',
        'qr_token',
        'check_in_time',
        'status'
    ];

    protected function casts(): array
    {
        return ['check_in_time' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (self $guest): void {
            $guest->qr_token ??= (string) Str::uuid();
        });
    }
}
