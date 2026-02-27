<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\Team;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class AuthGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    protected function setUp(): void
    {
        parent::setUp();

        // Creer une equipe pour les utilisateurs (sans forcer l'ID pour PostgreSQL)
        Team::factory()->create(['nom' => 'Test', 'code' => 'TEST']);
    }

    public function test_login_avec_identifiants_valides(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'est_actif' => true,
        ]);

        $response = $this->graphql('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                    }
                }
            }
        ', [
            'input' => [
                'email' => 'test@example.com',
                'password' => 'password',
            ],
        ]);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'login');

        $this->assertEquals($user->id, $data['user']['id']);
        $this->assertEquals('test@example.com', $data['user']['email']);
    }

    public function test_login_avec_identifiants_invalides(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->graphql('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user { id }
                }
            }
        ', [
            'input' => [
                'email' => 'test@example.com',
                'password' => 'wrong_password',
            ],
        ]);

        $this->assertGraphQLError($response);
    }

    public function test_login_avec_compte_desactive(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'est_actif' => false,
        ]);

        $response = $this->graphql('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user { id }
                }
            }
        ', [
            'input' => [
                'email' => 'test@example.com',
                'password' => 'password',
            ],
        ]);

        $this->assertGraphQLError($response);
    }

    public function test_me_retourne_utilisateur_connecte(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('{ me { id nom prenom email } }', [], $user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'me');

        $this->assertEquals($user->id, $data['id']);
        $this->assertEquals($user->nom, $data['nom']);
        $this->assertEquals($user->email, $data['email']);
    }

    public function test_me_retourne_null_sans_authentification(): void
    {
        $response = $this->graphql('{ me { id } }');

        $response->assertOk();
        $this->assertNull($this->getGraphQLData($response, 'me'));
    }

    public function test_logout_fonctionne(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('mutation { logout }', [], $user);

        // Logout doit retourner true meme si pas de token actif
        $response->assertOk();
        $data = $response->json('data.logout');
        $this->assertTrue($data);
    }

    // -------------------------------------------------------------------------
    // Mot de passe oublie
    // -------------------------------------------------------------------------

    public function test_demander_reinitialisation_mdp_email_inexistant_retourne_true(): void
    {
        Notification::fake();

        $response = $this->graphql('
            mutation DemanderReinit($input: DemanderReinitialisationMdpInput!) {
                demanderReinitialisationMdp(input: $input)
            }
        ', ['input' => ['email' => 'inconnu@example.com']]);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($response->json('data.demanderReinitialisationMdp'));
        // Aucune notification envoyee (email inexistant)
        Notification::assertNothingSent();
    }

    public function test_demander_reinitialisation_mdp_email_existant_envoie_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email'    => 'test@example.com',
            'est_actif' => true,
        ]);

        $response = $this->graphql('
            mutation DemanderReinit($input: DemanderReinitialisationMdpInput!) {
                demanderReinitialisationMdp(input: $input)
            }
        ', ['input' => ['email' => 'test@example.com']]);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($response->json('data.demanderReinitialisationMdp'));
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_demander_reinitialisation_mdp_compte_inactif_nenvoie_pas(): void
    {
        Notification::fake();

        User::factory()->create([
            'email'    => 'inactif@example.com',
            'est_actif' => false,
        ]);

        $response = $this->graphql('
            mutation DemanderReinit($input: DemanderReinitialisationMdpInput!) {
                demanderReinitialisationMdp(input: $input)
            }
        ', ['input' => ['email' => 'inactif@example.com']]);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($response->json('data.demanderReinitialisationMdp'));
        // Compte inactif : aucune notification envoyee
        Notification::assertNothingSent();
    }

    public function test_reinitialiser_mdp_token_valide(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        $response = $this->graphql('
            mutation ReinitMdp($input: ReinitialisationMdpInput!) {
                reinitialiserMdp(input: $input)
            }
        ', [
            'input' => [
                'token'                 => $token,
                'email'                 => 'test@example.com',
                'password'              => 'nouveau_mdp_ok',
                'password_confirmation' => 'nouveau_mdp_ok',
            ],
        ]);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($response->json('data.reinitialiserMdp'));

        // Le mot de passe est bien change
        $user->refresh();
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('nouveau_mdp_ok', $user->password));
    }

    public function test_reinitialiser_mdp_token_invalide_retourne_erreur(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->graphql('
            mutation ReinitMdp($input: ReinitialisationMdpInput!) {
                reinitialiserMdp(input: $input)
            }
        ', [
            'input' => [
                'token'                 => 'token-bidon',
                'email'                 => 'test@example.com',
                'password'              => 'nouveau_mdp_ok',
                'password_confirmation' => 'nouveau_mdp_ok',
            ],
        ]);

        $this->assertGraphQLError($response);
    }

    public function test_reinitialiser_mdp_confirmation_differente_retourne_erreur(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        $response = $this->graphql('
            mutation ReinitMdp($input: ReinitialisationMdpInput!) {
                reinitialiserMdp(input: $input)
            }
        ', [
            'input' => [
                'token'                 => $token,
                'email'                 => 'test@example.com',
                'password'              => 'nouveau_mdp_ok',
                'password_confirmation' => 'pas_pareil',
            ],
        ]);

        $this->assertGraphQLError($response);
    }
}
