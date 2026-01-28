<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'titre',
        'message',
        'donnees',
        'est_lu',
        'lu_le',
    ];

    protected $casts = [
        'donnees' => 'array',
        'est_lu' => 'boolean',
        'lu_le' => 'datetime',
    ];

    // Types de notifications
    public const TYPE_SAISIE_INCOMPLETE = 'saisie_incomplete';
    public const TYPE_ABSENCE_IMPORTEE = 'absence_importee';
    public const TYPE_CONFLIT_ABSENCE = 'conflit_absence';
    public const TYPE_EXPORT_PRET = 'export_pret';
    public const TYPE_SYSTEME = 'systeme';

    // Relations

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Methodes

    public function marquerCommeLu(): void
    {
        $this->update([
            'est_lu' => true,
            'lu_le' => now(),
        ]);
    }

    // Factory methods

    public static function creer(User $utilisateur, string $type, string $titre, string $message, array $donnees = []): static
    {
        return static::create([
            'user_id' => $utilisateur->id,
            'type' => $type,
            'titre' => $titre,
            'message' => $message,
            'donnees' => $donnees,
        ]);
    }

    // Scopes

    public function scopeNonLu($query)
    {
        return $query->where('est_lu', false);
    }

    public function scopePourUtilisateur($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $jours = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($jours));
    }
}
