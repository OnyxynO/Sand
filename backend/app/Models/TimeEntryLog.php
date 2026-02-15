<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntryLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'time_entry_id',
        'user_id',
        'action',
        'ancienne_duree',
        'nouvelle_duree',
        'ancien_commentaire',
        'nouveau_commentaire',
        'user_anonymise',
    ];

    protected $casts = [
        'ancienne_duree' => 'decimal:2',
        'nouvelle_duree' => 'decimal:2',
        'user_anonymise' => 'boolean',
    ];

    // Relations

    public function saisie(): BelongsTo
    {
        return $this->belongsTo(TimeEntry::class, 'time_entry_id');
    }

    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Factory methods

    public static function logCreation(TimeEntry $saisie, User $auteur): static
    {
        return static::create([
            'time_entry_id' => $saisie->id,
            'user_id' => $auteur->id,
            'action' => 'creation',
            'nouvelle_duree' => $saisie->duree,
            'nouveau_commentaire' => $saisie->commentaire,
        ]);
    }

    public static function logModification(TimeEntry $saisie, User $auteur, float $ancienneDuree, ?string $ancienCommentaire): static
    {
        return static::create([
            'time_entry_id' => $saisie->id,
            'user_id' => $auteur->id,
            'action' => 'modification',
            'ancienne_duree' => $ancienneDuree,
            'nouvelle_duree' => $saisie->duree,
            'ancien_commentaire' => $ancienCommentaire,
            'nouveau_commentaire' => $saisie->commentaire,
        ]);
    }

    public static function logSuppression(TimeEntry $saisie, User $auteur): static
    {
        return static::create([
            'time_entry_id' => $saisie->id,
            'user_id' => $auteur->id,
            'action' => 'suppression',
            'ancienne_duree' => $saisie->duree,
            'ancien_commentaire' => $saisie->commentaire,
        ]);
    }
}
