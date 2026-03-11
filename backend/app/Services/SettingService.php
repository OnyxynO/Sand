<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SettingService
{
    public function update(User $user, string $cle, mixed $valeur): Setting
    {
        $this->assertAdmin($user);

        $setting = Setting::where('cle', $cle)->firstOrFail();
        $setting->valeur = $valeur;
        $setting->save();

        Setting::invaliderToutLeCache();

        return $setting->fresh();
    }

    /**
     * @param  array<int, array{cle: string, valeur: mixed}>  $settings
     * @return array<int, Setting>
     */
    public function updateMultiple(User $user, array $settings): array
    {
        $this->assertAdmin($user);

        return DB::transaction(function () use ($settings): array {
            $updated = [];

            foreach ($settings as $param) {
                $setting = Setting::where('cle', $param['cle'])->first();
                if (! $setting) {
                    continue;
                }

                $setting->valeur = $param['valeur'];
                $setting->save();
                $updated[] = $setting->fresh();
            }

            Setting::invaliderToutLeCache();

            return $updated;
        });
    }

    /**
     * @return array<int, Setting>
     */
    public function reset(User $user): array
    {
        $this->assertAdmin($user);

        Setting::reinitialiser();

        return Setting::all()->all();
    }

    private function assertAdmin(User $user): void
    {
        if (! $user->estAdmin()) {
            abort(403, 'Seuls les administrateurs peuvent modifier les parametres.');
        }
    }
}
