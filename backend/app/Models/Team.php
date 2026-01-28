<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'code',
        'description',
        'est_actif',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
    ];

    // Relations

    public function membres(): HasMany
    {
        return $this->hasMany(User::class, 'equipe_id');
    }

    // Scopes

    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }
}
