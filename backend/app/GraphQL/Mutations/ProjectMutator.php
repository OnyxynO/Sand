<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProjectMutator
{
    /**
     * Creer un projet.
     */
    public function create($root, array $args): Project
    {
        $this->authorize('create', Project::class);

        return Project::create([
            'nom' => $args['nom'],
            'code' => $args['code'],
            'description' => $args['description'] ?? null,
            'date_debut' => $args['dateDebut'] ?? null,
            'date_fin' => $args['dateFin'] ?? null,
            'est_actif' => $args['estActif'] ?? true,
        ]);
    }

    /**
     * Mettre a jour un projet.
     */
    public function update($root, array $args): Project
    {
        $project = Project::findOrFail($args['id']);
        $this->authorize('update', $project);

        $project->update(array_filter([
            'nom' => $args['nom'] ?? null,
            'code' => $args['code'] ?? null,
            'description' => $args['description'] ?? null,
            'date_debut' => $args['dateDebut'] ?? null,
            'date_fin' => $args['dateFin'] ?? null,
            'est_actif' => $args['estActif'] ?? null,
        ], fn($v) => $v !== null));

        return $project->fresh();
    }

    /**
     * Supprimer un projet (soft delete).
     */
    public function delete($root, array $args): bool
    {
        $project = Project::findOrFail($args['id']);
        $this->authorize('delete', $project);

        return $project->delete();
    }

    /**
     * Restaurer un projet supprime.
     */
    public function restore($root, array $args): Project
    {
        $project = Project::withTrashed()->findOrFail($args['id']);
        $this->authorize('restore', $project);

        $project->restore();
        return $project;
    }

    /**
     * Definir les activites du projet (systeme tri-state).
     */
    public function setActivities($root, array $args): Project
    {
        $project = Project::findOrFail($args['id']);
        $this->authorize('update', $project);

        // Sync les activites selectionnees
        $activityIds = $args['activiteIds'] ?? [];
        $project->activites()->sync($activityIds);

        return $project->fresh();
    }

    /**
     * Ajouter un utilisateur au projet.
     */
    public function addUser($root, array $args): Project
    {
        $project = Project::findOrFail($args['projetId']);
        $this->authorize('update', $project);

        $project->utilisateurs()->syncWithoutDetaching([$args['userId']]);

        return $project->fresh();
    }

    /**
     * Retirer un utilisateur du projet.
     */
    public function removeUser($root, array $args): Project
    {
        $project = Project::findOrFail($args['projetId']);
        $this->authorize('update', $project);

        $project->utilisateurs()->detach($args['userId']);

        return $project->fresh();
    }

    /**
     * Ajouter un moderateur au projet.
     */
    public function addModerator($root, array $args): Project
    {
        $project = Project::findOrFail($args['projetId']);
        $this->authorize('update', $project);

        $project->moderateurs()->syncWithoutDetaching([$args['userId']]);

        return $project->fresh();
    }

    /**
     * Retirer un moderateur du projet.
     */
    public function removeModerator($root, array $args): Project
    {
        $project = Project::findOrFail($args['projetId']);
        $this->authorize('update', $project);

        $project->moderateurs()->detach($args['userId']);

        return $project->fresh();
    }

    /**
     * Verifier l'autorisation.
     */
    private function authorize(string $ability, $model): void
    {
        $user = Auth::user();
        if (!$user || !$user->can($ability, $model)) {
            abort(403, 'Action non autorisee.');
        }
    }
}
