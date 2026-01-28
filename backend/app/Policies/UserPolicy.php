<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Seuls les admins peuvent gerer les utilisateurs
     */
    public function create(User $user): bool
    {
        return $user->estAdmin();
    }

    public function update(User $user, User $model): bool
    {
        return $user->estAdmin();
    }

    public function delete(User $user, User $model): bool
    {
        // Un admin ne peut pas se supprimer lui-meme
        return $user->estAdmin() && $user->id !== $model->id;
    }

    public function restore(User $user): bool
    {
        return $user->estAdmin();
    }
}
