<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tamu_undangan', function (Blueprint $table) {
            if (Schema::hasColumn('tamu_undangan', 'number_of_guest')) {
                $table->dropColumn('number_of_guest');
            }
            if (Schema::hasColumn('tamu_undangan', 'attended_count')) {
                $table->dropColumn('attended_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tamu_undangan', function (Blueprint $table) {
            $table->unsignedInteger('number_of_guest')->default(1);
            $table->unsignedInteger('attended_count')->default(0);
        });
    }
};
