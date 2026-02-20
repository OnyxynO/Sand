<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Jobs\ExportTimeEntriesJob;
use App\Models\Export;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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

        return $this->exportVersTableau($export);
    }

    /**
     * Desactiver un export : supprime le fichier, conserve la ligne en base.
     */
    public function desactiver($root, array $args): array
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        $export = Export::findOrFail($args['id']);

        if ($export->user_id !== $user->id) {
            abort(403, 'Acces interdit.');
        }

        // Supprimer le fichier physique si present
        if ($export->chemin_fichier && Storage::disk('local')->exists($export->chemin_fichier)) {
            Storage::disk('local')->delete($export->chemin_fichier);
        }

        $export->marquerDesactive();

        return $this->exportVersTableau($export);
    }

    /**
     * Supprimer definitivement un export (ligne en base + fichier).
     */
    public function supprimer($root, array $args): bool
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        $export = Export::findOrFail($args['id']);

        if ($export->user_id !== $user->id) {
            abort(403, 'Acces interdit.');
        }

        // Supprimer le fichier physique si present
        if ($export->chemin_fichier && Storage::disk('local')->exists($export->chemin_fichier)) {
            Storage::disk('local')->delete($export->chemin_fichier);
        }

        $export->delete();

        return true;
    }

    private function exportVersTableau(Export $export): array
    {
        return [
            'id' => $export->id,
            'statut' => $export->statutGraphQL(),
            'filtres' => $export->filtres,
            'urlTelechargement' => null,
            'expireLe' => $export->expire_le,
            'creeLe' => $export->created_at,
        ];
    }
}
