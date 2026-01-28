<?php

declare(strict_types=1);

namespace App\GraphQL\Resolvers;

use App\Models\Project;
use App\Models\TimeEntry;

class ProjectResolver
{
    /**
     * Calculer le temps total saisi sur un projet.
     */
    public function tempsTotal(Project $project): float
    {
        return (float) TimeEntry::where('project_id', $project->id)->sum('etp');
    }
}
