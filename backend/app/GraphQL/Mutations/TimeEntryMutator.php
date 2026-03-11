<?php

namespace App\GraphQL\Mutations;

use App\Models\TimeEntry;
use App\Services\TimeEntryService;
use Illuminate\Support\Facades\Auth;

class TimeEntryMutator
{
    public function __construct(
        protected TimeEntryService $timeEntryService,
    ) {}

    /**
     * Creer une saisie de temps
     */
    public function create($root, array $args): TimeEntry
    {
        return $this->timeEntryService->create(Auth::user(), $args);
    }

    /**
     * Modifier une saisie de temps
     */
    public function update($root, array $args): TimeEntry
    {
        $saisie = TimeEntry::findOrFail($args['id']);

        return $this->timeEntryService->update(Auth::user(), $saisie, $args);
    }

    /**
     * Supprimer une saisie de temps
     */
    public function delete($root, array $args): bool
    {
        $saisie = TimeEntry::findOrFail($args['id']);

        return $this->timeEntryService->delete(Auth::user(), $saisie);
    }

    /**
     * Creer plusieurs saisies d'un coup
     */
    public function bulkCreate($root, array $args): array
    {
        return $this->timeEntryService->bulkCreate(Auth::user(), $args['inputs']);
    }

    /**
     * Mettre a jour plusieurs saisies d'un coup
     */
    public function bulkUpdate($root, array $args): array
    {
        return $this->timeEntryService->bulkUpdate(Auth::user(), $args['entries']);
    }
}
