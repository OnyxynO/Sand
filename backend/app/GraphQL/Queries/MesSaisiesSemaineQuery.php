<?php

namespace App\GraphQL\Queries;

use App\Models\TimeEntry;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class MesSaisiesSemaineQuery
{
    /**
     * Recuperer les saisies de la semaine pour l'utilisateur connecte
     *
     * @param string $semaine Format: "2025-W04"
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();
        $semaine = $args['semaine'];

        // Parser la semaine (format ISO: 2025-W04)
        [$annee, $numeroSemaine] = explode('-W', $semaine);
        $debut = Carbon::now()
            ->setISODate((int) $annee, (int) $numeroSemaine)
            ->startOfWeek();
        $fin = $debut->copy()->endOfWeek();

        return TimeEntry::where('user_id', $user->id)
            ->whereBetween('date', [$debut, $fin])
            ->with(['projet', 'activite'])
            ->orderBy('date')
            ->orderBy('created_at')
            ->get()
            ->all();
    }
}
