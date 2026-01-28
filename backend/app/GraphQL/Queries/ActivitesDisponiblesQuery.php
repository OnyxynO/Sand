<?php

namespace App\GraphQL\Queries;

use App\Models\Project;

class ActivitesDisponiblesQuery
{
    /**
     * Recuperer les activites disponibles pour un projet
     */
    public function __invoke($root, array $args): array
    {
        $projet = Project::findOrFail($args['projetId']);

        return $projet->getActivitesDisponibles()->all();
    }
}
