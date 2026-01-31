<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Restriction de visibilite d'une activite pour un utilisateur sur un projet.
 *
 * Logique : si un enregistrement existe avec est_visible = false,
 * l'activite est masquee pour cet utilisateur sur ce projet.
 */
class ActivityUserVisibility extends Model
{
    protected $table = 'activity_user_visibilities';

    protected $fillable = [
        'activity_id',
        'user_id',
        'project_id',
        'est_visible',
    ];

    protected $casts = [
        'est_visible' => 'boolean',
    ];

    // Relations

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // Methodes statiques

    /**
     * Masquer une activite pour un utilisateur sur un projet.
     */
    public static function masquer(int $activityId, int $userId, int $projectId): self
    {
        return self::updateOrCreate(
            [
                'activity_id' => $activityId,
                'user_id' => $userId,
                'project_id' => $projectId,
            ],
            [
                'est_visible' => false,
            ]
        );
    }

    /**
     * Rendre visible une activite pour un utilisateur sur un projet.
     * Supprime simplement la restriction.
     */
    public static function rendre_visible(int $activityId, int $userId, int $projectId): bool
    {
        return self::where('activity_id', $activityId)
            ->where('user_id', $userId)
            ->where('project_id', $projectId)
            ->delete() > 0;
    }

    /**
     * Recuperer les IDs des activites masquees pour un utilisateur sur un projet.
     */
    public static function activitesMasquees(int $userId, int $projectId): array
    {
        return self::where('user_id', $userId)
            ->where('project_id', $projectId)
            ->where('est_visible', false)
            ->pluck('activity_id')
            ->toArray();
    }
}
