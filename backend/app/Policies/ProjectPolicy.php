<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Les admins peuvent creer des projets
     */
    public function create(User $user): bool
    {
        return $user->estAdmin();
    }

    /**
     * Admins et moderateurs du projet peuvent modifier
     */
    public function update(User $user, Project $project): bool
    {
        return $user->peutModererProjet($project);
    }

    /**
     * Seuls les admins peuvent supprimer
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->estAdmin();
    }

    /**
     * Seuls les admins peuvent restaurer
     */
    public function restore(User $user): bool
    {
        return $user->estAdmin();
    }

    /**
     * Gestion des moderateurs (admins uniquement)
     */
    public function manageModerators(User $user, Project $project): bool
    {
        return $user->estAdmin();
    }

    /**
     * Gestion des utilisateurs (admins et moderateurs)
     */
    public function manageUsers(User $user, Project $project): bool
    {
        return $user->peutModererProjet($project);
    }

    /**
     * Gestion des activites (admins et moderateurs)
     */
    public function manageActivities(User $user, Project $project): bool
    {
        return $user->peutModererProjet($project);
    }

    /**
     * Gestion des restrictions de visibilite (admins uniquement)
     */
    public function manageVisibility(User $user, Project $project): bool
    {
        return $user->estAdmin();
    }
}
