<?php

namespace App\GraphQL\Queries;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class MesNotificationsQuery
{
    /**
     * Recuperer les notifications de l'utilisateur connecte
     */
    public function __invoke($root, array $args): array
    {
        $user = Auth::user();

        $query = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if (!empty($args['nonLuSeulement'])) {
            $query->where('est_lu', false);
        }

        if (!empty($args['limite'])) {
            $query->limit($args['limite']);
        }

        return $query->get()->all();
    }
}
