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
        $table->string('nama');
        $table->string('status')->default('Pending');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('tamu_undangan');
}

};
