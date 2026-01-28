<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $equipeDev = Team::where('code', 'DEV')->first();
        $equipeRh = Team::where('code', 'RH')->first();
        $equipeDir = Team::where('code', 'DIR')->first();

        // Admin
        User::create([
            'matricule' => 'ADMIN001',
            'nom' => 'Admin',
            'prenom' => 'Super',
            'email' => 'admin@sand.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'equipe_id' => $equipeDir?->id,
            'est_actif' => true,
        ]);

        // Moderateur
        User::create([
            'matricule' => 'MOD001',
            'nom' => 'Dupont',
            'prenom' => 'Marie',
            'email' => 'marie.dupont@sand.local',
            'password' => Hash::make('password'),
            'role' => 'moderateur',
            'equipe_id' => $equipeDev?->id,
            'est_actif' => true,
        ]);

        // Utilisateurs
        User::create([
            'matricule' => 'DEV001',
            'nom' => 'Martin',
            'prenom' => 'Jean',
            'email' => 'jean.martin@sand.local',
            'password' => Hash::make('password'),
            'role' => 'utilisateur',
            'equipe_id' => $equipeDev?->id,
            'est_actif' => true,
        ]);

        User::create([
            'matricule' => 'DEV002',
            'nom' => 'Bernard',
            'prenom' => 'Pierre',
            'email' => 'pierre.bernard@sand.local',
            'password' => Hash::make('password'),
            'role' => 'utilisateur',
            'equipe_id' => $equipeDev?->id,
            'est_actif' => true,
        ]);

        User::create([
            'matricule' => 'RH001',
            'nom' => 'Petit',
            'prenom' => 'Sophie',
            'email' => 'sophie.petit@sand.local',
            'password' => Hash::make('password'),
            'role' => 'utilisateur',
            'equipe_id' => $equipeRh?->id,
            'est_actif' => true,
        ]);
    }
}
