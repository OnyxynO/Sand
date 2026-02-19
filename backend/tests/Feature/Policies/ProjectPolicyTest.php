<?php

declare(strict_types=1);

namespace Tests\Feature\Policies;

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use App\Policies\ProjectPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ProjectPolicy $policy;
    private User $utilisateur;
    private User $moderateur;
    private User $admin;
    private Project $projetModere;
    private Project $autreProjet;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new ProjectPolicy();

        $team = Team::factory()->create();

        $this->utilisateur = User::factory()->create(['equipe_id' => $team->id, 'role' => 'utilisateur']);
        $this->moderateur  = User::factory()->create(['equipe_id' => $team->id, 'role' => 'moderateur']);
        $this->admin       = User::factory()->create(['equipe_id' => $team->id, 'role' => 'admin']);

        $this->projetModere = Project::factory()->create();
        $this->autreProjet  = Project::factory()->create();

        // Le moderateur est assigne au projetModere uniquement
        $this->projetModere->moderateurs()->attach($this->moderateur->id);
    }

    // ─── U-P05 : UTILISATEUR ne peut pas créer un projet ─────────────────────

    public function test_utilisateur_ne_peut_pas_creer_projet(): void
    {
        $this->assertFalse($this->policy->create($this->utilisateur));
    }

    // ─── M-P03 : MODERATEUR peut modifier les activités de son projet ─────────

    public function test_moderateur_peut_gerer_activites_projet_modere(): void
    {
        $this->assertTrue($this->policy->manageActivities($this->moderateur, $this->projetModere));
    }

    public function test_moderateur_ne_peut_pas_gerer_activites_autre_projet(): void
    {
        $this->assertFalse($this->policy->manageActivities($this->moderateur, $this->autreProjet));
    }

    // ─── M-P04 : MODERATEUR ne peut pas supprimer un projet ──────────────────

    public function test_moderateur_ne_peut_pas_supprimer_projet(): void
    {
        $this->assertFalse($this->policy->delete($this->moderateur, $this->projetModere));
    }

    // ─── M-P05 : MODERATEUR ne peut pas gérer les modérateurs d'un projet ────

    public function test_moderateur_ne_peut_pas_gerer_moderateurs(): void
    {
        $this->assertFalse($this->policy->manageModerators($this->moderateur, $this->projetModere));
    }

    // ─── A-P03 : ADMIN peut créer/supprimer un projet ─────────────────────────

    public function test_admin_peut_creer_projet(): void
    {
        $this->assertTrue($this->policy->create($this->admin));
    }

    public function test_admin_peut_supprimer_projet(): void
    {
        $this->assertTrue($this->policy->delete($this->admin, $this->autreProjet));
    }

    public function test_admin_peut_gerer_moderateurs(): void
    {
        $this->assertTrue($this->policy->manageModerators($this->admin, $this->projetModere));
    }

    public function test_admin_peut_modifier_nimporte_quel_projet(): void
    {
        $this->assertTrue($this->policy->update($this->admin, $this->autreProjet));
    }
}
