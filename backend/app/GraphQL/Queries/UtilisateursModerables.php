<?php

namespace App\GraphQL\Queries;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UtilisateursModerables
{
    /**
     * Retourne les utilisateurs dont le moderateur peut gerer les saisies.
     * - Admin : tous les utilisateurs actifs
     * - Moderateur : utilisateurs ayant des saisies sur ses projets moderes
     * - Utilisateur : liste vide
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();

        if ($user->estAdmin()) {
            return User::actif()
                ->where('id', '!=', $user->id)
                ->orderBy('nom')
                ->orderBy('prenom')
                ->get()
                ->all();
        }

        if (!$user->projetsModeres()->exists()) {
            return [];
        }

        $projetsModeres = $user->projetsModeres()->pluck('projects.id');

        // Utilisateurs ayant des saisies sur les projets moderes
        return User::actif()
            ->where('id', '!=', $user->id)
            ->whereHas('saisies', function ($query) use ($projetsModeres) {
                $query->whereIn('project_id', $projetsModeres);
            })
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get()
            ->all();
    }
}
