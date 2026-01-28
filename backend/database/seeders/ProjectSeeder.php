<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        // Projet SAND (ce projet!)
        $sand = Project::create([
            'nom' => 'SAND',
            'code' => 'SAND',
            'description' => 'Application de saisie d\'activites numerique declarative',
            'date_debut' => now(),
            'est_actif' => true,
        ]);

        // Projet de maintenance
        $maintenance = Project::create([
            'nom' => 'Maintenance applicative',
            'code' => 'MAINT',
            'description' => 'Maintenance des applications existantes',
            'date_debut' => now()->subMonths(6),
            'est_actif' => true,
        ]);

        // Projet interne RH
        $rh = Project::create([
            'nom' => 'Gestion RH',
            'code' => 'RH-GEST',
            'description' => 'Activites de gestion des ressources humaines',
            'date_debut' => now()->subYear(),
            'est_actif' => true,
        ]);

        // Affecter des utilisateurs aux projets
        $moderateur = User::where('email', 'marie.dupont@sand.local')->first();
        $dev1 = User::where('email', 'jean.martin@sand.local')->first();
        $dev2 = User::where('email', 'pierre.bernard@sand.local')->first();

        if ($moderateur) {
            // Marie est moderatrice de SAND
            $sand->moderateurs()->attach($moderateur);
            $sand->utilisateurs()->attach($moderateur);
        }

        if ($dev1) {
            $sand->utilisateurs()->attach($dev1);
            $maintenance->utilisateurs()->attach($dev1);
        }

        if ($dev2) {
            $sand->utilisateurs()->attach($dev2);
        }
    }
}
