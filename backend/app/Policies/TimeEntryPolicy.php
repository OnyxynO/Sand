<?php

namespace App\Policies;

use App\Models\TimeEntry;
use App\Models\User;

class TimeEntryPolicy
{
    /**
     * Modifier une saisie : proprietaire ou moderateur du projet
     */
    public function update(User $user, TimeEntry $entry): bool
    {
        // Proprietaire de la saisie
        if ($user->id === $entry->user_id) {
            return true;
        }

        // Moderateur du projet
        return $user->peutModererProjet($entry->projet);
    }

    /**
     * Supprimer une saisie : proprietaire ou moderateur du projet
     */
    public function delete(User $user, TimeEntry $entry): bool
    {
        // Proprietaire de la saisie
        if ($user->id === $entry->user_id) {
            return true;
        }

        // Moderateur du projet
        return $user->peutModererProjet($entry->projet);
    }
}
