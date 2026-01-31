<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Activer l'extension ltree
        DB::statement('CREATE EXTENSION IF NOT EXISTS ltree');

        // 2. Supprimer l'ancien index sur chemin (B-tree)
        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex('activities_chemin_index');
        });

        // 3. Ajouter une colonne temporaire ltree
        DB::statement('ALTER TABLE activities ADD COLUMN chemin_ltree ltree');

        // 4. Convertir les chemins existants (VARCHAR -> ltree)
        DB::statement('UPDATE activities SET chemin_ltree = chemin::ltree');

        // 5. Supprimer l'ancienne colonne chemin
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn('chemin');
        });

        // 6. Renommer la nouvelle colonne
        DB::statement('ALTER TABLE activities RENAME COLUMN chemin_ltree TO chemin');

        // 7. Ajouter la contrainte NOT NULL
        DB::statement('ALTER TABLE activities ALTER COLUMN chemin SET NOT NULL');

        // 8. Supprimer la colonne niveau (redondante, calculable via nlevel())
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn('niveau');
        });

        // 9. Creer l'index GiST pour les requetes ltree (descendants, ancetres)
        DB::statement('CREATE INDEX idx_activities_chemin_gist ON activities USING GIST (chemin)');

        // 10. Creer l'index composite pour les requetes par parent + tri par ordre
        DB::statement('CREATE INDEX idx_activities_parent_ordre ON activities (parent_id, ordre)');
    }

    public function down(): void
    {
        // 1. Supprimer les nouveaux index
        DB::statement('DROP INDEX IF EXISTS idx_activities_chemin_gist');
        DB::statement('DROP INDEX IF EXISTS idx_activities_parent_ordre');

        // 2. Ajouter une colonne temporaire VARCHAR
        DB::statement('ALTER TABLE activities ADD COLUMN chemin_varchar VARCHAR(255)');

        // 3. Convertir les chemins (ltree -> VARCHAR)
        DB::statement('UPDATE activities SET chemin_varchar = chemin::text');

        // 4. Supprimer l'ancienne colonne ltree
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn('chemin');
        });

        // 5. Renommer la colonne
        DB::statement('ALTER TABLE activities RENAME COLUMN chemin_varchar TO chemin');

        // 6. Ajouter la contrainte NOT NULL
        DB::statement('ALTER TABLE activities ALTER COLUMN chemin SET NOT NULL');

        // 7. Recreer la colonne niveau
        Schema::table('activities', function (Blueprint $table) {
            $table->integer('niveau')->default(0)->after('chemin');
        });

        // 8. Recalculer les niveaux depuis le chemin
        DB::statement("UPDATE activities SET niveau = nlevel(chemin::ltree) - 1");

        // 9. Recreer l'index B-tree original
        Schema::table('activities', function (Blueprint $table) {
            $table->index('chemin');
        });
    }
};
