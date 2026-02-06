<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    /**
     * Seuls les admins peuvent gerer les activites
     */
    public function create(User $user): bool
    {
        return $user->estAdmin();
    }

    public function update(User $user, Activity $activity): bool
    {
        // Les activites systeme ne peuvent pas etre modifiees
        if ($activity->est_systeme) {
            return false;
        }

        return $user->estAdmin();
    }

    public function delete(User $user, Activity $activity): bool
    {
        // Les activites systeme ne peuvent pas etre supprimees
        if ($activity->est_systeme) {
            return false;
        }

        return $user->estAdmin();
    }

    /**
     * Reordonner une activite (y compris systeme)
     */
    public function reorder(User $user): bool
    {
        return $user->estAdmin();
    }

    public function restore(User $user): bool
    {
        return $user->estAdmin();
    }
}
