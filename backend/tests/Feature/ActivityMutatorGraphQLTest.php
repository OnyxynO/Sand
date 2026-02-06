<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class ActivityMutatorGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;
    private User $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();

        $team = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $team->id]);
        $this->utilisateur = User::factory()->create(['equipe_id' => $team->id]);
    }

    // =========================================================================
    // HELPER : creer une activite via GraphQL (chemin ltree correct)
    // =========================================================================

    /**
     * Cree une activite via la mutation GraphQL et retourne le model rafraichi.
     * Garantit un chemin ltree coherent (via nextval).
     */
    private function creerActiviteViaGraphQL(string $nom, ?string $parentId = null): Activity
    {
        $input = ['nom' => $nom];
        if ($parentId !== null) {
            $input['parentId'] = $parentId;
        }

        $response = $this->graphqlAsUser('
            mutation CreateActivity($input: CreateActivityInput!) {
                createActivity(input: $input) {
                    id
                    nom
                    chemin
                    niveau
                    ordre
                    estFeuille
                }
            }
        ', ['input' => $input], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createActivity');

        return Activity::find($data['id']);
    }

    // =========================================================================
    // CREATION
    // =========================================================================

    public function test_admin_peut_creer_une_activite_racine(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateActivity($input: CreateActivityInput!) {
                createActivity(input: $input) {
                    id
                    nom
                    chemin
                    niveau
                    ordre
                    estFeuille
                    estSysteme
                }
            }
        ', [
            'input' => [
                'nom' => 'Developpement',
                'code' => 'DEV',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createActivity');

        $this->assertEquals('Developpement', $data['nom']);
        $this->assertEquals(0, $data['niveau']); // Racine = niveau 0
        $this->assertTrue($data['estFeuille']); // Nouvelle = feuille
        $this->assertFalse($data['estSysteme']); // Jamais systeme a la creation

        // Le chemin doit etre egal a l'ID (racine)
        $this->assertEquals($data['id'], $data['chemin']);
    }

    public function test_admin_peut_creer_une_activite_enfant(): void
    {
        // Creer le parent
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $this->assertTrue($parent->est_feuille);

        // Creer l'enfant
        $response = $this->graphqlAsUser('
            mutation CreateActivity($input: CreateActivityInput!) {
                createActivity(input: $input) {
                    id
                    nom
                    chemin
                    niveau
                    ordre
                    estFeuille
                    parent { id }
                }
            }
        ', [
            'input' => [
                'nom' => 'Enfant',
                'parentId' => (string) $parent->id,
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createActivity');

        $this->assertEquals(1, $data['niveau']); // Enfant = niveau 1
        $this->assertTrue($data['estFeuille']);
        $this->assertEquals((string) $parent->id, $data['parent']['id']);

        // Le chemin doit etre parent.chemin.enfant.id
        $this->assertEquals("{$parent->chemin}.{$data['id']}", $data['chemin']);

        // Le parent n'est plus une feuille
        $parent->refresh();
        $this->assertFalse($parent->est_feuille);
    }

    public function test_creation_enfant_profond_chemin_correct(): void
    {
        $racine = $this->creerActiviteViaGraphQL('Racine');
        $niveau1 = $this->creerActiviteViaGraphQL('Niveau 1', (string) $racine->id);
        $niveau2 = $this->creerActiviteViaGraphQL('Niveau 2', (string) $niveau1->id);

        // Verifier la profondeur
        $this->assertEquals(0, $racine->niveau);
        $this->assertEquals(1, $niveau1->niveau);
        $this->assertEquals(2, $niveau2->niveau);

        // Verifier les chemins
        $this->assertEquals((string) $racine->id, $racine->chemin);
        $this->assertEquals("{$racine->id}.{$niveau1->id}", $niveau1->chemin);
        $this->assertEquals("{$racine->id}.{$niveau1->id}.{$niveau2->id}", $niveau2->chemin);
    }

    public function test_ordre_auto_incremente_entre_freres(): void
    {
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $enfant1 = $this->creerActiviteViaGraphQL('Enfant 1', (string) $parent->id);
        $enfant2 = $this->creerActiviteViaGraphQL('Enfant 2', (string) $parent->id);
        $enfant3 = $this->creerActiviteViaGraphQL('Enfant 3', (string) $parent->id);

        $this->assertEquals(0, $enfant1->ordre);
        $this->assertEquals(1, $enfant2->ordre);
        $this->assertEquals(2, $enfant3->ordre);
    }

    public function test_utilisateur_non_admin_ne_peut_pas_creer(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateActivity($input: CreateActivityInput!) {
                createActivity(input: $input) { id }
            }
        ', [
            'input' => ['nom' => 'Test'],
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
    }

    public function test_non_authentifie_ne_peut_pas_creer(): void
    {
        $response = $this->graphql('
            mutation CreateActivity($input: CreateActivityInput!) {
                createActivity(input: $input) { id }
            }
        ', [
            'input' => ['nom' => 'Test'],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }

    // =========================================================================
    // MODIFICATION
    // =========================================================================

    public function test_admin_peut_modifier_une_activite(): void
    {
        $activite = $this->creerActiviteViaGraphQL('Ancien nom');

        $response = $this->graphqlAsUser('
            mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
                updateActivity(id: $id, input: $input) {
                    id
                    nom
                    code
                }
            }
        ', [
            'id' => $activite->id,
            'input' => [
                'nom' => 'Nouveau nom',
                'code' => 'NVX',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateActivity');
        $this->assertEquals('Nouveau nom', $data['nom']);
        $this->assertEquals('NVX', $data['code']);
    }

    public function test_modification_activite_systeme_echoue(): void
    {
        $activite = $this->creerActiviteViaGraphQL('Absence');
        // Forcer est_systeme en base (pas possible via mutation)
        Activity::where('id', $activite->id)->update(['est_systeme' => true]);

        $response = $this->graphqlAsUser('
            mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
                updateActivity(id: $id, input: $input) { id }
            }
        ', [
            'id' => $activite->id,
            'input' => ['nom' => 'Tentative'],
        ], $this->admin);

        $this->assertGraphQLError($response);
    }

    // =========================================================================
    // SUPPRESSION
    // =========================================================================

    public function test_admin_peut_supprimer_une_activite(): void
    {
        $activite = $this->creerActiviteViaGraphQL('A supprimer');

        $response = $this->graphqlAsUser('
            mutation DeleteActivity($id: ID!) {
                deleteActivity(id: $id)
            }
        ', ['id' => $activite->id], $this->admin);

        $this->assertGraphQLSuccess($response);
        $this->assertSoftDeleted('activities', ['id' => $activite->id]);
    }

    public function test_suppression_activite_systeme_echoue(): void
    {
        $activite = $this->creerActiviteViaGraphQL('Absence');
        Activity::where('id', $activite->id)->update(['est_systeme' => true]);

        $response = $this->graphqlAsUser('
            mutation DeleteActivity($id: ID!) {
                deleteActivity(id: $id)
            }
        ', ['id' => $activite->id], $this->admin);

        $this->assertGraphQLError($response);
    }

    public function test_suppression_recalcule_est_feuille_parent(): void
    {
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $enfant = $this->creerActiviteViaGraphQL('Enfant unique', (string) $parent->id);

        // Le parent n'est plus feuille
        $parent->refresh();
        $this->assertFalse($parent->est_feuille);

        // Supprimer l'enfant
        $this->graphqlAsUser('
            mutation DeleteActivity($id: ID!) {
                deleteActivity(id: $id)
            }
        ', ['id' => $enfant->id], $this->admin);

        // Le parent redevient feuille
        $parent->refresh();
        $this->assertTrue($parent->est_feuille);
    }

    public function test_suppression_ne_rend_pas_feuille_si_autres_enfants(): void
    {
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $enfant1 = $this->creerActiviteViaGraphQL('Enfant 1', (string) $parent->id);
        $enfant2 = $this->creerActiviteViaGraphQL('Enfant 2', (string) $parent->id);

        // Supprimer seulement enfant1
        $this->graphqlAsUser('
            mutation DeleteActivity($id: ID!) {
                deleteActivity(id: $id)
            }
        ', ['id' => $enfant1->id], $this->admin);

        // Le parent reste non-feuille (enfant2 existe encore)
        $parent->refresh();
        $this->assertFalse($parent->est_feuille);
    }

    // =========================================================================
    // DEPLACEMENT (MOVE) - Logique ltree complexe
    // =========================================================================

    public function test_deplacer_activite_vers_nouveau_parent(): void
    {
        // Arbre : A (racine), B (racine), C (enfant de A)
        $a = $this->creerActiviteViaGraphQL('A');
        $b = $this->creerActiviteViaGraphQL('B');
        $c = $this->creerActiviteViaGraphQL('C', (string) $a->id);

        // Verifier etat initial
        $this->assertEquals("{$a->id}.{$c->id}", $c->chemin);

        // Deplacer C vers B
        $response = $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {
                    id
                    chemin
                    niveau
                    parent { id }
                }
            }
        ', [
            'id' => $c->id,
            'parentId' => (string) $b->id,
            'ordre' => 0,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'moveActivity');

        // Nouveau chemin sous B
        $this->assertEquals("{$b->id}.{$c->id}", $data['chemin']);
        $this->assertEquals(1, $data['niveau']);
        $this->assertEquals((string) $b->id, $data['parent']['id']);

        // A redevient feuille (plus d'enfants)
        $a->refresh();
        $this->assertTrue($a->est_feuille);

        // B n'est plus feuille
        $b->refresh();
        $this->assertFalse($b->est_feuille);
    }

    public function test_deplacer_avec_descendants_met_a_jour_chemins(): void
    {
        // Arbre : A > B > C, D (racine separee)
        $a = $this->creerActiviteViaGraphQL('A');
        $b = $this->creerActiviteViaGraphQL('B', (string) $a->id);
        $c = $this->creerActiviteViaGraphQL('C', (string) $b->id);
        $d = $this->creerActiviteViaGraphQL('D');

        // Chemins initiaux
        $this->assertEquals("{$a->id}.{$b->id}", $b->chemin);
        $this->assertEquals("{$a->id}.{$b->id}.{$c->id}", $c->chemin);

        // Deplacer B (avec son enfant C) vers D
        $response = $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {
                    id
                    chemin
                }
            }
        ', [
            'id' => $b->id,
            'parentId' => (string) $d->id,
            'ordre' => 0,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);

        // B est maintenant sous D
        $b->refresh();
        $this->assertEquals("{$d->id}.{$b->id}", $b->chemin);

        // C (descendant de B) a aussi ete mis a jour
        $c->refresh();
        $this->assertEquals("{$d->id}.{$b->id}.{$c->id}", $c->chemin);
    }

    public function test_deplacer_vers_racine(): void
    {
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $enfant = $this->creerActiviteViaGraphQL('Enfant', (string) $parent->id);

        // Deplacer l'enfant vers la racine (parentId = null)
        $response = $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {
                    id
                    chemin
                    niveau
                }
            }
        ', [
            'id' => $enfant->id,
            'parentId' => null,
            'ordre' => 0,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'moveActivity');

        // Chemin = juste l'ID (racine)
        $this->assertEquals((string) $enfant->id, $data['chemin']);
        $this->assertEquals(0, $data['niveau']);
    }

    public function test_deplacer_vers_descendant_echoue(): void
    {
        // Arbre : A > B > C
        $a = $this->creerActiviteViaGraphQL('A');
        $b = $this->creerActiviteViaGraphQL('B', (string) $a->id);
        $c = $this->creerActiviteViaGraphQL('C', (string) $b->id);

        // Tenter de deplacer A vers C (son petit-enfant) = interdit
        $response = $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) { id }
            }
        ', [
            'id' => $a->id,
            'parentId' => (string) $c->id,
            'ordre' => 0,
        ], $this->admin);

        $this->assertGraphQLError($response);
    }

    public function test_deplacer_activite_systeme_echoue(): void
    {
        $activite = $this->creerActiviteViaGraphQL('Systeme');
        Activity::where('id', $activite->id)->update(['est_systeme' => true]);

        $response = $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) { id }
            }
        ', [
            'id' => $activite->id,
            'parentId' => null,
            'ordre' => 0,
        ], $this->admin);

        $this->assertGraphQLError($response);
    }

    // =========================================================================
    // REORDONNANCEMENT
    // =========================================================================

    public function test_monter_une_activite(): void
    {
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $enfant1 = $this->creerActiviteViaGraphQL('Premier', (string) $parent->id);
        $enfant2 = $this->creerActiviteViaGraphQL('Deuxieme', (string) $parent->id);
        $enfant3 = $this->creerActiviteViaGraphQL('Troisieme', (string) $parent->id);

        $this->assertEquals(0, $enfant1->ordre);
        $this->assertEquals(1, $enfant2->ordre);
        $this->assertEquals(2, $enfant3->ordre);

        // Monter enfant3 en position 0
        $response = $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {
                    id
                    ordre
                }
            }
        ', [
            'id' => $enfant3->id,
            'parentId' => (string) $parent->id,
            'ordre' => 0,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'moveActivity');
        $this->assertEquals(0, $data['ordre']);

        // Les autres sont decales
        $enfant1->refresh();
        $enfant2->refresh();
        $this->assertEquals(1, $enfant1->ordre);
        $this->assertEquals(2, $enfant2->ordre);
    }

    public function test_descendre_une_activite(): void
    {
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $enfant1 = $this->creerActiviteViaGraphQL('Premier', (string) $parent->id);
        $enfant2 = $this->creerActiviteViaGraphQL('Deuxieme', (string) $parent->id);
        $enfant3 = $this->creerActiviteViaGraphQL('Troisieme', (string) $parent->id);

        // Descendre enfant1 en position 2
        $response = $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {
                    id
                    ordre
                }
            }
        ', [
            'id' => $enfant1->id,
            'parentId' => (string) $parent->id,
            'ordre' => 2,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'moveActivity');
        $this->assertEquals(2, $data['ordre']);

        // Les autres sont remontes
        $enfant2->refresh();
        $enfant3->refresh();
        $this->assertEquals(0, $enfant2->ordre);
        $this->assertEquals(1, $enfant3->ordre);
    }

    // =========================================================================
    // RESTAURATION
    // =========================================================================

    public function test_restauration_recalcule_est_feuille_parent(): void
    {
        $parent = $this->creerActiviteViaGraphQL('Parent');
        $enfant = $this->creerActiviteViaGraphQL('Enfant', (string) $parent->id);

        // Supprimer l'enfant
        $this->graphqlAsUser('
            mutation DeleteActivity($id: ID!) { deleteActivity(id: $id) }
        ', ['id' => $enfant->id], $this->admin);

        $parent->refresh();
        $this->assertTrue($parent->est_feuille);

        // Restaurer l'enfant
        $response = $this->graphqlAsUser('
            mutation RestoreActivity($id: ID!) {
                restoreActivity(id: $id) {
                    id
                    nom
                }
            }
        ', ['id' => $enfant->id], $this->admin);

        $this->assertGraphQLSuccess($response);

        // Le parent n'est plus feuille
        $parent->refresh();
        $this->assertFalse($parent->est_feuille);
    }

    // =========================================================================
    // INVARIANTS LTREE
    // =========================================================================

    public function test_invariant_chemin_coherent_apres_operations_multiples(): void
    {
        // Construire un arbre complexe
        // R1 > A > B
        // R2 > C
        $r1 = $this->creerActiviteViaGraphQL('R1');
        $a = $this->creerActiviteViaGraphQL('A', (string) $r1->id);
        $b = $this->creerActiviteViaGraphQL('B', (string) $a->id);
        $r2 = $this->creerActiviteViaGraphQL('R2');
        $c = $this->creerActiviteViaGraphQL('C', (string) $r2->id);

        // Deplacer A (avec B) sous R2
        $this->graphqlAsUser('
            mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
                moveActivity(id: $id, parentId: $parentId, ordre: $ordre) { id }
            }
        ', [
            'id' => $a->id,
            'parentId' => (string) $r2->id,
            'ordre' => 1,
        ], $this->admin);

        // Verifier tous les invariants
        $r1->refresh();
        $a->refresh();
        $b->refresh();
        $r2->refresh();
        $c->refresh();

        // INVARIANT_1 : chemin = parent.chemin.id (ou id si racine)
        $this->assertEquals((string) $r1->id, $r1->chemin);
        $this->assertEquals((string) $r2->id, $r2->chemin);
        $this->assertEquals("{$r2->id}.{$a->id}", $a->chemin);
        $this->assertEquals("{$r2->id}.{$a->id}.{$b->id}", $b->chemin);
        $this->assertEquals("{$r2->id}.{$c->id}", $c->chemin);

        // INVARIANT_2 : niveau = nombre de "." dans chemin
        $this->assertEquals(0, $r1->niveau);
        $this->assertEquals(0, $r2->niveau);
        $this->assertEquals(1, $a->niveau);
        $this->assertEquals(2, $b->niveau);
        $this->assertEquals(1, $c->niveau);

        // INVARIANT_3 : est_feuille = pas d'enfants
        $this->assertTrue($r1->est_feuille); // R1 n'a plus d'enfants
        $this->assertFalse($r2->est_feuille); // R2 a C et A
        $this->assertFalse($a->est_feuille); // A a B
        $this->assertTrue($b->est_feuille); // B est feuille
        $this->assertTrue($c->est_feuille); // C est feuille
    }

    public function test_requete_descendants_ltree(): void
    {
        // Arbre : R > A > B, R > C
        $r = $this->creerActiviteViaGraphQL('Racine');
        $a = $this->creerActiviteViaGraphQL('A', (string) $r->id);
        $b = $this->creerActiviteViaGraphQL('B', (string) $a->id);
        $c = $this->creerActiviteViaGraphQL('C', (string) $r->id);

        // Descendants de R = A, B, C
        $descendants = $r->descendants()->pluck('id')->toArray();
        $this->assertCount(3, $descendants);
        $this->assertContains($a->id, $descendants);
        $this->assertContains($b->id, $descendants);
        $this->assertContains($c->id, $descendants);

        // Descendants de A = B seulement
        $descendantsA = $a->descendants()->pluck('id')->toArray();
        $this->assertCount(1, $descendantsA);
        $this->assertContains($b->id, $descendantsA);

        // B n'a pas de descendants
        $this->assertEquals(0, $b->descendants()->count());
    }

    public function test_requete_ancestors_ltree(): void
    {
        // Arbre : R > A > B
        $r = $this->creerActiviteViaGraphQL('Racine');
        $a = $this->creerActiviteViaGraphQL('A', (string) $r->id);
        $b = $this->creerActiviteViaGraphQL('B', (string) $a->id);

        // Ancetres de B = A, R
        $ancetres = $b->ancestors()->pluck('id')->toArray();
        $this->assertCount(2, $ancetres);
        $this->assertContains($r->id, $ancetres);
        $this->assertContains($a->id, $ancetres);

        // Ancetres de A = R
        $ancetresA = $a->ancestors()->pluck('id')->toArray();
        $this->assertCount(1, $ancetresA);
        $this->assertContains($r->id, $ancetresA);

        // R n'a pas d'ancetres
        $this->assertEquals(0, $r->ancestors()->count());
    }
}
