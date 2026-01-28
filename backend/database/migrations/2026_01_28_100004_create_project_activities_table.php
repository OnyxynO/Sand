<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table pivot pour l'activation tri-state des activites par projet
        // Logique : si le projet n'a aucune entree => toutes les activites actives
        //           si le projet a des entrees => seules celles listees sont actives
        Schema::create('project_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['project_id', 'activity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_activities');
    }
};
