<?php

namespace App\GraphQL\Queries;

use App\Services\WeeklyTimeEntryQueryService;
use Illuminate\Support\Facades\Auth;

class MesSaisiesSemaineQuery
{
    public function __construct(
        protected WeeklyTimeEntryQueryService $weeklyTimeEntryQueryService,
    ) {}

    /**
     * Recuperer les saisies de la semaine pour un utilisateur.
     * Si userId est fourni, verifie les droits de moderation.
     * Le parametre semaine (format "2025-W04") est lu depuis $args['semaine'].
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();
        $targetUserId = isset($args['userId']) ? (int) $args['userId'] : $user->id;

        return $this->weeklyTimeEntryQueryService->forUserAndWeek($user, $args['semaine'], $targetUserId);
    }
}
