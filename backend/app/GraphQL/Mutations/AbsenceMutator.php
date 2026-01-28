<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Absence;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AbsenceMutator
{
    /**
     * Synchroniser les absences depuis l'API RH externe.
     */
    public function sync($root, array $args): array
    {
        $this->authorize('sync', Absence::class);

        $userId = $args['userId'] ?? null;
        $dateDebut = Carbon::parse($args['dateDebut']);
        $dateFin = Carbon::parse($args['dateFin']);

        // TODO: Appeler l'API RH externe (mock en dev)
        // Pour l'instant, retourner un resultat vide
        return [
            'importees' => 0,
            'conflits' => [],
        ];
    }

    /**
     * Creer manuellement une absence (admin/moderateur).
     */
    public function create($root, array $args): Absence
    {
        $this->authorize('create', Absence::class);

        return DB::transaction(function () use ($args) {
            $absence = Absence::create([
                'user_id' => $args['userId'],
                'date_debut' => $args['dateDebut'],
                'date_fin' => $args['dateFin'],
                'type' => $args['type'],
                'etp_journalier' => $args['etpJournalier'] ?? 1.0,
                'source' => 'manuel',
                'est_valide' => true,
            ]);

            return $absence;
        });
    }

    /**
     * Resoudre un conflit entre absence et saisie existante.
     */
    public function resolveConflict($root, array $args): bool
    {
        $this->authorize('resolveConflict', Absence::class);

        $action = $args['action']; // 'garder_saisie' ou 'garder_absence'
        $absenceId = $args['absenceId'];
        $saisieId = $args['saisieId'] ?? null;

        return DB::transaction(function () use ($action, $absenceId, $saisieId) {
            if ($action === 'garder_saisie') {
                // Supprimer ou invalider l'absence
                Absence::findOrFail($absenceId)->update(['est_valide' => false]);
            } elseif ($action === 'garder_absence' && $saisieId) {
                // Supprimer la saisie
                TimeEntry::findOrFail($saisieId)->delete();
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
