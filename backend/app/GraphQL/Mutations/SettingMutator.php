<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SettingMutator
{
    /**
     * Mettre a jour un parametre.
     */
    public function update($root, array $args): Setting
    {
        $this->authorize();

        $setting = Setting::where('cle', $args['cle'])->firstOrFail();
        $setting->valeur = $args['valeur'];
        $setting->save();

        // Vider le cache
        Setting::invaliderToutLeCache();

        return $setting;
    }

    /**
     * Mettre a jour plusieurs parametres.
     */
    public function updateMultiple($root, array $args): array
    {
        $this->authorize();

        return DB::transaction(function () use ($args) {
            $updated = [];

            foreach ($args['settings'] as $param) {
                $setting = Setting::where('cle', $param['cle'])->first();
                if ($setting) {
                    $setting->valeur = $param['valeur'];
                    $setting->save();
                    $updated[] = $setting;
                }
            }

            // Vider le cache
            Setting::invaliderToutLeCache();

            return $updated;
        });
    }

    /**
     * Reinitialiser tous les parametres a leurs valeurs par defaut.
     *
     * @return array<Setting>
     */
    public function reset($root, array $args): array
    {
        $this->authorize();

        Setting::reinitialiser();

        return Setting::all()->all();
    }

    /**
     * Verifier l'autorisation (admin uniquement).
     */
    private function authorize(): void
    {
        $user = Auth::user();
        if (!$user || !$user->estAdmin()) {
            abort(403, 'Seuls les administrateurs peuvent modifier les parametres.');
        }
    }
}
