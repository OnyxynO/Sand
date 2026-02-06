<?php

namespace App\GraphQL\Queries;

use App\Models\TimeEntry;
use Illuminate\Support\Facades\Auth;

class SaisiesQuery
{
    /**
     * Recuperer les saisies avec controle d'acces.
     * - Utilisateur normal : ses propres saisies uniquement
     * - Moderateur : ses saisies + celles des projets qu'il modere
     * - Admin : toutes les saisies
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();

        $query = TimeEntry::query()
            ->with(['projet', 'activite', 'utilisateur']);

        // Filtres de date (obligatoires)
        $query->where('date', '>=', $args['dateDebut'])
            ->where('date', '<=', $args['dateFin']);

        // Filtres optionnels
        if (isset($args['projetId'])) {
            $query->where('project_id', $args['projetId']);
        }
        if (isset($args['activiteId'])) {
            $query->where('activity_id', $args['activiteId']);
        }

        // Controle d'acces
        if ($user->estAdmin()) {
            // Admin : filtrer par userId si demande, sinon tout
            if (isset($args['userId'])) {
                $query->where('user_id', $args['userId']);
            }
        } elseif ($user->projetsModeres()->exists()) {
            // Moderateur : ses saisies + celles de ses projets moderes
            $projetsModeres = $user->projetsModeres()->pluck('projects.id');

            if (isset($args['userId'])) {
                // Filtre explicite : verifier que c'est soit soi-meme soit un projet modere
                $query->where('user_id', $args['userId']);
                if ((int) $args['userId'] !== $user->id) {
                    $query->whereIn('project_id', $projetsModeres);
                }
            } else {
                // Pas de filtre userId : ses saisies + celles des projets moderes
                $query->where(function ($q) use ($user, $projetsModeres) {
                    $q->where('user_id', $user->id)
                        ->orWhereIn('project_id', $projetsModeres);
                });
            }
        } else {
            // Utilisateur normal : ses propres saisies uniquement
            $query->where('user_id', $user->id);
        }

        return $query->orderBy('date')
            ->orderBy('created_at')
            ->get()
            ->all();
    }
}
