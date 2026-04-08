<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Utilise DB::table() et non Setting::set() pour éviter l'appel à Cache::tags()
// qui requiert Redis — non disponible au moment des migrations en CI.
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('settings')->upsert(
            [
                [
                    'cle'         => 'connexion_rapide_activee',
                    'valeur'      => json_encode(0),
                    'description' => 'Activer la connexion rapide par role (mode demo)',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ],
                [
                    'cle'         => 'connexion_rapide_roles',
                    'valeur'      => json_encode([]),
                    'description' => 'Correspondance role => user_id pour la connexion rapide',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ],
            ],
            ['cle'],
            ['valeur', 'description', 'updated_at'],
        );
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('cle', [
            'connexion_rapide_activee',
            'connexion_rapide_roles',
        ])->delete();
    }
};
