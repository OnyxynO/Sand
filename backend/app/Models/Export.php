<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Export extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'statut',
        'format',
        'filtres',
        'chemin_fichier',
        'nom_fichier',
        'expire_le',
        'erreur',
    ];

    protected $casts = [
        'filtres' => 'array',
        'expire_le' => 'datetime',
    ];

    // Statuts
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_EN_COURS = 'en_cours';
    public const STATUT_TERMINE = 'termine';
    public const STATUT_ECHEC = 'echec';

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Export $export) {
            if (empty($export->id)) {
                $export->id = Str::uuid()->toString();
            }
        });
    }

    // Relations

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Helpers

    public function estExpire(): bool
    {
        return $this->expire_le && $this->expire_le->isPast();
    }

    public function estTermine(): bool
    {
        return $this->statut === self::STATUT_TERMINE;
    }

    public function marquerEnCours(): void
    {
        $this->update(['statut' => self::STATUT_EN_COURS]);
    }

    public function marquerTermine(string $cheminFichier, string $nomFichier): void
    {
        $this->update([
            'statut' => self::STATUT_TERMINE,
            'chemin_fichier' => $cheminFichier,
            'nom_fichier' => $nomFichier,
            'expire_le' => now()->addHours(24),
        ]);
    }

    public function marquerEchec(string $erreur): void
    {
        $this->update([
            'statut' => self::STATUT_ECHEC,
            'erreur' => $erreur,
        ]);
    }

    // Mapping statut -> enum GraphQL

    public function statutGraphQL(): string
    {
        return match ($this->statut) {
            self::STATUT_EN_ATTENTE => 'EN_ATTENTE',
            self::STATUT_EN_COURS => 'EN_COURS',
            self::STATUT_TERMINE => 'TERMINE',
            self::STATUT_ECHEC => 'ECHEC',
            default => 'EN_ATTENTE',
        };
    }
}
