<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\ExportTimeEntriesJob;
use App\Models\Export;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class ExportService
{
    public function requestExport(User $user, array $args): Export
    {
        $this->assertCanExport($user);

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

        ExportTimeEntriesJob::dispatch($export->id);

        return $export;
    }

    public function disableExport(User $user, string $exportId): Export
    {
        $export = $this->findOwnedExport($user, $exportId);

        if ($export->chemin_fichier && Storage::disk('local')->exists($export->chemin_fichier)) {
            Storage::disk('local')->delete($export->chemin_fichier);
        }

        $export->marquerDesactive();

        return $export->fresh();
    }

    public function deleteExport(User $user, string $exportId): bool
    {
        $export = $this->findOwnedExport($user, $exportId);

        if ($export->chemin_fichier && Storage::disk('local')->exists($export->chemin_fichier)) {
            Storage::disk('local')->delete($export->chemin_fichier);
        }

        $export->delete();

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function toGraphQlPayload(Export $export): array
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

    private function assertCanExport(User $user): void
    {
        if (! $user->estModerateur() && ! $user->estAdmin()) {
            abort(403, 'Export non autorise.');
        }
    }

    private function findOwnedExport(User $user, string $exportId): Export
    {
        $export = Export::findOrFail($exportId);

        if ($export->user_id !== $user->id) {
            abort(403, 'Acces interdit.');
        }

        return $export;
    }
}
