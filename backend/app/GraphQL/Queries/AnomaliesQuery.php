<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AnomaliesQuery
{
    /**
     * Detecter les anomalies dans les saisies.
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        // Seuls les moderateurs et admins peuvent voir les anomalies des autres
        if (!$user->estAdmin() && !$user->estModerateur()) {
            abort(403, 'Acces non autorise.');
        }

        $dateDebut = Carbon::parse($args['dateDebut']);
        $dateFin = Carbon::parse($args['dateFin']);
        $typesFilter = $args['types'] ?? null;

        $anomalies = [];
        $anomalyId = 1;

        // Construire la requete de base pour les utilisateurs
        $usersQuery = User::where('est_actif', true);

        if (isset($args['userId'])) {
            $usersQuery->where('id', $args['userId']);
        }

        if (isset($args['equipeId'])) {
            $usersQuery->where('equipe_id', $args['equipeId']);
        }

        $users = $usersQuery->get();

        foreach ($users as $targetUser) {
            // 1. Jours incomplets (total != 1.0)
            if (!$typesFilter || in_array('JOUR_INCOMPLET', $typesFilter)) {
                $joursIncomplets = TimeEntry::query()
                    ->select('date', DB::raw('SUM(duree) as total'))
                    ->where('user_id', $targetUser->id)
                    ->whereBetween('date', [$dateDebut, $dateFin])
                    ->groupBy('date')
                    ->havingRaw('ABS(SUM(duree) - 1.0) > 0.01')
                    ->get();

                foreach ($joursIncomplets as $jour) {
                    $anomalies[] = [
                        'id' => (string) $anomalyId++,
                        'type' => 'JOUR_INCOMPLET',
                        'utilisateur' => $targetUser,
                        'date' => Carbon::parse($jour->date)->format('Y-m-d'),
                        'semaine' => null,
                        'detail' => sprintf(
                            'Total du jour: %.2f ETP (attendu: 1.00)',
                            $jour->total
                        ),
                        'projet' => null,
                    ];
                }
            }

            // 2. Jours manquants (aucune saisie sur un jour ouvre)
            if (!$typesFilter || in_array('JOUR_MANQUANT', $typesFilter)) {
                $joursAvecSaisie = TimeEntry::query()
                    ->where('user_id', $targetUser->id)
                    ->whereBetween('date', [$dateDebut, $dateFin])
                    ->pluck('date')
                    ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
                    ->unique()
                    ->toArray();

                $current = $dateDebut->copy();
                while ($current <= $dateFin) {
                    if (!$current->isWeekend() && !in_array($current->format('Y-m-d'), $joursAvecSaisie)) {
                        $anomalies[] = [
                            'id' => (string) $anomalyId++,
                            'type' => 'JOUR_MANQUANT',
                            'utilisateur' => $targetUser,
                            'date' => $current->format('Y-m-d'),
                            'semaine' => null,
                            'detail' => 'Aucune saisie pour ce jour ouvre',
                            'projet' => null,
                        ];
                    }
                    $current->addDay();
                }
            }

            // 3. Saisie sur absence (si une absence existe pour ce jour)
            if (!$typesFilter || in_array('SAISIE_SUR_ABSENCE', $typesFilter)) {
                $saisiesSurAbsence = DB::table('time_entries as te')
                    ->join('absences as a', function ($join) {
                        $join->on('te.user_id', '=', 'a.user_id')
                            ->whereRaw('te.date BETWEEN a.date_debut AND a.date_fin');
                    })
                    ->join('activities as act', 'te.activity_id', '=', 'act.id')
                    ->where('te.user_id', $targetUser->id)
                    ->whereBetween('te.date', [$dateDebut, $dateFin])
                    ->where('a.statut', 'valide')
                    ->where('act.est_systeme', false) // Exclure l'activite Absence
                    ->select('te.date', 'te.duree')
                    ->get();

                foreach ($saisiesSurAbsence as $saisie) {
                    $anomalies[] = [
                        'id' => (string) $anomalyId++,
                        'type' => 'SAISIE_SUR_ABSENCE',
                        'utilisateur' => $targetUser,
                        'date' => Carbon::parse($saisie->date)->format('Y-m-d'),
                        'semaine' => null,
                        'detail' => sprintf(
                            'Saisie de %.2f ETP sur un jour d\'absence',
                            $saisie->duree
                        ),
                        'projet' => null,
                    ];
                }
            }
        }

        // Filtrer par projet si specifie
        if (isset($args['projetId'])) {
            // Pour les anomalies liees a un projet specifique
            // (implementation simplifiee)
        }

        return $anomalies;
    }
}
