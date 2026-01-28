<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->comment('Type d absence (conges_payes, maladie, rtt, etc.)');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->decimal('duree_journaliere', 3, 2)->default(1.00)->comment('ETP par jour (0.5 pour demi-journee)');
            $table->string('statut')->default('valide')->comment('valide, annule');
            $table->string('reference_externe')->nullable()->comment('ID dans le systeme RH');
            $table->timestamp('importe_le')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'date_debut', 'date_fin']);
            $table->index('reference_externe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
