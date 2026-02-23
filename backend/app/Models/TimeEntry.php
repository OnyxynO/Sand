<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string|null $total       Colonne calculee via selectRaw (SUM duree)
 * @property string|null $temps_total Colonne calculee via selectRaw (SUM duree)
 */
class TimeEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'project_id',
        'activity_id',
        'date',
        'duree',
        'commentaire',
    ];

    protected $casts = [
        'date' => 'date',
        'duree' => 'decimal:2',
    ];

    // Relations

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    public function historique(): HasMany
    {
        return $this->hasMany(TimeEntryLog::class)->orderBy('created_at', 'desc');
    }

    // Scopes

    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date', [$dateDebut, $dateFin]);
    }

    public function scopePourUtilisateur($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePourProjet($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeSemaine($query, $date)
    {
        $debut = $date->startOfWeek();
        $fin = $date->endOfWeek();

        return $query->whereBetween('date', [$debut, $fin]);
    }

    // Validation metier

    /**
     * Verifie si la duree est valide (entre 0.01 et 1.00)
     */
    public static function dureeValide(float $duree): bool
    {
        return $duree >= 0.01 && $duree <= 1.00;
    }

    /**
     * Calcule le total des saisies pour un utilisateur a une date donnee
     */
    public static function totalJour(int $userId, $date): float
    {
        return static::where('user_id', $userId)
            ->whereDate('date', $date)
            ->sum('duree');
    }

    /**
     * Verifie si le total du jour depasse 1.0 ETP
     */
    public static function jourComplet(int $userId, $date): bool
    {
        return abs(static::totalJour($userId, $date) - 1.0) < 0.001;
    }
}
