<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\ExportTimeEntriesJob;
use App\Models\Activity;
use App\Models\Export;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExportJobTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Project $projet;
    private Activity $activite;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $team = Team::factory()->create(['nom' => 'Equipe Test', 'code' => 'EQT']);
        $this->admin = User::factory()->admin()->create([
            'equipe_id' => $team->id,
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'matricule' => 'MAT001',
        ]);
        $this->projet = Project::factory()->create(['nom' => 'Projet Alpha', 'code' => 'ALPHA']);
        $this->activite = Activity::factory()->create(['nom' => 'Developpement']);
    }

    public function test_job_genere_csv_et_termine_export(): void
    {
        // Creer des saisies
        TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
            'date' => '2026-01-15',
            'duree' => 0.5,
            'commentaire' => 'Test export',
        ]);

        TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
            'date' => '2026-01-16',
            'duree' => 1.0,
        ]);

        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
            'filtres' => [
                'date_debut' => '2026-01-01',
                'date_fin' => '2026-01-31',
            ],
        ]);

        $job = new ExportTimeEntriesJob($export->id);
        $job->handle();

        $export->refresh();

        $this->assertEquals(Export::STATUT_TERMINE, $export->statut);
        $this->assertNotNull($export->chemin_fichier);
        $this->assertNotNull($export->nom_fichier);
        $this->assertNotNull($export->expire_le);
        $this->assertTrue($export->expire_le->isFuture());

        // Verifier que le fichier existe
        Storage::disk('local')->assertExists($export->chemin_fichier);

        // Verifier le contenu CSV
        $contenu = Storage::disk('local')->get($export->chemin_fichier);
        // Supprimer BOM pour le test
        $contenu = ltrim($contenu, "\xEF\xBB\xBF");
        $lignes = explode("\r\n", $contenu);

        // En-tete + 2 lignes de donnees
        $this->assertCount(3, array_filter($lignes));
        $this->assertStringContainsString('Utilisateur', $lignes[0]);
        $this->assertStringContainsString('Dupont', $contenu);
        $this->assertStringContainsString('ALPHA', $contenu);
        $this->assertStringContainsString('Developpement', $contenu);
    }

    public function test_job_cree_notification_export_pret(): void
    {
        TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
            'date' => '2026-01-15',
            'duree' => 0.5,
        ]);

        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
            'filtres' => [
                'date_debut' => '2026-01-01',
                'date_fin' => '2026-01-31',
            ],
        ]);

        $job = new ExportTimeEntriesJob($export->id);
        $job->handle();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'type' => Notification::TYPE_EXPORT_PRET,
        ]);

        $notif = Notification::where('user_id', $this->admin->id)
            ->where('type', Notification::TYPE_EXPORT_PRET)
            ->first();

        $this->assertEquals($export->id, $notif->donnees['export_id']);
    }

    public function test_job_filtre_par_projet(): void
    {
        $autrProjet = Project::factory()->create();

        TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
            'date' => '2026-01-15',
            'duree' => 0.5,
        ]);

        TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $autrProjet->id,
            'activity_id' => $this->activite->id,
            'date' => '2026-01-15',
            'duree' => 0.3,
        ]);

        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
            'filtres' => [
                'date_debut' => '2026-01-01',
                'date_fin' => '2026-01-31',
                'project_id' => $this->projet->id,
            ],
        ]);

        $job = new ExportTimeEntriesJob($export->id);
        $job->handle();

        $contenu = Storage::disk('local')->get($export->fresh()->chemin_fichier);
        $contenu = ltrim($contenu, "\xEF\xBB\xBF");
        $lignes = array_filter(explode("\r\n", $contenu));

        // En-tete + 1 saisie (seul le bon projet)
        $this->assertCount(2, $lignes);
    }

    public function test_job_filtre_par_equipe(): void
    {
        $autreEquipe = Team::factory()->create();
        $autreUser = User::factory()->create(['equipe_id' => $autreEquipe->id]);

        TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
            'date' => '2026-01-15',
            'duree' => 0.5,
        ]);

        TimeEntry::factory()->create([
            'user_id' => $autreUser->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
            'date' => '2026-01-15',
            'duree' => 0.3,
        ]);

        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
            'filtres' => [
                'date_debut' => '2026-01-01',
                'date_fin' => '2026-01-31',
                'team_id' => $this->admin->equipe_id,
            ],
        ]);

        $job = new ExportTimeEntriesJob($export->id);
        $job->handle();

        $contenu = Storage::disk('local')->get($export->fresh()->chemin_fichier);
        $contenu = ltrim($contenu, "\xEF\xBB\xBF");
        $lignes = array_filter(explode("\r\n", $contenu));

        // En-tete + 1 saisie (seule celle de l'equipe)
        $this->assertCount(2, $lignes);
    }

    public function test_job_export_vide_genere_csv_avec_entete_seul(): void
    {
        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
            'filtres' => [
                'date_debut' => '2026-06-01',
                'date_fin' => '2026-06-30',
            ],
        ]);

        $job = new ExportTimeEntriesJob($export->id);
        $job->handle();

        $export->refresh();
        $this->assertEquals(Export::STATUT_TERMINE, $export->statut);

        $contenu = Storage::disk('local')->get($export->chemin_fichier);
        $contenu = ltrim($contenu, "\xEF\xBB\xBF");
        $lignes = array_filter(explode("\r\n", $contenu));

        // Seulement l'en-tete
        $this->assertCount(1, $lignes);
        $this->assertStringContainsString('Utilisateur', $lignes[0]);
    }

    public function test_csv_contient_bom_utf8(): void
    {
        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
            'filtres' => [
                'date_debut' => '2026-01-01',
                'date_fin' => '2026-01-31',
            ],
        ]);

        $job = new ExportTimeEntriesJob($export->id);
        $job->handle();

        $contenu = Storage::disk('local')->get($export->fresh()->chemin_fichier);
        $this->assertStringStartsWith("\xEF\xBB\xBF", $contenu);
    }
}
