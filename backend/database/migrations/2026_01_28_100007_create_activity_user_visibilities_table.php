<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Masquage des activites par utilisateur (optionnellement par projet)
        // Permet a un moderateur de masquer certaines activites pour un user
        Schema::create('activity_user_visibilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->boolean('est_visible')->default(false)->comment('false = masque');
            $table->timestamps();

            // Unique par combinaison user/activity/project
            $table->unique(['activity_id', 'user_id', 'project_id'], 'activity_user_project_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_user_visibilities');
    }
};
