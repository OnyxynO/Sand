<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nom',
        'code',
        'description',
        'date_debut',
        'date_fin',
        'est_actif',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'est_actif' => 'boolean',
    ];

    // Relations

    public function utilisateurs(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withTimestamps();
    }

    public function moderateurs(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_moderators')
            ->withTimestamps();
    }

    public function activitesActives(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'project_activities')
            ->withTimestamps();
    }

    public function saisies(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function restrictionsVisibilite(): HasMany
    {
        return $this->hasMany(ActivityUserVisibility::class);
    }

    // Methodes metier

    /**
     * Retourne les activites disponibles pour ce projet.
     * Si aucune activite n'est explicitement activee, toutes les activites actives sont disponibles.
     * Sinon, seules les activites explicitement activees + l'activite systeme Absence.
     */
    public function getActivitesDisponibles()
    {
        $activitesExplicites = $this->activitesActives()->count();

        if ($activitesExplicites === 0) {
            // Toutes les activites feuilles actives
            return Activity::actif()->feuille()->get();
        }

        // Activites explicitement activees + activites systeme
        return Activity::actif()
            ->feuille()
            ->where(function ($query) {
                $query->whereIn('id', $this->activitesActives()->pluck('activities.id'))
                    ->orWhere('est_systeme', true);
            })
            ->get();
    }

    /**
     * Retourne les activites disponibles pour un utilisateur sur ce projet.
     * Filtre les activites masquees par les restrictions de visibilite.
     */
    public function getActivitesDisponiblesPour(User $user)
    {
        $activites = $this->getActivitesDisponibles();

        // Recuperer les activites masquees pour cet utilisateur
        $activitesMasquees = ActivityUserVisibility::activitesMasquees($user->id, $this->id);

        if (empty($activitesMasquees)) {
            return $activites;
        }

        // Filtrer les activites masquees (sauf les systeme qui restent toujours visibles)
        return $activites->filter(function ($activite) use ($activitesMasquees) {
            if ($activite->est_systeme) {
                return true;
            }

            return ! in_array($activite->id, $activitesMasquees);
        })->values();
    }

    // Scopes

    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }

    public function scopeEnCours($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('date_fin')
                ->orWhere('date_fin', '>=', now());
        });
    }
}
