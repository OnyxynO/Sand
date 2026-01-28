<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;

class SettingPolicy
{
    /**
     * Seuls les admins peuvent modifier les parametres
     */
    public function update(User $user): bool
    {
        return $user->estAdmin();
    }
}
