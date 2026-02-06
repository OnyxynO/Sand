<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Export;
use App\Models\Notification;
use App\Models\TimeEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ExportTimeEntriesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        private readonly string $exportId,
    ) {}

    public function handle(): void
    {
        $export = Export::findOrFail($this->exportId);
        $export->marquerEnCours();

        try {
            $filtres = $export->filtres ?? [];
            $query = TimeEntry::query()
                ->with(['utilisateur', 'projet', 'activite'])
                ->orderBy('date')
                ->orderBy('user_id');

            // Appliquer les filtres
            if (!empty($filtres['date_debut']) && !empty($filtres['date_fin'])) {
                $query->periode($filtres['date_debut'], $filtres['date_fin']);
            }

            if (!empty($filtres['project_id'])) {
                $query->pourProjet($filtres['project_id']);
            }

            if (!empty($filtres['user_id'])) {
                $query->pourUtilisateur($filtres['user_id']);
            }

            if (!empty($filtres['team_id'])) {
                $query->whereHas('utilisateur', function ($q) use ($filtres) {
                    $q->where('equipe_id', $filtres['team_id']);
                });
            }

            // Generer le CSV
            $nomFichier = 'export_saisies_' . now()->format('Ymd_His') . '.csv';
            $cheminFichier = 'exports/' . $export->id . '/' . $nomFichier;

            $csv = $this->genererCsv($query);
            Storage::disk('local')->put($cheminFichier, $csv);

            // Marquer termine
            $export->marquerTermine($cheminFichier, $nomFichier);

            // Creer notification
            $utilisateur = $export->utilisateur;
            Notification::creer(
                $utilisateur,
                Notification::TYPE_EXPORT_PRET,
                'Export pret',
                'Votre export CSV est pret. Le lien expire dans 24h.',
                ['export_id' => $export->id],
            );
        } catch (\Throwable $e) {
            $export->marquerEchec($e->getMessage());

            Notification::creer(
                $export->utilisateur,
                Notification::TYPE_SYSTEME,
                'Echec export',
                'L\'export CSV a echoue : ' . $e->getMessage(),
            );

            throw $e;
        }
    }

    private function genererCsv($query): string
    {
        $lignes = [];

        // En-tete
        $lignes[] = implode(';', [
            'Utilisateur',
            'Matricule',
            'Equipe',
            'Date',
            'Projet (code)',
            'Projet (nom)',
            'Activite',
            'Duree (ETP)',
            'Commentaire',
        ]);

        // Donnees par chunks pour economiser la memoire
        $query->chunk(500, function ($saisies) use (&$lignes) {
            foreach ($saisies as $saisie) {
                $lignes[] = implode(';', [
                    $this->echapperCsv($saisie->utilisateur->nomComplet ?? ''),
                    $this->echapperCsv($saisie->utilisateur->matricule ?? ''),
                    $this->echapperCsv($saisie->utilisateur->equipe?->nom ?? ''),
                    $saisie->date->format('d/m/Y'),
                    $this->echapperCsv($saisie->projet->code ?? ''),
                    $this->echapperCsv($saisie->projet->nom ?? ''),
                    $this->echapperCsv($saisie->activite->nom ?? ''),
                    number_format((float) $saisie->duree, 2, ',', ''),
                    $this->echapperCsv($saisie->commentaire ?? ''),
                ]);
            }
        });

        // BOM UTF-8 pour Excel
        return "\xEF\xBB\xBF" . implode("\r\n", $lignes);
    }

    private function echapperCsv(string $valeur): string
    {
        if (str_contains($valeur, ';') || str_contains($valeur, '"') || str_contains($valeur, "\n")) {
            return '"' . str_replace('"', '""', $valeur) . '"';
        }

        return $valeur;
    }
}
