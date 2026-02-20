<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Export;
use Illuminate\Support\Facades\Auth;

class MesExportsQuery
{
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        return Export::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn (Export $export) => [
                'id' => $export->id,
                'statut' => $export->statutGraphQL(),
                'filtres' => $export->filtres,
                'urlTelechargement' => null,
                'expireLe' => $export->expire_le,
                'creeLe' => $export->created_at,
            ])
            ->all();
    }
}
