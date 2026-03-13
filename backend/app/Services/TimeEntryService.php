<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TimeEntry;
use App\Models\TimeEntryLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Nuwave\Lighthouse\Exceptions\ValidationException;

class TimeEntryService
{
    public function create(User $actor, array $attributes): TimeEntry
    {
        $targetUserId = isset($attributes['user_id']) ? (int) $attributes['user_id'] : $actor->id;

        Gate::forUser($actor)->authorize('create', [TimeEntry::class, $targetUserId, (int) $attributes['project_id']]);
        $this->validateDuree((float) $attributes['duree']);
        $this->validateUnique(
            $targetUserId,
            (string) $attributes['date'],
            (int) $attributes['activity_id'],
            (int) $attributes['project_id']
        );

        return DB::transaction(function () use ($actor, $targetUserId, $attributes) {
            $timeEntry = TimeEntry::create([
                'user_id' => $targetUserId,
                'project_id' => $attributes['project_id'],
                'activity_id' => $attributes['activity_id'],
                'date' => $attributes['date'],
                'duree' => $attributes['duree'],
                'commentaire' => $attributes['commentaire'] ?? null,
            ]);

            TimeEntryLog::logCreation($timeEntry, $actor);

            return $timeEntry;
        });
    }

    public function update(User $actor, TimeEntry $timeEntry, array $attributes): TimeEntry
    {
        Gate::forUser($actor)->authorize('update', $timeEntry);
        $this->validateDuree((float) $attributes['duree']);

        if (
            $timeEntry->date->format('Y-m-d') !== $attributes['date'] ||
            $timeEntry->activity_id !== (int) $attributes['activity_id'] ||
            $timeEntry->project_id !== (int) $attributes['project_id']
        ) {
            $this->validateUnique(
                (int) $timeEntry->user_id,
                (string) $attributes['date'],
                (int) $attributes['activity_id'],
                (int) $attributes['project_id'],
                (int) $timeEntry->id
            );
        }

        return DB::transaction(function () use ($actor, $timeEntry, $attributes) {
            $ancienneDuree = (float) $timeEntry->duree;
            $ancienCommentaire = $timeEntry->commentaire;

            $timeEntry->update([
                'project_id' => $attributes['project_id'],
                'activity_id' => $attributes['activity_id'],
                'date' => $attributes['date'],
                'duree' => $attributes['duree'],
                'commentaire' => $attributes['commentaire'] ?? null,
            ]);

            TimeEntryLog::logModification($timeEntry, $actor, $ancienneDuree, $ancienCommentaire);

            return $timeEntry->fresh();
        });
    }

    public function delete(User $actor, TimeEntry $timeEntry): bool
    {
        Gate::forUser($actor)->authorize('delete', $timeEntry);

        return DB::transaction(function () use ($actor, $timeEntry) {
            TimeEntryLog::logSuppression($timeEntry, $actor);
            $timeEntry->delete();

            return true;
        });
    }

    /**
     * @return array<int, TimeEntry>
     */
    public function bulkCreate(User $actor, array $inputs): array
    {
        $saisies = [];

        DB::transaction(function () use ($actor, $inputs, &$saisies) {
            foreach ($inputs as $input) {
                $saisies[] = $this->create($actor, $input);
            }
        });

        return $saisies;
    }

    /**
     * @return array<int, TimeEntry>
     */
    public function bulkUpdate(User $actor, array $entries): array
    {
        $saisies = [];

        DB::transaction(function () use ($actor, $entries, &$saisies) {
            foreach ($entries as $entry) {
                $timeEntry = TimeEntry::findOrFail($entry['id']);
                $saisies[] = $this->update($actor, $timeEntry, [
                    'project_id' => $timeEntry->project_id,
                    'activity_id' => $timeEntry->activity_id,
                    'date' => $timeEntry->date->format('Y-m-d'),
                    'duree' => $entry['duree'],
                    'commentaire' => $entry['commentaire'] ?? $timeEntry->commentaire,
                ]);
            }
        });

        return $saisies;
    }

    private function validateDuree(float $duree): void
    {
        if ($duree < 0.01 || $duree > 1.00) {
            throw ValidationException::withMessages([
                'duree' => ['La duree doit etre comprise entre 0.01 et 1.00 ETP.'],
            ]);
        }
    }

    private function validateUnique(
        int $userId,
        string $date,
        int $activityId,
        int $projectId,
        ?int $excludeId = null
    ): void {
        $query = TimeEntry::where('user_id', $userId)
            ->where('date', $date)
            ->where('activity_id', $activityId)
            ->where('project_id', $projectId);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'saisie' => ['Une saisie existe deja pour cette combinaison date/activite/projet.'],
            ]);
        }
    }
}
