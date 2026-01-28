<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'cle',
        'valeur',
        'description',
    ];

    protected $casts = [
        'valeur' => 'array',
    ];

    // Cles de configuration connues
    public const CLE_JOURS_RETRO = 'jours_retroactifs';
    public const CLE_PERIODE_SAISIE = 'periode_saisie_defaut';
    public const CLE_RAPPEL_SAISIE = 'rappel_saisie_actif';

    /**
     * Recupere une valeur de configuration (avec cache)
     */
    public static function get(string $cle, mixed $defaut = null): mixed
    {
        return Cache::remember("setting.{$cle}", 3600, function () use ($cle, $defaut) {
            $setting = static::where('cle', $cle)->first();

            return $setting?->valeur ?? $defaut;
        });
    }

    /**
     * Definit une valeur de configuration
     */
    public static function set(string $cle, mixed $valeur, ?string $description = null): void
    {
        static::updateOrCreate(
            ['cle' => $cle],
            [
                'valeur' => $valeur,
                'description' => $description,
            ]
        );

        Cache::forget("setting.{$cle}");
    }

    /**
     * Supprime le cache d'une configuration
     */
    public static function invaliderCache(string $cle): void
    {
        Cache::forget("setting.{$cle}");
    }

    /**
     * Supprime tout le cache des configurations
     */
    public static function invaliderToutLeCache(): void
    {
        $settings = static::all();

        foreach ($settings as $setting) {
            Cache::forget("setting.{$setting->cle}");
        }
    }
}
