// Tests E2E — Export CSV (rôle ADMIN)
// Couvre : création, statut, téléchargement, notifications, suppression

import { test, expect } from '@playwright/test';

// ─── helpers ──────────────────────────────────────────────────────────────────

async function allerSurExport(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.goto('/export');
  await expect(page.getByRole('heading', { name: 'Export CSV' })).toBeVisible({ timeout: 8000 });
}

async function lancerExport(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.getByRole('button', { name: 'Exporter en CSV' }).click();
}

async function attendreDisponible(page: Parameters<Parameters<typeof test>[1]>[0]) {
  // Le worker Redis traite le job, l'UI polle toutes les 10 s → jusqu'à 30 s d'attente
  // .first() car il peut y avoir plusieurs exports "Disponible" dans la liste
  await expect(page.getByText('Disponible').first()).toBeVisible({ timeout: 30000 });
}

async function supprimerTousLesExports(page: Parameters<Parameters<typeof test>[1]>[0]) {
  // Stratégie : navigation fraîche avant chaque suppression pour éviter les interférences
  // du pollInterval Apollo (10 s). Chaque page.goto() remet le timer de poll à zéro,
  // garantissant que le refetch après mutation est la dernière réponse reçue.
  while (true) {
    await page.goto('/export');
    // Attendre que les données soient chargées (skeleton → tableau ou état vide)
    await expect(
      page.getByText('Historique des exports').or(page.getByText('Aucun export pour le moment')),
    ).toBeVisible({ timeout: 20000 });

    const btn = page.locator('button[title="Supprimer definitivement"]').first();
    if (!(await btn.isVisible())) break;

    await btn.click();
    // Attendre que la mutation se termine avant la prochaine navigation
    await page.waitForTimeout(600);
  }
}

// ─── tests ────────────────────────────────────────────────────────────────────

test.describe('Export CSV', () => {
  // Exécution séquentielle : EX-07 efface les données, il doit courir en dernier
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await allerSurExport(page);
  });

  // EX-01
  test('EX-01 : page affiche le formulaire complet', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Filtres' })).toBeVisible();
    await expect(page.getByLabel('Date debut')).toBeVisible();
    await expect(page.getByLabel('Date fin')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exporter en CSV' })).toBeVisible();
    await expect(page.getByText('Comment ca marche ?')).toBeVisible();
  });

  // EX-02
  test('EX-02 : ligne apparait immediatement avec statut En cours', async ({ page }) => {
    await lancerExport(page);

    // Feedback optimiste : la liste doit être visible immédiatement (avant le premier poll).
    // Le statut peut être "En cours" ou "Disponible" si le worker est très rapide.
    // On vérifie la présence de l'en-tête et d'au moins une ligne dans le tableau.
    await expect(page.getByText('Historique des exports')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 4000 });
  });

  // EX-03
  test('EX-03 : export passe au statut Disponible apres traitement', async ({ page }) => {
    await lancerExport(page);
    await attendreDisponible(page);
  });

  // EX-04
  test('EX-04 : telechargement ne retourne pas une 404', async ({ page }) => {
    await lancerExport(page);
    await attendreDisponible(page);

    // Intercepter la réponse HTTP du lien de téléchargement
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/exports/') && r.url().includes('/download'),
      { timeout: 10000 },
    );
    // .first() car les tests précédents ont laissé des exports dans la liste
    await page.getByRole('link', { name: 'Telecharger' }).first().click();
    const response = await responsePromise;

    expect(response.status()).not.toBe(404);
    expect(response.status()).toBeLessThan(400);
  });

  // EX-05
  test('EX-05 : notification Export pret apparait dans le panneau', async ({ page }) => {
    await lancerExport(page);
    await attendreDisponible(page);

    // Ouvrir le panneau de notifications (requête fraîche déclenchée à l'ouverture)
    await page.getByRole('button', { name: /Notifications/ }).click();
    await expect(page.getByText('Notifications')).toBeVisible({ timeout: 3000 });

    // La notification créée par le job doit être présente
    // .first() car les tests précédents ont laissé des notifications dans le panneau
    await expect(page.getByText('Export pret').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Votre export CSV est pret/).first()).toBeVisible();
  });

  // EX-06
  test('EX-06 : supprimer une notification dans le panneau', async ({ page }) => {
    await lancerExport(page);
    await attendreDisponible(page);

    // Attendre la réponse réseau AVANT de compter (cache-and-network renvoie cache puis réseau)
    const notifResponsePromise = page.waitForResponse(
      (r) => r.url().includes('/graphql') && r.status() === 200,
      { timeout: 10000 },
    );
    await page.getByRole('button', { name: /Notifications/ }).click();
    await notifResponsePromise;

    await expect(page.getByText('Export pret').first()).toBeVisible({ timeout: 5000 });
    const countAvant = await page.getByText('Export pret').count();

    // Cliquer sur la notification → la marque lue ET navigue vers /export (ferme le panneau).
    // C'est le comportement voulu : NotificationItem.handleClick navigue pour export_pret.
    await page.getByText('Export pret').first().click();

    // On est maintenant sur /export, panneau fermé.
    // Rouvrir le panneau : la notification est lue → bouton supprimer visible.
    const notifResponsePromise2 = page.waitForResponse(
      (r) => r.url().includes('/graphql') && r.status() === 200,
      { timeout: 10000 },
    );
    await page.getByRole('button', { name: /Notifications/ }).click();
    await notifResponsePromise2;

    const btnSupprimer = page.locator('[title="Supprimer"]').first();
    await expect(btnSupprimer).toBeVisible({ timeout: 5000 });
    await btnSupprimer.click();

    // Une notification de moins dans le panneau
    await expect(page.getByText('Export pret')).toHaveCount(countAvant - 1, { timeout: 5000 });
  });

  // EX-07 — timeout étendu : supprimerTousLesExports navigue une fois par export
  // (~1,5 s × N exports accumulés sur plusieurs runs)
  test('EX-07 : supprimer le dernier export affiche l etat vide', async ({ page }) => {
    test.setTimeout(180000);
    // Partir d'un état propre : supprimer tous les exports existants
    await supprimerTousLesExports(page);

    // Créer un seul export
    await lancerExport(page);
    await expect(page.getByText('Historique des exports')).toBeVisible({ timeout: 5000 });

    // Le supprimer
    await page.locator('button[title="Supprimer definitivement"]').first().click();

    // L'état vide doit s'afficher (et non le tableau ou une erreur)
    await expect(page.getByText('Aucun export pour le moment')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Historique des exports')).not.toBeVisible();
  });
});
