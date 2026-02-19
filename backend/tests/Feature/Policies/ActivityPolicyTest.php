<?php

declare(strict_types=1);

namespace Tests\Feature\Policies;

use App\Models\Activity;
use App\Models\Team;
use App\Models\User;
use App\Policies\ActivityPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ActivityPolicy $policy;
    private User $utilisateur;
    private User $moderateur;
    private User $admin;
    private Activity $activiteNormale;
    private Activity $activiteSysteme;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new ActivityPolicy();

        $team = Team::factory()->create();

        $this->utilisateur = User::factory()->create(['equipe_id' => $team->id, 'role' => 'utilisateur']);
        $this->moderateur  = User::factory()->create(['equipe_id' => $team->id, 'role' => 'moderateur']);
        $this->admin       = User::factory()->create(['equipe_id' => $team->id, 'role' => 'admin']);

        $this->activiteNormale = Activity::factory()->create([
            'est_feuille' => true,
            'est_systeme' => false,
        ]);

        $this->activiteSysteme = Activity::factory()->create([
            'est_feuille' => true,
            'est_systeme' => true,
        ]);
    }

    // ─── U-P07 : UTILISATEUR ne peut pas créer/modifier une activité ─────────

    public function test_utilisateur_ne_peut_pas_creer_activite(): void
    {
        $this->assertFalse($this->policy->create($this->utilisateur));
    }

    public function test_utilisateur_ne_peut_pas_modifier_activite(): void
    {
        $this->assertFalse($this->policy->update($this->utilisateur, $this->activiteNormale));
    }

    public function test_moderateur_ne_peut_pas_creer_activite(): void
    {
        $this->assertFalse($this->policy->create($this->moderateur));
    }

    // ─── A-P04 : ADMIN peut créer/modifier/supprimer une activité non-système ─

    public function test_admin_peut_creer_activite(): void
    {
        $this->assertTrue($this->policy->create($this->admin));
    }

    public function test_admin_peut_modifier_activite_non_systeme(): void
    {
        $this->assertTrue($this->policy->update($this->admin, $this->activiteNormale));
    }

    public function test_admin_peut_supprimer_activite_non_systeme(): void
    {
        $this->assertTrue($this->policy->delete($this->admin, $this->activiteNormale));
    }

    // ─── A-P05 : ADMIN ne peut pas modifier une activité système ─────────────

    public function test_admin_ne_peut_pas_modifier_activite_systeme(): void
    {
        $this->assertFalse($this->policy->update($this->admin, $this->activiteSysteme));
    }

    public function test_admin_ne_peut_pas_supprimer_activite_systeme(): void
    {
        $this->assertFalse($this->policy->delete($this->admin, $this->activiteSysteme));
    }

    // ─── A-P06 : ADMIN peut réordonner toutes les activités ──────────────────

    public function test_admin_peut_reordonner_activites(): void
    {
        $this->assertTrue($this->policy->reorder($this->admin));
    }

    public function test_utilisateur_ne_peut_pas_reordonner(): void
    {
        $this->assertFalse($this->policy->reorder($this->utilisateur));
    }

    public function test_moderateur_ne_peut_pas_reordonner(): void
    {
        $this->assertFalse($this->policy->reorder($this->moderateur));
    }
}
