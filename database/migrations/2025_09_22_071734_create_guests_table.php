<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('tamu_undangan', function (Blueprint $table) {
        $table->id();
        $table->string('guest_name');
        $table->string('category')->default('Other');
        $table->uuid('qr_token')->unique();
        $table->dateTime('check_in_time')->nullable();
        $table->enum('status', ['Attended', 'Absent'])->default('Absent');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('tamu_undangan');
}


};
