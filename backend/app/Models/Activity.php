<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nom',
        'code',
        'description',
        'parent_id',
        'chemin',
        'niveau',
        'ordre',
        'est_feuille',
        'est_systeme',
        'est_actif',
    ];

    protected $casts = [
        'niveau' => 'integer',
        'ordre' => 'integer',
        'est_feuille' => 'boolean',
        'est_systeme' => 'boolean',
        'est_actif' => 'boolean',
    ];

    // Relations

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

    // Methodes pour l'arborescence

    /**
     * Retourne tous les descendants (via le chemin materialise)
     */
    public function descendants()
    {
        return Activity::where('chemin', 'like', $this->chemin . '.%');
    }

    /**
     * Retourne tous les ancetres (via le chemin materialise)
     */
    public function getAncetresAttribute()
    {
        if (empty($this->chemin)) {
            return collect();
        }

        $ids = explode('.', $this->chemin);
        array_pop($ids); // Retirer l'ID actuel

        if (empty($ids)) {
            return collect();
        }

        return Activity::whereIn('id', $ids)->orderByRaw("POSITION(id::text IN ?)", [$this->chemin])->get();
    }

    /**
     * Genere le chemin complet (noms) pour affichage
     */
    public function getCheminCompletAttribute(): string
    {
        $ancetres = $this->ancetres;
        $noms = $ancetres->pluck('nom')->toArray();
        $noms[] = $this->nom;

        return implode(' > ', $noms);
    }

    /**
     * Met a jour le chemin lors de la creation/modification
     */
    public function recalculerChemin(): void
    {
        if ($this->parent_id) {
            $parent = Activity::find($this->parent_id);
            $this->chemin = $parent->chemin . '.' . $this->id;
            $this->niveau = $parent->niveau + 1;
        } else {
            $this->chemin = (string) $this->id;
            $this->niveau = 0;
        }
    }

    // Scopes

    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }

    public function scopeFeuille($query)
    {
        return $query->where('est_feuille', true);
    }

    public function scopeRacine($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeSysteme($query)
    {
        return $query->where('est_systeme', true);
    }

    public function scopeOrdreHierarchique($query)
    {
        return $query->orderBy('chemin');
    }
}
