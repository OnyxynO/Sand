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
    public const CLE_DELAI_ANNULATION = 'delai_annulation';
    public const CLE_AFFICHER_WEEKENDS = 'afficher_weekends';
    public const CLE_PREMIER_JOUR_SEMAINE = 'premier_jour_semaine';
    public const CLE_ABSENCE_MODE = 'absence_mode';
    public const CLE_ABSENCE_API_URL = 'absence_api_url';
    public const CLE_ABSENCE_API_TOKEN = 'absence_api_token';
    public const CLE_CONNEXION_RAPIDE_ACTIVEE = 'connexion_rapide_activee';
    public const CLE_CONNEXION_RAPIDE_ROLES = 'connexion_rapide_roles';

    // Valeurs par defaut
    public const VALEURS_PAR_DEFAUT = [
        self::CLE_JOURS_RETRO => ['valeur' => 7, 'description' => 'Nombre de jours retroactifs autorises pour la saisie'],
        self::CLE_PERIODE_SAISIE => ['valeur' => 'semaine', 'description' => 'Periode d\'affichage par defaut (jour, semaine, mois)'],
        self::CLE_RAPPEL_SAISIE => ['valeur' => true, 'description' => 'Activer les rappels de saisie'],
        self::CLE_DELAI_ANNULATION => ['valeur' => 5, 'description' => 'Delai d\'annulation en secondes'],
        self::CLE_AFFICHER_WEEKENDS => ['valeur' => false, 'description' => 'Afficher les weekends dans la grille'],
        self::CLE_PREMIER_JOUR_SEMAINE => ['valeur' => 1, 'description' => 'Premier jour de la semaine (0=dimanche, 1=lundi)'],
        self::CLE_ABSENCE_MODE => ['valeur' => 'manuel', 'description' => 'Mode de gestion des absences (manuel ou api)'],
        self::CLE_ABSENCE_API_URL => ['valeur' => '', 'description' => "URL de l'API RH externe"],
        self::CLE_ABSENCE_API_TOKEN => ['valeur' => '', 'description' => "Token d'authentification API RH"],
        self::CLE_CONNEXION_RAPIDE_ACTIVEE => ['valeur' => 0, 'description' => 'Activer la connexion rapide par role (mode demo)'],
        self::CLE_CONNEXION_RAPIDE_ROLES => ['valeur' => [], 'description' => 'Correspondance role => user_id pour la connexion rapide'],
    ];

    /**
     * Reinitialise tous les parametres a leurs valeurs par defaut.
     */
    public static function reinitialiser(): void
    {
        foreach (self::VALEURS_PAR_DEFAUT as $cle => $config) {
            static::set($cle, $config['valeur'], $config['description']);
        }
    }

    /**
     * Recupere une valeur de configuration (avec cache)
     */
    public static function get(string $cle, mixed $defaut = null): mixed
    {
        return Cache::tags('settings')->remember("setting.{$cle}", 3600, function () use ($cle, $defaut) {
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

        Cache::tags('settings')->forget("setting.{$cle}");
    }

    /**
     * Supprime le cache d'une configuration
     */
    public static function invaliderCache(string $cle): void
    {
        Cache::tags('settings')->forget("setting.{$cle}");
    }

    /**
     * Supprime tout le cache des configurations
     */
    public static function invaliderToutLeCache(): void
    {
        Cache::tags('settings')->flush();
    }
}
