<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginRapideControllerTest extends TestCase
{
    use RefreshDatabase;

    private Team $team;
    private User $userAdmin;
    private User $userModerateur;
    private User $userUtilisateur;

    /** @var list<string> Clés env à nettoyer après chaque test */
    private array $envVarsANettoyer = [];

    protected function tearDown(): void
    {
        foreach ($this->envVarsANettoyer as $key) {
            if ($key === 'CONNEXION_RAPIDE_DISABLED') {
                config(['app.connexion_rapide_disabled' => false]);
            }
        }
        $this->envVarsANettoyer = [];

        parent::tearDown();
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->team = Team::factory()->create();

        $this->userAdmin = User::factory()->admin()->create([
            'equipe_id' => $this->team->id,
            'est_actif' => true,
        ]);
        $this->userModerateur = User::factory()->moderateur()->create([
            'equipe_id' => $this->team->id,
            'est_actif' => true,
        ]);
        $this->userUtilisateur = User::factory()->create([
            'equipe_id' => $this->team->id,
            'est_actif' => true,
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /api/config/publique
    // -------------------------------------------------------------------------

    public function test_config_publique_retourne_desactivee_par_defaut(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 0);

        $response = $this->getJson('/api/config/publique');

        $response->assertOk()
            ->assertJson([
                'connexion_rapide' => ['activee' => false, 'roles' => []],
            ]);
    }

    public function test_config_publique_retourne_les_roles_actifs(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ROLES, [
            'admin'      => $this->userAdmin->id,
            'moderateur' => $this->userModerateur->id,
            'utilisateur' => null, // non configuré
        ]);

        $response = $this->getJson('/api/config/publique');

        $response->assertOk()
            ->assertJson(['connexion_rapide' => ['activee' => true]])
            ->assertJsonCount(2, 'connexion_rapide.roles');

        // Aucun user_id dans la réponse
        $response->assertJsonMissing(['id' => $this->userAdmin->id]);
    }

    public function test_config_publique_desactivee_par_env(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);

        // Simule CONNEXION_RAPIDE_DISABLED=true via la config env de test
        $response = $this->withEnvironmentVariable('CONNEXION_RAPIDE_DISABLED', 'true')
            ->getJson('/api/config/publique');

        $response->assertOk()
            ->assertJson(['connexion_rapide' => ['activee' => false, 'roles' => []]]);
    }

    // -------------------------------------------------------------------------
    // POST /api/login-rapide
    // -------------------------------------------------------------------------

    public function test_login_rapide_echoue_si_feature_desactivee(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 0);

        $response = $this->postJson('/api/login-rapide', ['role' => 'admin']);

        $response->assertStatus(403);
    }

    public function test_login_rapide_echoue_si_env_disabled(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ROLES, ['admin' => $this->userAdmin->id]);

        $response = $this->withEnvironmentVariable('CONNEXION_RAPIDE_DISABLED', 'true')
            ->postJson('/api/login-rapide', ['role' => 'admin']);

        $response->assertStatus(403);
    }

    public function test_login_rapide_echoue_si_role_invalide(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);

        $response = $this->postJson('/api/login-rapide', ['role' => 'superadmin']);

        $response->assertStatus(422);
    }

    public function test_login_rapide_echoue_si_role_non_configure(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ROLES, ['admin' => $this->userAdmin->id]);

        // 'utilisateur' n'est pas dans les roles configurés
        $response = $this->postJson('/api/login-rapide', ['role' => 'utilisateur']);

        $response->assertStatus(422);
    }

    public function test_login_rapide_echoue_si_user_id_inexistant(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ROLES, ['admin' => 999999]);

        $response = $this->postJson('/api/login-rapide', ['role' => 'admin']);

        $response->assertStatus(422);
    }

    public function test_login_rapide_echoue_si_user_inactif(): void
    {
        $userInactif = User::factory()->admin()->create([
            'equipe_id' => $this->team->id,
            'est_actif'  => false,
        ]);

        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ROLES, ['admin' => $userInactif->id]);

        $response = $this->postJson('/api/login-rapide', ['role' => 'admin']);

        $response->assertStatus(422);
    }

    public function test_login_rapide_cree_une_session_et_retourne_le_user(): void
    {
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 1);
        Setting::set(Setting::CLE_CONNEXION_RAPIDE_ROLES, ['admin' => $this->userAdmin->id]);

        $response = $this->postJson('/api/login-rapide', ['role' => 'admin']);

        $response->assertOk()
            ->assertJsonPath('user.id', $this->userAdmin->id)
            ->assertJsonPath('user.email', $this->userAdmin->email)
            ->assertJsonPath('user.role', $this->userAdmin->role);

        // Vérifier que le password ne se retrouve pas dans la réponse
        $response->assertJsonMissing(['password']);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Active la désactivation d'urgence via config() (compatible config:cache).
     * Le controller lit config('app.connexion_rapide_disabled'), pas env() directement.
     */
    private function withEnvironmentVariable(string $key, string $value): static
    {
        // Pour CONNEXION_RAPIDE_DISABLED, on passe par config() qui est toujours lisible
        if ($key === 'CONNEXION_RAPIDE_DISABLED') {
            config(['app.connexion_rapide_disabled' => (bool) $value]);
            $this->envVarsANettoyer[] = $key;
        }

        return $this;
    }
}
