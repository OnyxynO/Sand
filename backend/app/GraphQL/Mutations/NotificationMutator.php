<?php

namespace App\GraphQL\Mutations;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationMutator
{
    /**
     * Marquer une notification comme lue
     */
    public function markRead($root, array $args): Notification
    {
        $user = Auth::user();
        $notification = Notification::where('id', $args['id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->marquerCommeLu();

        return $notification;
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllRead(): bool
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('est_lu', false)
            ->update([
                'est_lu' => true,
                'lu_le' => now(),
            ]);

        return true;
    }

    /**
     * Supprimer une notification
     */
    public function delete($root, array $args): bool
    {
        $user = Auth::user();
        $notification = Notification::where('id', $args['id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->delete();

        return true;
    }

    /**
     * Supprimer toutes les notifications
     */
    public function deleteAll(): bool
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)->delete();

        return true;
    }
}
