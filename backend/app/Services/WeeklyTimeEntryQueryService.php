<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TimeEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

class WeeklyTimeEntryQueryService
{
    public function forUserAndWeek(User $actor, string $semaine, ?int $targetUserId = null): array
    {
        $resolvedTargetUserId = $targetUserId ?? $actor->id;

        Gate::forUser($actor)->authorize('viewAny', [TimeEntry::class, $resolvedTargetUserId]);

        [$annee, $numeroSemaine] = explode('-W', $semaine);
        $debut = Carbon::now()->setISODate((int) $annee, (int) $numeroSemaine)->startOfWeek();
        $fin = $debut->copy()->endOfWeek();

        $query = TimeEntry::where('user_id', $resolvedTargetUserId)
            ->whereBetween('date', [$debut, $fin])
            ->with(['projet', 'activite']);

        if ($resolvedTargetUserId !== $actor->id && ! $actor->estAdmin()) {
            $projetsModeres = $actor->projetsModeres()->pluck('projects.id');
            $query->whereIn('project_id', $projetsModeres);
        }

        return $query->orderBy('date')
            ->orderBy('created_at')
            ->get()
            ->all();
    }
}
