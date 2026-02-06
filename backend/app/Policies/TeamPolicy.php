<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    /**
     * Seuls les admins peuvent gerer les equipes
     */
    public function create(User $user): bool
    {
        return $user->estAdmin();
    }

    public function update(User $user, Team $team): bool
    {
        return $user->estAdmin();
    }

    public function delete(User $user): bool
    {
        return $user->estAdmin();
    }
}
