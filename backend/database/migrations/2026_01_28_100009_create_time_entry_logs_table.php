<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Historique des modifications de saisies
        Schema::create('time_entry_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('time_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->comment('Utilisateur ayant fait la modification')->constrained();
            $table->enum('action', ['creation', 'modification', 'suppression']);
            $table->decimal('ancienne_duree', 3, 2)->nullable();
            $table->decimal('nouvelle_duree', 3, 2)->nullable();
            $table->text('ancien_commentaire')->nullable();
            $table->text('nouveau_commentaire')->nullable();
            $table->timestamps();

            $table->index(['time_entry_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_entry_logs');
    }
};
