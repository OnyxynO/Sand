<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\RhApiException;
use App\Models\Absence;
use App\Models\Notification;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AbsenceService
{
    public function __construct(
        protected RhApiClient $rhApiClient,
    ) {}

    // -------------------------------------------------------------------------
    // Flux import RH
    // -------------------------------------------------------------------------

    /**
     * Synchroniser les absences d'un utilisateur depuis l'API RH.
     *
     * @return array{importes: int, conflits: int}
     */
    public function syncUtilisateur(User $utilisateur, string $dateDebut, string $dateFin): array
    {
        $absencesRh = $this->rhApiClient->getAbsences(
            $utilisateur->matricule,
            $dateDebut,
            $dateFin
        );

        $importes = 0;
        $conflits = 0;

        foreach ($absencesRh as $absenceRh) {
            $resultat = $this->traiterAbsence($utilisateur, $absenceRh);
            if ($resultat['importe']) {
                $importes++;
            }
            if ($resultat['conflit']) {
                $conflits++;
            }
        }

        return ['importes' => $importes, 'conflits' => $conflits];
    }

    /**
     * Traiter une absence provenant de l'API RH.
     *
     * @return array{importe: bool, conflit: bool}
     */
    public function traiterAbsence(User $utilisateur, array $absenceRh): array
    {
        $referenceExterne = (string) $absenceRh['id'];
        $importe = false;
        $conflit = false;

        return DB::transaction(function () use ($utilisateur, $absenceRh, $referenceExterne, &$importe, &$conflit) {
            $absenceExistante = Absence::where('reference_externe', $referenceExterne)->first();

            if ($absenceExistante) {
                $this->mettreAJourStatut($absenceExistante, $absenceRh);

                return ['importe' => false, 'conflit' => false];
            }

            $absence = Absence::create([
                'user_id' => $utilisateur->id,
                'type' => $this->mapperType($absenceRh['type']),
                'date_debut' => $absenceRh['date_debut'],
                'date_fin' => $absenceRh['date_fin'],
                'duree_journaliere' => $absenceRh['duree_journaliere'] ?? 1.0,
                'statut' => $this->mapperStatut($absenceRh['statut']),
                'reference_externe' => $referenceExterne,
                'importe_le' => now(),
            ]);

            $importe = true;

            $saisiesEnConflit = $this->detecterConflits($utilisateur, $absence);

            if ($saisiesEnConflit->isNotEmpty()) {
                $conflit = true;
                $this->creerNotificationConflit($utilisateur, $absence, $saisiesEnConflit);
            } else {
                $this->creerNotificationImport($utilisateur, $absence);
            }

            return ['importe' => $importe, 'conflit' => $conflit];
        });
    }

    /**
     * Mettre a jour le statut d'une absence existante si celui-ci a change.
     */
    public function mettreAJourStatut(Absence $absence, array $absenceRh): void
    {
        $nouveauStatut = $this->mapperStatut($absenceRh['statut']);

        if ($absence->statut !== $nouveauStatut) {
            $absence->update([
                'statut' => $nouveauStatut,
                'importe_le' => now(),
            ]);
        }
    }

    /**
     * Detecter les saisies en conflit avec une absence.
     */
    public function detecterConflits(User $utilisateur, Absence $absence): Collection
    {
        return TimeEntry::where('user_id', $utilisateur->id)
            ->whereBetween('date', [$absence->date_debut, $absence->date_fin])
            ->get();
    }

    /**
     * Creer une notification de conflit absence/saisies.
     */
    public function creerNotificationConflit(User $utilisateur, Absence $absence, Collection $saisies): void
    {
        $nombreSaisies = $saisies->count();
        $message = "L'absence {$absence->type_libelle} du {$absence->date_debut->format('d/m/Y')} "
            ."au {$absence->date_fin->format('d/m/Y')} est en conflit avec "
            ."{$nombreSaisies} saisie(s) existante(s).";

        Notification::creer(
            $utilisateur,
            Notification::TYPE_CONFLIT_ABSENCE,
            'Conflit absence/saisie detecte',
            $message,
            [
                'absence_id' => $absence->id,
                'saisie_ids' => $saisies->pluck('id')->toArray(),
            ]
        );
    }

    /**
     * Creer une notification d'import reussi.
     */
    public function creerNotificationImport(User $utilisateur, Absence $absence): void
    {
        $message = "Absence {$absence->type_libelle} importee "
            ."du {$absence->date_debut->format('d/m/Y')} "
            ."au {$absence->date_fin->format('d/m/Y')}.";

        Notification::creer(
            $utilisateur,
            Notification::TYPE_ABSENCE_IMPORTEE,
            'Absence importee du systeme RH',
            $message,
            ['absence_id' => $absence->id]
        );
    }

    /**
     * Mapper le type d'absence RH vers le type SAND.
     */
    public function mapperType(string $typeRh): string
    {
        return match ($typeRh) {
            'conges_payes', 'conges' => Absence::TYPE_CONGES_PAYES,
            'rtt' => Absence::TYPE_RTT,
            'maladie' => Absence::TYPE_MALADIE,
            'formation' => Absence::TYPE_FORMATION,
            default => Absence::TYPE_AUTRE,
        };
    }

    /**
     * Mapper le statut RH vers le statut SAND.
     */
    public function mapperStatut(string $statutRh): string
    {
        return match ($statutRh) {
            'valide', 'validee', 'approuve' => Absence::STATUT_VALIDE,
            'annule', 'annulee', 'refuse' => Absence::STATUT_ANNULE,
            default => Absence::STATUT_VALIDE,
        };
    }

    // -------------------------------------------------------------------------
    // Flux mode manuel (grille de saisie)
    // -------------------------------------------------------------------------

    /**
     * Declarer ou supprimer une absence manuelle pour un utilisateur et une date.
     * duree null/0 = supprime l'absence existante.
     */
    public function declarerAbsenceManuellement(User $user, string $date, ?float $duree): bool
    {
        $existante = Absence::where('user_id', $user->id)
            ->where('date_debut', $date)
            ->where('date_fin', $date)
            ->whereNull('reference_externe')
            ->first();

        if ($duree === null || $duree <= 0) {
            $existante?->delete();
        } else {
            if ($existante) {
                $existante->update(['duree_journaliere' => $duree]);
            } else {
                Absence::create([
                    'user_id' => $user->id,
                    'date_debut' => $date,
                    'date_fin' => $date,
                    'type' => Absence::TYPE_AUTRE,
                    'duree_journaliere' => $duree,
                    'statut' => Absence::STATUT_VALIDE,
                ]);
            }

            $dateFormatee = Carbon::parse($date)->format('d/m/Y');
            $dureeLibelle = $duree >= 1.0 ? 'journee complete' : 'demi-journee';
            Notification::creer(
                $user,
                Notification::TYPE_ABSENCE_IMPORTEE,
                'Absence declaree',
                "Absence du {$dateFormatee} ({$dureeLibelle}) enregistree."
            );
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // Flux admin/modérateur
    // -------------------------------------------------------------------------

    /**
     * Creer manuellement une absence (admin/moderateur uniquement).
     */
    public function creerAbsence(array $args): Absence
    {
        return DB::transaction(function () use ($args) {
            return Absence::create([
                'user_id' => $args['user_id'],
                'date_debut' => $args['date_debut'],
                'date_fin' => $args['date_fin'],
                'type' => $args['type'],
                'duree_journaliere' => $args['duree_journaliere'] ?? 1.0,
                'statut' => Absence::STATUT_VALIDE,
            ]);
        });
    }

    /**
     * Resoudre un conflit entre une absence et des saisies existantes.
     */
    public function resoudreConflit(int $absenceId, string $resolution): bool
    {
        return DB::transaction(function () use ($absenceId, $resolution) {
            $absence = Absence::findOrFail($absenceId);

            if ($resolution === 'IGNORER') {
                $absence->update(['statut' => Absence::STATUT_ANNULE]);
            } elseif ($resolution === 'ECRASER') {
                TimeEntry::where('user_id', $absence->user_id)
                    ->whereBetween('date', [$absence->date_debut, $absence->date_fin])
                    ->delete();
            }

            Notification::where('user_id', $absence->user_id)
                ->where('type', Notification::TYPE_CONFLIT_ABSENCE)
                ->where('est_lu', false)
                ->whereJsonContains('donnees->absence_id', $absence->id)
                ->update(['est_lu' => true, 'lu_le' => now()]);

            return true;
        });
    }
}
