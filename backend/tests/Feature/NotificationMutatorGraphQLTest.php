<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class NotificationMutatorGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $utilisateur;
    private User $autreUtilisateur;
    private Team $team;

    protected function setUp(): void
    {
        parent::setUp();

        $this->team = Team::factory()->create();
        $this->utilisateur = User::factory()->create(['equipe_id' => $this->team->id]);
        $this->autreUtilisateur = User::factory()->create(['equipe_id' => $this->team->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // markNotificationRead
    // ─────────────────────────────────────────────────────────────────────────

    public function test_marquer_notification_lue(): void
    {
        $notification = Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Test',
            'message' => 'Message test',
            'est_lu' => false,
        ]);

        $response = $this->graphqlAsUser('
            mutation MarkRead($id: ID!) {
                markNotificationRead(id: $id) {
                    id
                    estLu
                }
            }
        ', ['id' => (string) $notification->id], $this->utilisateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'markNotificationRead');

        $this->assertEquals($notification->id, $data['id']);
        $this->assertTrue($data['estLu']);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'est_lu' => true,
        ]);
    }

    public function test_marquer_notification_lue_appartenant_a_un_autre_echoue(): void
    {
        $notificationAutre = Notification::create([
            'user_id' => $this->autreUtilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Test autre',
            'message' => 'Message autre',
            'est_lu' => false,
        ]);

        $response = $this->graphqlAsUser('
            mutation MarkRead($id: ID!) {
                markNotificationRead(id: $id) {
                    id
                }
            }
        ', ['id' => (string) $notificationAutre->id], $this->utilisateur);

        // firstOrFail() lève une exception → erreur GraphQL
        $this->assertGraphQLError($response);

        // La notification de l'autre utilisateur n'a pas été marquée lue
        $this->assertDatabaseHas('notifications', [
            'id' => $notificationAutre->id,
            'est_lu' => false,
        ]);
    }

    public function test_marquer_notification_lue_non_authentifie_echoue(): void
    {
        $notification = Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Test',
            'message' => 'Message',
            'est_lu' => false,
        ]);

        $response = $this->graphql('
            mutation MarkRead($id: ID!) {
                markNotificationRead(id: $id) {
                    id
                }
            }
        ', ['id' => (string) $notification->id]);

        $this->assertGraphQLUnauthenticated($response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // markAllNotificationsRead
    // ─────────────────────────────────────────────────────────────────────────

    public function test_marquer_toutes_lues_ne_touche_que_ses_propres_notifications(): void
    {
        // Notifications de l'utilisateur courant
        Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Notif 1',
            'message' => 'Msg',
            'est_lu' => false,
        ]);
        Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Notif 2',
            'message' => 'Msg',
            'est_lu' => false,
        ]);

        // Notification d'un autre utilisateur
        $notifAutre = Notification::create([
            'user_id' => $this->autreUtilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Notif autre',
            'message' => 'Msg',
            'est_lu' => false,
        ]);

        $response = $this->graphqlAsUser('
            mutation {
                markAllNotificationsRead
            }
        ', [], $this->utilisateur);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'markAllNotificationsRead'));

        // Toutes les notifications de l'utilisateur sont lues
        $this->assertEquals(
            0,
            Notification::where('user_id', $this->utilisateur->id)->where('est_lu', false)->count()
        );

        // La notification de l'autre utilisateur n'a pas été touchée
        $this->assertDatabaseHas('notifications', [
            'id' => $notifAutre->id,
            'est_lu' => false,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // deleteNotification
    // ─────────────────────────────────────────────────────────────────────────

    public function test_supprimer_sa_propre_notification(): void
    {
        $notification = Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'A supprimer',
            'message' => 'Msg',
            'est_lu' => false,
        ]);

        $response = $this->graphqlAsUser('
            mutation DeleteNotif($id: ID!) {
                deleteNotification(id: $id)
            }
        ', ['id' => (string) $notification->id], $this->utilisateur);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'deleteNotification'));

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_supprimer_notification_appartenant_a_un_autre_echoue(): void
    {
        $notificationAutre = Notification::create([
            'user_id' => $this->autreUtilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Notif autre',
            'message' => 'Msg',
            'est_lu' => false,
        ]);

        $response = $this->graphqlAsUser('
            mutation DeleteNotif($id: ID!) {
                deleteNotification(id: $id)
            }
        ', ['id' => (string) $notificationAutre->id], $this->utilisateur);

        $this->assertGraphQLError($response);

        // La notification de l'autre existe toujours
        $this->assertDatabaseHas('notifications', ['id' => $notificationAutre->id]);
    }

    public function test_supprimer_notification_non_authentifie_echoue(): void
    {
        $notification = Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Test',
            'message' => 'Msg',
            'est_lu' => false,
        ]);

        $response = $this->graphql('
            mutation DeleteNotif($id: ID!) {
                deleteNotification(id: $id)
            }
        ', ['id' => (string) $notification->id]);

        $this->assertGraphQLUnauthenticated($response);
        $this->assertDatabaseHas('notifications', ['id' => $notification->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // deleteAllNotifications
    // ─────────────────────────────────────────────────────────────────────────

    public function test_supprimer_toutes_ne_touche_que_ses_propres_notifications(): void
    {
        // Notifications de l'utilisateur courant
        Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Notif 1',
            'message' => 'Msg',
            'est_lu' => true,
        ]);
        Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_EXPORT_PRET,
            'titre' => 'Export pret',
            'message' => 'Msg',
            'est_lu' => false,
        ]);

        // Notification d'un autre utilisateur
        $notifAutre = Notification::create([
            'user_id' => $this->autreUtilisateur->id,
            'type' => Notification::TYPE_SYSTEME,
            'titre' => 'Notif autre',
            'message' => 'Msg',
            'est_lu' => false,
        ]);

        $response = $this->graphqlAsUser('
            mutation {
                deleteAllNotifications
            }
        ', [], $this->utilisateur);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'deleteAllNotifications'));

        // Toutes les notifications de l'utilisateur sont supprimées
        $this->assertEquals(
            0,
            Notification::where('user_id', $this->utilisateur->id)->count()
        );

        // La notification de l'autre utilisateur existe toujours
        $this->assertDatabaseHas('notifications', ['id' => $notifAutre->id]);
    }
}
