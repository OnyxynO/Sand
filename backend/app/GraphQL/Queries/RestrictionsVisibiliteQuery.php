<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\ActivityUserVisibility;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class RestrictionsVisibiliteQuery
{
    /**
     * Recuperer les restrictions de visibilite d'un projet.
     * Seuls les admins peuvent voir les restrictions.
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'admin') {
            abort(403, 'Acces non autorise');
        }

        $projet = Project::findOrFail($args['projetId']);

        return ActivityUserVisibility::where('project_id', $projet->id)
            ->where('est_visible', false)
            ->with(['activite', 'utilisateur', 'projet'])
            ->get()
            ->all();
    }
}
