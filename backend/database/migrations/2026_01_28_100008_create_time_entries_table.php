<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('duree', 3, 2)->comment('ETP: 0.01 a 1.00');
            $table->text('commentaire')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Unicite: un user ne peut saisir qu une fois par jour/activite/projet
            $table->unique(['user_id', 'date', 'activity_id', 'project_id', 'deleted_at'], 'time_entries_unique');

            // Index pour les recherches frequentes
            $table->index('date');
            $table->index(['user_id', 'date']);
            $table->index(['project_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_entries');
    }
};
