<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('statut')->default('en_attente');
            $table->string('format')->default('csv');
            $table->jsonb('filtres')->nullable();
            $table->string('chemin_fichier')->nullable();
            $table->string('nom_fichier')->nullable();
            $table->timestamp('expire_le')->nullable();
            $table->text('erreur')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exports');
    }
};
