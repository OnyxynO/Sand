<?php

namespace App\GraphQL\Queries;

use App\Models\Absence;
use Illuminate\Support\Facades\Auth;

class AbsencesQuery
{
    /**
     * Recuperer les absences d'un utilisateur sur une periode
     * Utilise le scope periode() pour detecter les chevauchements
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();
        $userId = isset($args['userId']) ? (int) $args['userId'] : $user->id;

        return Absence::where('user_id', $userId)
            ->valide()
            ->periode($args['dateDebut'], $args['dateFin'])
            ->orderBy('date_debut')
            ->get()
            ->all();
    }
}
