<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class TamuUndangan extends Model
{
    protected $table = 'tamu_undangan';
    protected $fillable = [
        'qr_code',
        'guest_name',
        'number_of_guest',
        'check_in_time',
        'status'
    ];
    public $timestamps = false;

    protected $attributes = [
        'status' => 'Absent',
    ];
}

