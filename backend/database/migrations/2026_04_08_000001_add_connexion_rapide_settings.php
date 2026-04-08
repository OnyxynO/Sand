<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Setting::set(
            Setting::CLE_CONNEXION_RAPIDE_ACTIVEE,
            0,
            'Activer la connexion rapide par role (mode demo)',
        );

        Setting::set(
            Setting::CLE_CONNEXION_RAPIDE_ROLES,
            [],
            'Correspondance role => user_id pour la connexion rapide',
        );
    }

    public function down(): void
    {
        Setting::where('cle', Setting::CLE_CONNEXION_RAPIDE_ACTIVEE)->delete();
        Setting::where('cle', Setting::CLE_CONNEXION_RAPIDE_ROLES)->delete();
        Setting::invaliderToutLeCache();
    }
};
