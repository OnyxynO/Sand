<?php

namespace App\GraphQL\Queries;

use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ActivitesDisponiblesQuery
{
    /**
     * Recuperer les activites disponibles pour un projet.
     * Filtre selon les restrictions de visibilite pour l'utilisateur connecte.
     */
    public function __invoke($root, array $args): array
    {
        $projet = Project::findOrFail($args['projetId']);
        $user = Auth::user();

        if ($user) {
            return $projet->getActivitesDisponiblesPour($user)->all();
        }

        return $projet->getActivitesDisponibles()->all();
    }
}
