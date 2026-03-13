<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Setting;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Support\Facades\Auth;

class SettingMutator
{
    public function __construct(
        private readonly SettingService $settingService,
    ) {}

    /**
     * Mettre a jour un parametre.
     */
    public function update($root, array $args): Setting
    {
        return $this->settingService->update(
            $this->authorize(),
            $args['cle'],
            $args['valeur'],
        );
    }

    /**
     * Mettre a jour plusieurs parametres.
     */
    public function updateMultiple($root, array $args): array
    {
        return $this->settingService->updateMultiple(
            $this->authorize(),
            $args['settings'],
        );
    }

    /**
     * Reinitialiser tous les parametres a leurs valeurs par defaut.
     *
     * @return array<Setting>
     */
    public function reset($root, array $args): array
    {
        return $this->settingService->reset($this->authorize());
    }

    /**
     * Verifier l'autorisation (admin uniquement).
     */
    private function authorize(): User
    {
        $user = Auth::user();
        if (!$user || !$user->estAdmin()) {
            abort(403, 'Seuls les administrateurs peuvent modifier les parametres.');
        }

        return $user;
    }
}
