<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Activity;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ActivityMutator
{
    /**
     * Creer une activite.
     */
    public function create($root, array $args): Activity
    {
        $this->authorize('create', Activity::class);

        return DB::transaction(function () use ($args) {
            $parentId = $args['parentId'] ?? null;
            $parent = $parentId ? Activity::findOrFail($parentId) : null;

            // Calculer le niveau et le chemin
            $niveau = $parent ? $parent->niveau + 1 : 0;
            $ordre = Activity::where('parent_id', $parentId)->max('ordre') + 1;

            $activity = Activity::create([
                'nom' => $args['nom'],
                'code' => $args['code'] ?? null,
                'description' => $args['description'] ?? null,
                'parent_id' => $parentId,
                'niveau' => $niveau,
                'ordre' => $ordre,
                'est_actif' => $args['estActif'] ?? true,
            ]);

            // Mettre a jour le chemin
            $activity->chemin = $parent ? "{$parent->chemin}.{$activity->id}" : (string)$activity->id;
            $activity->save();

            return $activity;
        });
    }

    /**
     * Mettre a jour une activite.
     */
    public function update($root, array $args): Activity
    {
        $activity = Activity::findOrFail($args['id']);
        $this->authorize('update', $activity);

        if ($activity->est_systeme) {
            abort(403, 'Les activites systeme ne peuvent pas etre modifiees.');
        }

        $activity->update(array_filter([
            'nom' => $args['nom'] ?? null,
            'code' => $args['code'] ?? null,
            'description' => $args['description'] ?? null,
            'est_actif' => $args['estActif'] ?? null,
        ], fn($v) => $v !== null));

        return $activity->fresh();
    }

    /**
     * Supprimer une activite (soft delete).
     */
    public function delete($root, array $args): bool
    {
        $activity = Activity::findOrFail($args['id']);
        $this->authorize('delete', $activity);

        if ($activity->est_systeme) {
            abort(403, 'Les activites systeme ne peuvent pas etre supprimees.');
        }

        return $activity->delete();
    }

    /**
     * Restaurer une activite supprimee.
     */
    public function restore($root, array $args): Activity
    {
        $activity = Activity::withTrashed()->findOrFail($args['id']);
        $this->authorize('restore', $activity);

        $activity->restore();
        return $activity;
    }

    /**
     * Deplacer une activite vers un autre parent.
     */
    public function move($root, array $args): Activity
    {
        $activity = Activity::findOrFail($args['id']);
        $this->authorize('update', $activity);

        if ($activity->est_systeme) {
            abort(403, 'Les activites systeme ne peuvent pas etre deplacees.');
        }

        return DB::transaction(function () use ($activity, $args) {
            $newParentId = $args['parentId'] ?? null;
            $newOrdre = $args['ordre'];
            $oldParentId = $activity->parent_id;

            // Si on change de parent
            if ($newParentId !== $oldParentId) {
                $newParent = $newParentId ? Activity::findOrFail($newParentId) : null;

                // Verifier qu'on ne deplace pas vers un descendant
                if ($newParent && str_starts_with($newParent->chemin, $activity->chemin . '.')) {
                    abort(400, 'Impossible de deplacer une activite vers un de ses descendants.');
                }

                $oldPath = $activity->chemin;
                $newNiveau = $newParent ? $newParent->niveau + 1 : 0;

                $activity->parent_id = $newParentId;
                $activity->niveau = $newNiveau;
                $activity->chemin = $newParent ? "{$newParent->chemin}.{$activity->id}" : (string)$activity->id;

                // Mettre a jour les chemins des descendants
                $this->updateDescendantPaths($activity, $oldPath);
            }

            // Reordonner : decaler les autres activites du meme parent
            $currentOrdre = $activity->ordre;
            if ($newOrdre < $currentOrdre) {
                // Monter : decaler vers le bas les activites entre newOrdre et currentOrdre
                Activity::where('parent_id', $activity->parent_id)
                    ->where('id', '!=', $activity->id)
                    ->where('ordre', '>=', $newOrdre)
                    ->where('ordre', '<', $currentOrdre)
                    ->increment('ordre');
            } else if ($newOrdre > $currentOrdre) {
                // Descendre : decaler vers le haut les activites entre currentOrdre et newOrdre
                Activity::where('parent_id', $activity->parent_id)
                    ->where('id', '!=', $activity->id)
                    ->where('ordre', '>', $currentOrdre)
                    ->where('ordre', '<=', $newOrdre)
                    ->decrement('ordre');
            }

            $activity->ordre = $newOrdre;
            $activity->save();

            return $activity->fresh();
        });
    }

    /**
     * Reordonner les activites.
     */
    public function reorder($root, array $args): bool
    {
        $this->authorize('update', Activity::class);

        return DB::transaction(function () use ($args) {
            foreach ($args['ordres'] as $index => $activityId) {
                Activity::where('id', $activityId)->update(['ordre' => $index]);
            }
            return true;
        });
    }

    /**
     * Mettre a jour les chemins des descendants apres un deplacement.
     */
    private function updateDescendantPaths(Activity $activity, string $oldPath): void
    {
        $descendants = Activity::where('chemin', 'like', $oldPath . '.%')->get();

        foreach ($descendants as $descendant) {
            $descendant->chemin = str_replace($oldPath, $activity->chemin, $descendant->chemin);
            $descendant->niveau = substr_count($descendant->chemin, '.') + 1;
            $descendant->save();
        }
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
