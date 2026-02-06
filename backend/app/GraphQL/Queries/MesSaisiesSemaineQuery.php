<?php

namespace App\GraphQL\Queries;

use App\Models\TimeEntry;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class MesSaisiesSemaineQuery
{
    /**
     * Recuperer les saisies de la semaine pour un utilisateur
     * Si userId est fourni, verifie les droits de moderation
     *
     * @param string $semaine Format: "2025-W04"
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();
        $targetUserId = isset($args['userId']) ? (int) $args['userId'] : $user->id;

        // Verifier les droits de consultation
        Gate::forUser($user)->authorize('viewAny', [TimeEntry::class, $targetUserId]);

        // Si moderation d'un autre utilisateur, filtrer sur les projets moderes
        $filtrerParProjetsModeres = ($targetUserId !== $user->id && !$user->estAdmin());

        $semaine = $args['semaine'];

        // Parser la semaine (format ISO: 2025-W04)
        [$annee, $numeroSemaine] = explode('-W', $semaine);
        $debut = Carbon::now()
            ->setISODate((int) $annee, (int) $numeroSemaine)
            ->startOfWeek();
        $fin = $debut->copy()->endOfWeek();

        $query = TimeEntry::where('user_id', $targetUserId)
            ->whereBetween('date', [$debut, $fin])
            ->with(['projet', 'activite']);

        // Filtrer sur les projets moderes si necessaire
        if ($filtrerParProjetsModeres) {
            $projetsModeres = $user->projetsModeres()->pluck('projects.id');
            $query->whereIn('project_id', $projetsModeres);
        }

        return $query->orderBy('date')
            ->orderBy('created_at')
            ->get()
            ->all();
    }
}
