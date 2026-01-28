<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $equipes = [
            [
                'nom' => 'Developpement',
                'code' => 'DEV',
                'description' => 'Equipe de developpement logiciel',
            ],
            [
                'nom' => 'Ressources Humaines',
                'code' => 'RH',
                'description' => 'Gestion des ressources humaines',
            ],
            [
                'nom' => 'Commercial',
                'code' => 'COM',
                'description' => 'Equipe commerciale',
            ],
            [
                'nom' => 'Direction',
                'code' => 'DIR',
                'description' => 'Direction generale',
            ],
        ];

        foreach ($equipes as $equipe) {
            Team::create($equipe);
        }
    }
}
