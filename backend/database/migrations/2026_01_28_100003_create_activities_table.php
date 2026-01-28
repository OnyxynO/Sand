<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('code')->unique()->nullable()->comment('Code court optionnel');
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('activities')->nullOnDelete();
            $table->string('chemin')->comment('Path materialise (ex: 1.2.3)');
            $table->integer('niveau')->default(0)->comment('Profondeur dans l arbre');
            $table->integer('ordre')->default(0)->comment('Ordre d affichage parmi les freres');
            $table->boolean('est_feuille')->default(true)->comment('Seules les feuilles sont saisissables');
            $table->boolean('est_systeme')->default(false)->comment('Activite protegee (ex: Absence)');
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('chemin');
            $table->index('parent_id');
            $table->index('est_actif');
            $table->index('est_feuille');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
