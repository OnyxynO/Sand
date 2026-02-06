<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Jobs\ExportTimeEntriesJob;
use App\Models\Export;
use Illuminate\Support\Facades\Auth;

class ExportMutator
{
    /**
     * Demander un export CSV.
     */
    public function request($root, array $args): array
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        // Seuls moderateurs et admins peuvent exporter
        if (!$user->estModerateur() && !$user->estAdmin()) {
            abort(403, 'Export non autorise.');
        }

        // Creer l'export en base
        $export = Export::create([
            'user_id' => $user->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => $args['format'] ?? 'CSV',
            'filtres' => array_filter([
                'date_debut' => $args['date_debut'] ?? null,
                'date_fin' => $args['date_fin'] ?? null,
                'project_id' => $args['project_id'] ?? null,
                'team_id' => $args['team_id'] ?? null,
                'user_id' => $args['user_id'] ?? null,
            ]),
        ]);

        // Dispatcher le job
        ExportTimeEntriesJob::dispatch($export->id);

        return [
            'id' => $export->id,
            'statut' => $export->statutGraphQL(),
            'urlTelechargement' => null,
            'expireLe' => null,
        ];
    }
}
