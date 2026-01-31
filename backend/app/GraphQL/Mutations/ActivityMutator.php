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
     * Optimise : une seule INSERT (pas de double save).
     */
    public function create($root, array $args): Activity
    {
        $this->authorize('create', Activity::class);

        return DB::transaction(function () use ($args) {
            $parentId = $args['parentId'] ?? null;
            $parent = $parentId ? Activity::findOrFail($parentId) : null;

            // Calculer l'ordre (dernier parmi les freres)
            $ordre = Activity::where('parent_id', $parentId)->max('ordre');
            $ordre = $ordre !== null ? $ordre + 1 : 0;

            // Obtenir le prochain ID avant l'insertion
            $nextId = DB::selectOne("SELECT nextval('activities_id_seq') AS id")->id;

            // Calculer le chemin directement
            $chemin = $parent ? "{$parent->chemin}.{$nextId}" : (string) $nextId;

            // Creer l'activite en une seule requete
            $activity = Activity::create([
                'id' => $nextId,
                'nom' => $args['nom'],
                'code' => $args['code'] ?? null,
                'description' => $args['description'] ?? null,
                'parent_id' => $parentId,
                'chemin' => $chemin,
                'ordre' => $ordre,
                'est_feuille' => true,
                'est_systeme' => false,
                'est_actif' => $args['estActif'] ?? true,
            ]);

            // Mettre a jour est_feuille du parent
            if ($parent && $parent->est_feuille) {
                $parent->update(['est_feuille' => false]);
            }

            return $activity->fresh();
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
     * Note: est_feuille du parent est recalcule automatiquement via model event.
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
     * Optimise avec ltree : UPDATE batch pour les descendants.
     */
    public function move($root, array $args): Activity
    {
        $activity = Activity::findOrFail($args['id']);
        $this->authorize('update', $activity);

        if ($activity->est_systeme) {
            abort(403, 'Les activites systeme ne peuvent pas etre deplacees.');
        }

        return DB::transaction(function () use ($activity, $args) {
            // Normaliser les IDs pour comparaison (string "2" vs int 2)
            $newParentId = isset($args['parentId']) ? (int)$args['parentId'] : null;
            $oldParentId = $activity->parent_id;
            $newOrdre = (int)$args['ordre'];

            // Convertir pour comparaison coherente
            $oldParentIdNorm = $oldParentId !== null ? (int)$oldParentId : null;

            // Si on change de parent
            if ($newParentId !== $oldParentIdNorm) {
                $newParent = $newParentId ? Activity::findOrFail($newParentId) : null;

                // Verifier qu'on ne deplace pas vers un descendant (operateur ltree)
                if ($newParent) {
                    $isDescendant = DB::selectOne(
                        "SELECT ?::ltree <@ ?::ltree AS is_descendant",
                        [$newParent->chemin, $activity->chemin]
                    )->is_descendant;

                    if ($isDescendant) {
                        abort(400, 'Impossible de deplacer une activite vers un de ses descendants.');
                    }
                }

                $oldPath = $activity->chemin;
                $newPath = $newParent
                    ? "{$newParent->chemin}.{$activity->id}"
                    : (string) $activity->id;

                // Mettre a jour les chemins des descendants en une seule requete (ltree batch)
                DB::statement("
                    UPDATE activities
                    SET chemin = ?::ltree || subpath(chemin, nlevel(?::ltree))
                    WHERE chemin <@ ?::ltree AND id != ?
                ", [$newPath, $oldPath, $oldPath, $activity->id]);

                // Mettre a jour l'activite
                $activity->parent_id = $newParentId;
                $activity->chemin = $newPath;

                // Gerer est_feuille de l'ancien parent
                if ($oldParentId) {
                    $nbEnfants = Activity::where('parent_id', $oldParentId)
                        ->where('id', '!=', $activity->id)
                        ->count();
                    if ($nbEnfants === 0) {
                        Activity::where('id', $oldParentId)->update(['est_feuille' => true]);
                    }
                }

                // Gerer est_feuille du nouveau parent
                if ($newParent && $newParent->est_feuille) {
                    $newParent->update(['est_feuille' => false]);
                }
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
            } elseif ($newOrdre > $currentOrdre) {
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
