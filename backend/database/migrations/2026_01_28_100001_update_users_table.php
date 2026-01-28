<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('matricule')->unique()->nullable()->after('id');
            $table->string('prenom')->after('name');
            $table->renameColumn('name', 'nom');
            $table->enum('role', ['utilisateur', 'moderateur', 'admin'])->default('utilisateur')->after('email');
            $table->foreignId('equipe_id')->nullable()->after('role')->constrained('teams')->nullOnDelete();
            $table->boolean('est_actif')->default(true)->after('equipe_id');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['matricule', 'prenom', 'role', 'est_actif']);
            $table->dropForeign(['equipe_id']);
            $table->dropColumn('equipe_id');
            $table->renameColumn('nom', 'name');
        });
    }
};
