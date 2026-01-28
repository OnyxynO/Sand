<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'equipe_id',
        'est_actif',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'est_actif' => 'boolean',
        ];
    }

    // Accesseurs

    public function getNomCompletAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    // Relations

    public function equipe(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'equipe_id');
    }

    public function projets(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->withTimestamps();
    }

    public function projetsModeres(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_moderators')
            ->withTimestamps();
    }

    public function saisies(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Helpers de role

    public function estAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function estModerateur(): bool
    {
        return $this->role === 'moderateur' || $this->estAdmin();
    }

    public function estUtilisateur(): bool
    {
        return $this->role === 'utilisateur';
    }

    public function peutModererProjet(Project $projet): bool
    {
        if ($this->estAdmin()) {
            return true;
        }

        return $this->projetsModeres()->where('project_id', $projet->id)->exists();
    }

    // Scopes

    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }

    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }
}
