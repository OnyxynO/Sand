<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        // Activite systeme "Absence" (toujours presente, ne peut etre supprimee)
        $absence = Activity::create([
            'nom' => 'Absence',
            'code' => 'ABS',
            'description' => 'Activite systeme pour les absences',
            'parent_id' => null,
            'chemin' => '1', // Sera recalcule
            'niveau' => 0,
            'ordre' => 0,
            'est_feuille' => true,
            'est_systeme' => true,
            'est_actif' => true,
        ]);
        $absence->chemin = (string) $absence->id;
        $absence->save();

        // Arborescence de demonstration
        $dev = Activity::create([
            'nom' => 'Developpement',
            'code' => 'DEV',
            'parent_id' => null,
            'chemin' => '',
            'niveau' => 0,
            'ordre' => 1,
            'est_feuille' => false,
            'est_systeme' => false,
        ]);
        $dev->chemin = (string) $dev->id;
        $dev->save();

        $backend = Activity::create([
            'nom' => 'Backend',
            'code' => 'DEV-BACK',
            'parent_id' => $dev->id,
            'chemin' => '',
            'niveau' => 1,
            'ordre' => 0,
            'est_feuille' => true,
        ]);
        $backend->chemin = $dev->chemin . '.' . $backend->id;
        $backend->save();

        $frontend = Activity::create([
            'nom' => 'Frontend',
            'code' => 'DEV-FRONT',
            'parent_id' => $dev->id,
            'chemin' => '',
            'niveau' => 1,
            'ordre' => 1,
            'est_feuille' => true,
        ]);
        $frontend->chemin = $dev->chemin . '.' . $frontend->id;
        $frontend->save();

        $gestion = Activity::create([
            'nom' => 'Gestion de projet',
            'code' => 'GEST',
            'parent_id' => null,
            'chemin' => '',
            'niveau' => 0,
            'ordre' => 2,
            'est_feuille' => false,
        ]);
        $gestion->chemin = (string) $gestion->id;
        $gestion->save();

        $reunion = Activity::create([
            'nom' => 'Reunions',
            'code' => 'GEST-REU',
            'parent_id' => $gestion->id,
            'chemin' => '',
            'niveau' => 1,
            'ordre' => 0,
            'est_feuille' => true,
        ]);
        $reunion->chemin = $gestion->chemin . '.' . $reunion->id;
        $reunion->save();

        $planif = Activity::create([
            'nom' => 'Planification',
            'code' => 'GEST-PLAN',
            'parent_id' => $gestion->id,
            'chemin' => '',
            'niveau' => 1,
            'ordre' => 1,
            'est_feuille' => true,
        ]);
        $planif->chemin = $gestion->chemin . '.' . $planif->id;
        $planif->save();

        $support = Activity::create([
            'nom' => 'Support',
            'code' => 'SUP',
            'parent_id' => null,
            'chemin' => '',
            'niveau' => 0,
            'ordre' => 3,
            'est_feuille' => true,
        ]);
        $support->chemin = (string) $support->id;
        $support->save();
    }
}
