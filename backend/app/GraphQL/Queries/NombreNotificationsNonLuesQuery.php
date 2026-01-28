<?php

namespace App\GraphQL\Queries;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NombreNotificationsNonLuesQuery
{
    /**
     * Compter les notifications non lues de l'utilisateur connecte
     */
    public function __invoke(): int
    {
        $user = Auth::user();

        return Notification::where('user_id', $user->id)
            ->where('est_lu', false)
            ->count();
    }
}
