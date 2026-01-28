<?php

namespace App\GraphQL\Mutations;

use App\Models\TimeEntry;
use App\Models\TimeEntryLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TimeEntryMutator
{
    /**
     * Creer une saisie de temps
     */
    public function create($root, array $args): TimeEntry
    {
        $user = Auth::user();

        // Validation metier
        $this->validateDuree($args['duree']);
        $this->validateUnique($user->id, $args['date'], $args['activity_id'], $args['project_id']);

        return DB::transaction(function () use ($user, $args) {
            $saisie = TimeEntry::create([
                'user_id' => $user->id,
                'project_id' => $args['project_id'],
                'activity_id' => $args['activity_id'],
                'date' => $args['date'],
                'duree' => $args['duree'],
                'commentaire' => $args['commentaire'] ?? null,
            ]);

            // Log de creation
            TimeEntryLog::logCreation($saisie, $user);

            return $saisie;
        });
    }

    /**
     * Modifier une saisie de temps
     */
    public function update($root, array $args): TimeEntry
    {
        $user = Auth::user();
        $saisie = TimeEntry::findOrFail($args['id']);

        // Validation metier
        $this->validateDuree($args['duree']);

        // Verifier unicite si date/activite/projet changent
        if (
            $saisie->date->format('Y-m-d') !== $args['date'] ||
            $saisie->activity_id != $args['activity_id'] ||
            $saisie->project_id != $args['project_id']
        ) {
            $this->validateUnique($saisie->user_id, $args['date'], $args['activity_id'], $args['project_id'], $saisie->id);
        }

        return DB::transaction(function () use ($user, $saisie, $args) {
            $ancienneDuree = $saisie->duree;
            $ancienCommentaire = $saisie->commentaire;

            $saisie->update([
                'project_id' => $args['project_id'],
                'activity_id' => $args['activity_id'],
                'date' => $args['date'],
                'duree' => $args['duree'],
                'commentaire' => $args['commentaire'] ?? null,
            ]);

            // Log de modification
            TimeEntryLog::logModification($saisie, $user, $ancienneDuree, $ancienCommentaire);

            return $saisie->fresh();
        });
    }

    /**
     * Supprimer une saisie de temps
     */
    public function delete($root, array $args): bool
    {
        $user = Auth::user();
        $saisie = TimeEntry::findOrFail($args['id']);

        return DB::transaction(function () use ($user, $saisie) {
            // Log de suppression
            TimeEntryLog::logSuppression($saisie, $user);

            $saisie->delete();

            return true;
        });
    }

    /**
     * Creer plusieurs saisies d'un coup
     */
    public function bulkCreate($root, array $args): array
    {
        $user = Auth::user();
        $saisies = [];

        DB::transaction(function () use ($user, $args, &$saisies) {
            foreach ($args['inputs'] as $input) {
                $this->validateDuree($input['duree']);
                $this->validateUnique($user->id, $input['date'], $input['activity_id'], $input['project_id']);

                $saisie = TimeEntry::create([
                    'user_id' => $user->id,
                    'project_id' => $input['project_id'],
                    'activity_id' => $input['activity_id'],
                    'date' => $input['date'],
                    'duree' => $input['duree'],
                    'commentaire' => $input['commentaire'] ?? null,
                ]);

                TimeEntryLog::logCreation($saisie, $user);
                $saisies[] = $saisie;
            }
        });

        return $saisies;
    }

    /**
     * Mettre a jour plusieurs saisies d'un coup
     */
    public function bulkUpdate($root, array $args): array
    {
        $user = Auth::user();
        $saisies = [];

        DB::transaction(function () use ($user, $args, &$saisies) {
            foreach ($args['entries'] as $entry) {
                $saisie = TimeEntry::findOrFail($entry['id']);

                $this->validateDuree($entry['duree']);

                $ancienneDuree = $saisie->duree;
                $ancienCommentaire = $saisie->commentaire;

                $saisie->update([
                    'duree' => $entry['duree'],
                    'commentaire' => $entry['commentaire'] ?? $saisie->commentaire,
                ]);

                TimeEntryLog::logModification($saisie, $user, $ancienneDuree, $ancienCommentaire);
                $saisies[] = $saisie->fresh();
            }
        });

        return $saisies;
    }

    /**
     * Valider la duree (0.01 a 1.00)
     */
    private function validateDuree(float $duree): void
    {
        if ($duree < 0.01 || $duree > 1.00) {
            throw ValidationException::withMessages([
                'duree' => ['La duree doit etre comprise entre 0.01 et 1.00 ETP.'],
            ]);
        }
    }

    /**
     * Valider l'unicite de la saisie
     */
    private function validateUnique(int $userId, string $date, int $activityId, int $projectId, ?int $excludeId = null): void
    {
        $query = TimeEntry::where('user_id', $userId)
            ->where('date', $date)
            ->where('activity_id', $activityId)
            ->where('project_id', $projectId);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'saisie' => ['Une saisie existe deja pour cette combinaison date/activite/projet.'],
            ]);
        }
    }
}
