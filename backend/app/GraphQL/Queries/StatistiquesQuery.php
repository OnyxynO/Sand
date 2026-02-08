<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\TimeEntry;
use App\Models\Project;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class StatistiquesQuery
{
    /**
     * Recuperer les statistiques agregees.
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        $dateDebut = Carbon::parse($args['dateDebut']);
        $dateFin = Carbon::parse($args['dateFin']);

        $query = TimeEntry::query()
            ->whereBetween('date', [$dateDebut, $dateFin]);

        // Filtres optionnels
        if (isset($args['projetId'])) {
            $query->where('project_id', $args['projetId']);
        }

        if (isset($args['userId'])) {
            $query->where('user_id', $args['userId']);
        }

        if (isset($args['equipeId'])) {
            $query->whereHas('utilisateur', function ($q) use ($args) {
                $q->where('equipe_id', $args['equipeId']);
            });
        }

        // Verifier les droits d'acces
        if (!$user->estAdmin() && !$user->estModerateur()) {
            // Utilisateur simple : uniquement ses propres stats
            $query->where('user_id', $user->id);
        }

        // Temps total
        $tempsTotal = (float) $query->sum('duree');

        // Stats par projet
        $resultatsProjet = TimeEntry::query()
            ->select('project_id', DB::raw('SUM(duree) as temps_total'))
            ->whereBetween('date', [$dateDebut, $dateFin])
            ->when(!$user->estAdmin() && !$user->estModerateur(), function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->groupBy('project_id')
            ->get();

        $projets = Project::whereIn('id', $resultatsProjet->pluck('project_id'))->get()->keyBy('id');

        $parProjet = $resultatsProjet
            ->map(function ($item) use ($tempsTotal, $projets) {
                return [
                    'projet' => $projets->get($item->project_id),
                    'tempsTotal' => (float) $item->temps_total,
                    'pourcentage' => $tempsTotal > 0 ? round(($item->temps_total / $tempsTotal) * 100, 2) : 0,
                ];
            })
            ->filter(fn($item) => $item['projet'] !== null)
            ->values()
            ->toArray();

        // Stats par activite
        $resultatsActivite = TimeEntry::query()
            ->select('activity_id', DB::raw('SUM(duree) as temps_total'))
            ->whereBetween('date', [$dateDebut, $dateFin])
            ->when(!$user->estAdmin() && !$user->estModerateur(), function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->groupBy('activity_id')
            ->get();

        $activites = Activity::whereIn('id', $resultatsActivite->pluck('activity_id'))->get()->keyBy('id');

        $parActivite = $resultatsActivite
            ->map(function ($item) use ($tempsTotal, $activites) {
                return [
                    'activite' => $activites->get($item->activity_id),
                    'tempsTotal' => (float) $item->temps_total,
                    'pourcentage' => $tempsTotal > 0 ? round(($item->temps_total / $tempsTotal) * 100, 2) : 0,
                ];
            })
            ->filter(fn($item) => $item['activite'] !== null)
            ->values()
            ->toArray();

        // Stats par utilisateur (seulement pour moderateurs/admins)
        $parUtilisateur = [];
        if ($user->estAdmin() || $user->estModerateur()) {
            $joursOuvres = $this->compterJoursOuvres($dateDebut, $dateFin);

            $resultatsUtilisateur = TimeEntry::query()
                ->select('user_id', DB::raw('SUM(duree) as temps_total'))
                ->whereBetween('date', [$dateDebut, $dateFin])
                ->groupBy('user_id')
                ->get();

            $utilisateurs = User::whereIn('id', $resultatsUtilisateur->pluck('user_id'))->get()->keyBy('id');

            $parUtilisateur = $resultatsUtilisateur
                ->map(function ($item) use ($joursOuvres, $utilisateurs) {
                    $attendu = $joursOuvres; // 1 ETP par jour
                    return [
                        'utilisateur' => $utilisateurs->get($item->user_id),
                        'tempsTotal' => (float) $item->temps_total,
                        'tauxCompletion' => $attendu > 0 ? round(($item->temps_total / $attendu) * 100, 2) : 0,
                    ];
                })
                ->filter(fn($item) => $item['utilisateur'] !== null)
                ->values()
                ->toArray();
        }

        // Stats par jour
        $parJour = TimeEntry::query()
            ->select('date', DB::raw('SUM(duree) as temps_total'))
            ->whereBetween('date', [$dateDebut, $dateFin])
            ->when(!$user->estAdmin() && !$user->estModerateur(), function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('Y-m-d'),
                    'tempsTotal' => (float) $item->temps_total,
                    'estComplet' => abs($item->temps_total - 1.0) < 0.01,
                ];
            })
            ->toArray();

        return [
            'tempsTotal' => $tempsTotal,
            'parProjet' => $parProjet,
            'parActivite' => $parActivite,
            'parUtilisateur' => $parUtilisateur,
            'parJour' => $parJour,
        ];
    }

    /**
     * Compter les jours ouvres entre deux dates.
     */
    private function compterJoursOuvres(Carbon $debut, Carbon $fin): int
    {
        $count = 0;
        $current = $debut->copy();

        while ($current <= $fin) {
            if (!$current->isWeekend()) {
                $count++;
            }
            $current->addDay();
        }

        return $count;
    }
}
