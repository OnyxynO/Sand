<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;

class TimeEntryPolicy
{
    /**
     * Voir les saisies d'un utilisateur : ses propres saisies ou moderateur d'au moins un projet
     */
    public function viewAny(User $user, ?int $targetUserId = null): bool
    {
        if ($user->estAdmin()) {
            return true;
        }

        // Ses propres saisies
        if ($targetUserId === null || $targetUserId === $user->id) {
            return true;
        }

        // Moderateur d'au moins un projet
        return $user->projetsModeres()->exists();
    }

    /**
     * Voir une saisie : proprietaire ou moderateur du projet
     */
    public function view(User $user, TimeEntry $entry): bool
    {
        if ($user->estAdmin()) {
            return true;
        }

        if ($user->id === $entry->user_id) {
            return true;
        }

        $projet = $entry->projet;

        return $projet instanceof Project && $user->peutModererProjet($projet);
    }

    /**
     * Creer une saisie : pour soi-meme ou moderateur du projet cible
     */
    public function create(User $user, ?int $targetUserId = null, ?int $projectId = null): bool
    {
        if ($user->estAdmin()) {
            return true;
        }

        // Creation pour soi-meme
        if ($targetUserId === null || $targetUserId === $user->id) {
            return true;
        }

        // Creation pour autrui : doit etre moderateur du projet cible
        if ($projectId === null) {
            return false;
        }

        $projet = Project::find($projectId);
        if (!$projet) {
            return false;
        }

        return $user->peutModererProjet($projet);
    }

    /**
     * Modifier une saisie : proprietaire ou moderateur du projet
     */
    public function update(User $user, TimeEntry $entry): bool
    {
        if ($user->estAdmin()) {
            return true;
        }

        if ($user->id === $entry->user_id) {
            return true;
        }

        $projet = $entry->projet;

        return $projet instanceof Project && $user->peutModererProjet($projet);
    }

    /**
     * Supprimer une saisie : proprietaire ou moderateur du projet
     */
    public function delete(User $user, TimeEntry $entry): bool
    {
        if ($user->estAdmin()) {
            return true;
        }

        if ($user->id === $entry->user_id) {
            return true;
        }

        $projet = $entry->projet;

        return $projet instanceof Project && $user->peutModererProjet($projet);
    }
}
