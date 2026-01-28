<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::set(
            Setting::CLE_JOURS_RETRO,
            7,
            'Nombre de jours dans le passe ou la saisie est autorisee'
        );

        Setting::set(
            Setting::CLE_PERIODE_SAISIE,
            'semaine',
            'Periode d\'affichage par defaut (jour, semaine, mois)'
        );

        Setting::set(
            Setting::CLE_RAPPEL_SAISIE,
            true,
            'Activer les rappels de saisie incomplete'
        );
    }
}
