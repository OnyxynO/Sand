<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        // Apres suppression (soft delete), recalculer est_feuille du parent
        static::deleted(function (Activity $activity) {
            if ($activity->parent_id) {
                // Compter les enfants actifs (sans withTrashed) — le soft-deleted est exclu automatiquement
                $nbEnfants = static::where('parent_id', $activity->parent_id)->count();
                if ($nbEnfants === 0) {
                    // Mettre a jour avec withTrashed pour inclure les parents eux-memes soft-deleted
                    static::withTrashed()->where('id', $activity->parent_id)->update(['est_feuille' => true]);
                }
            }
        });

        // Apres restauration, le parent n'est plus une feuille
        static::restored(function (Activity $activity) {
            if ($activity->parent_id) {
                static::where('id', $activity->parent_id)->update(['est_feuille' => false]);
            }
        });
    }

    protected $fillable = [
        'nom',
        'code',
        'description',
        'parent_id',
        'chemin',
        'ordre',
        'est_feuille',
        'est_systeme',
        'est_actif',
    ];

    protected $casts = [
        'ordre' => 'integer',
        'est_feuille' => 'boolean',
        'est_systeme' => 'boolean',
        'est_actif' => 'boolean',
    ];

    // =========================================================================
    // ACCESSEURS
    // =========================================================================

    /**
     * Niveau calcule depuis le chemin (plus besoin de le stocker).
     * Niveau 0 = racine, 1 = enfant direct, etc.
     */
    public function getNiveauAttribute(): int
    {
        if (empty($this->chemin)) {
            return 0;
        }
        return substr_count($this->chemin, '.');
    }

    // =========================================================================
    // RELATIONS
    // =========================================================================

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'parent_id');
    }

    public function enfants(): HasMany
    {
        return $this->hasMany(Activity::class, 'parent_id')->orderBy('ordre');
    }

    public function projets(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_activities')
            ->withTimestamps();
    }

    public function saisies(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    // =========================================================================
    // REQUETES LTREE
    // =========================================================================

    /**
     * Tous les descendants (enfants, petits-enfants, etc.) via operateur ltree.
     */
    public function descendants(): Builder
    {
        return static::whereRaw('chemin <@ ?::ltree', [$this->chemin])
            ->where('id', '!=', $this->id)
            ->orderBy('chemin');
    }

    /**
     * Tous les ancetres (parent, grand-parent, etc.) via operateur ltree.
     */
    public function ancestors(): Builder
    {
        return static::whereRaw('chemin @> ?::ltree', [$this->chemin])
            ->where('id', '!=', $this->id)
            ->orderBy('chemin');
    }

    /**
     * Attribut ancetres pour compatibilite (retourne une collection).
     */
    public function getAncetresAttribute()
    {
        if (empty($this->chemin)) {
            return collect();
        }

        return $this->ancestors()->get();
    }

    /**
     * Genere le chemin complet (noms) pour affichage.
     */
    public function getCheminCompletAttribute(): string
    {
        $ancetres = $this->ancetres;
        $noms = $ancetres->pluck('nom')->toArray();
        $noms[] = $this->nom;

        return implode(' > ', $noms);
    }

    /**
     * Recalcule le chemin (utile apres modification de parent_id).
     */
    public function recalculerChemin(): void
    {
        if ($this->parent_id) {
            $parent = Activity::find($this->parent_id);
            $this->chemin = $parent->chemin . '.' . $this->id;
        } else {
            $this->chemin = (string) $this->id;
        }
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    public function scopeActif(Builder $query): Builder
    {
        return $query->where('est_actif', true);
    }

    public function scopeFeuille(Builder $query): Builder
    {
        return $query->where('est_feuille', true);
    }

    public function scopeRacine(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    public function scopeSysteme(Builder $query): Builder
    {
        return $query->where('est_systeme', true);
    }

    public function scopeNonSysteme(Builder $query): Builder
    {
        return $query->where('est_systeme', false);
    }

    public function scopeOrdreHierarchique(Builder $query): Builder
    {
        return $query->orderBy('chemin');
    }

    public function scopeTrierParOrdre(Builder $query): Builder
    {
        return $query->orderBy('ordre');
    }
}
