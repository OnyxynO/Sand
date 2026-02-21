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

        Setting::set(
            Setting::CLE_DELAI_ANNULATION,
            5,
            'Delai d\'annulation en secondes (toast undo)'
        );

        Setting::set(
            Setting::CLE_AFFICHER_WEEKENDS,
            false,
            'Afficher les weekends dans la grille de saisie'
        );

        Setting::set(
            Setting::CLE_PREMIER_JOUR_SEMAINE,
            1,
            'Premier jour de la semaine (1=lundi, 0=dimanche)'
        );

        Setting::set(
            Setting::CLE_ABSENCE_MODE,
            'manuel',
            'Mode de gestion des absences (manuel ou api)'
        );

        Setting::set(
            Setting::CLE_ABSENCE_API_URL,
            '',
            "URL de l'API RH externe"
        );

        Setting::set(
            Setting::CLE_ABSENCE_API_TOKEN,
            '',
            "Token d'authentification API RH"
        );
    }
}
