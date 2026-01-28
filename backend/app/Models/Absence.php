<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'date_debut',
        'date_fin',
        'duree_journaliere',
        'statut',
        'reference_externe',
        'importe_le',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'duree_journaliere' => 'decimal:2',
        'importe_le' => 'datetime',
    ];

    // Types d'absence connus
    public const TYPE_CONGES_PAYES = 'conges_payes';
    public const TYPE_RTT = 'rtt';
    public const TYPE_MALADIE = 'maladie';
    public const TYPE_FORMATION = 'formation';
    public const TYPE_AUTRE = 'autre';

    public const STATUT_VALIDE = 'valide';
    public const STATUT_ANNULE = 'annule';

    // Relations

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Methodes metier

    /**
     * Retourne le nombre de jours d'absence
     */
    public function getNombreJoursAttribute(): int
    {
        return $this->date_debut->diffInDays($this->date_fin) + 1;
    }

    /**
     * Retourne le total ETP de l'absence
     */
    public function getTotalEtpAttribute(): float
    {
        return $this->nombre_jours * $this->duree_journaliere;
    }

    /**
     * Verifie si une date est couverte par cette absence
     */
    public function couvreDate($date): bool
    {
        $date = $date instanceof \Carbon\Carbon ? $date : \Carbon\Carbon::parse($date);

        return $date->between($this->date_debut, $this->date_fin);
    }

    /**
     * Retourne le libelle du type d'absence
     */
    public function getTypeLibelleAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_CONGES_PAYES => 'Conges payes',
            self::TYPE_RTT => 'RTT',
            self::TYPE_MALADIE => 'Maladie',
            self::TYPE_FORMATION => 'Formation',
            default => 'Autre',
        };
    }

    // Scopes

    public function scopeValide($query)
    {
        return $query->where('statut', self::STATUT_VALIDE);
    }

    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->where(function ($q) use ($dateDebut, $dateFin) {
            $q->whereBetween('date_debut', [$dateDebut, $dateFin])
                ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                ->orWhere(function ($q2) use ($dateDebut, $dateFin) {
                    $q2->where('date_debut', '<=', $dateDebut)
                        ->where('date_fin', '>=', $dateFin);
                });
        });
    }

    public function scopePourUtilisateur($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
