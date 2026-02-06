<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Team;

class TeamMutator
{
    /**
     * Supprimer une equipe.
     */
    public function delete($root, array $args): bool
    {
        $team = Team::findOrFail($args['id']);

        return $team->delete();
    }
}
