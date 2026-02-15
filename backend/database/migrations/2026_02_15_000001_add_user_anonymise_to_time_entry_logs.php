<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('time_entry_logs', function (Blueprint $table) {
            $table->boolean('user_anonymise')->default(false)->after('nouveau_commentaire');
        });
    }

    public function down(): void
    {
        Schema::table('time_entry_logs', function (Blueprint $table) {
            $table->dropColumn('user_anonymise');
        });
    }
};
