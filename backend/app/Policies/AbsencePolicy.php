<?php

namespace App\Policies;

use App\Models\Absence;
use App\Models\User;

class AbsencePolicy
{
    /**
     * Synchroniser les absences (admins et moderateurs)
     */
    public function sync(User $user): bool
    {
        return $user->estModerateur();
    }

    /**
     * Creer une absence manuellement (admins et moderateurs)
     */
    public function create(User $user): bool
    {
        return $user->estModerateur();
    }

    /**
     * Supprimer une absence (admins et moderateurs)
     */
    public function delete(User $user, Absence $absence): bool
    {
        return $user->estModerateur();
    }

    /**
     * Resoudre un conflit absence/saisie (admins et moderateurs)
     */
    public function resolveConflict(User $user): bool
    {
        return $user->estModerateur();
    }
}
