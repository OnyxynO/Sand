<?php

declare(strict_types=1);

namespace App\GraphQL\Builders;

use Illuminate\Database\Eloquent\Builder;

final class ProjectBuilder
{
    /**
     * Filtre les projets par modérateur.
     */
    public function filterByModerateur(Builder $builder, ?string $moderateurId): Builder
    {
        if ($moderateurId === null) {
            return $builder;
        }

        return $builder->whereHas('moderateurs', function (Builder $query) use ($moderateurId) {
            $query->where('users.id', $moderateurId);
        });
    }
}
