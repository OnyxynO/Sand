<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        // Activite systeme "Absence" (toujours presente, ne peut etre supprimee)
        $absence = $this->creerActivite([
            'nom' => 'Absence',
            'code' => 'ABS',
            'description' => 'Activite systeme pour les absences',
            'parent_id' => null,
            'ordre' => 0,
            'est_feuille' => true,
            'est_systeme' => true,
            'est_actif' => true,
        ]);

        // Arborescence de demonstration
        $dev = $this->creerActivite([
            'nom' => 'Developpement',
            'code' => 'DEV',
            'parent_id' => null,
            'ordre' => 1,
            'est_feuille' => false,
            'est_systeme' => false,
        ]);

        $this->creerActivite([
            'nom' => 'Backend',
            'code' => 'DEV-BACK',
            'parent_id' => $dev->id,
            'parent_chemin' => $dev->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Frontend',
            'code' => 'DEV-FRONT',
            'parent_id' => $dev->id,
            'parent_chemin' => $dev->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $gestion = $this->creerActivite([
            'nom' => 'Gestion de projet',
            'code' => 'GEST',
            'parent_id' => null,
            'ordre' => 2,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'Reunions',
            'code' => 'GEST-REU',
            'parent_id' => $gestion->id,
            'parent_chemin' => $gestion->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Planification',
            'code' => 'GEST-PLAN',
            'parent_id' => $gestion->id,
            'parent_chemin' => $gestion->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Support',
            'code' => 'SUP',
            'parent_id' => null,
            'ordre' => 3,
            'est_feuille' => true,
        ]);
    }

    /**
     * Creer une activite en une seule requete (optimise pour ltree).
     */
    private function creerActivite(array $data): Activity
    {
        // Obtenir le prochain ID avant l'insertion
        $nextId = DB::selectOne("SELECT nextval('activities_id_seq') AS id")->id;

        // Calculer le chemin
        $parentChemin = $data['parent_chemin'] ?? null;
        unset($data['parent_chemin']);

        $chemin = $data['parent_id']
            ? "{$parentChemin}.{$nextId}"
            : (string) $nextId;

        return Activity::create([
            'id' => $nextId,
            'nom' => $data['nom'],
            'code' => $data['code'] ?? null,
            'description' => $data['description'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
            'chemin' => $chemin,
            'ordre' => $data['ordre'] ?? 0,
            'est_feuille' => $data['est_feuille'] ?? true,
            'est_systeme' => $data['est_systeme'] ?? false,
            'est_actif' => $data['est_actif'] ?? true,
        ]);
    }
}
