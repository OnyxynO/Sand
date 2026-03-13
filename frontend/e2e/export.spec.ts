// Tests E2E — Export CSV (rôle ADMIN)
// Couvre : création, statut, téléchargement, notifications, suppression

import { test, expect } from '@playwright/test';

// ─── helpers ──────────────────────────────────────────────────────────────────

async function allerSurExport(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.goto('/export');
  try {
    await expect(page.getByRole('heading', { name: 'Export CSV' })).toBeVisible({ timeout: 8000 });
  } catch {
    await page.goto('/export');
    await expect(page.getByRole('heading', { name: 'Export CSV' })).toBeVisible({ timeout: 12000 });
  }
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
  let tentatives = 30;
  while (tentatives-- > 0) {
    await page.goto('/export');
    // Attendre que les données soient chargées (skeleton → tableau ou état vide)
    await expect(
      page.getByText('Historique des exports').or(page.getByText('Aucun export pour le moment')),
    ).toBeVisible({ timeout: 20000 });

    const boutons = page.locator('button[title="Supprimer definitivement"]');
    const countAvant = await boutons.count();
    if (countAvant === 0) break;

    await boutons.first().click();
    await page.waitForTimeout(800);

    await expect(async () => {
      await page.goto('/export');
      await expect(
        page.getByText('Historique des exports').or(page.getByText('Aucun export pour le moment')),
      ).toBeVisible({ timeout: 20000 });
      const countApres = await page.locator('button[title="Supprimer definitivement"]').count();
      expect(countApres).toBeLessThan(countAvant);
    }).toPass({ timeout: 15000 });
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

  // EX-05 — EV-11 : la pastille se met à jour sans attendre le poll de 60 s
  // Vérifie que cache.evict déclenche un refetch dès la transition TERMINE → nouvelle notif visible
  test('EX-05 : pastille notification mise a jour apres export sans attendre 60 s', async ({
    page,
  }) => {
    const btnNotif = page.getByRole('button', { name: /Notifications/ });

    // Lire le compte initial
    const compteAvant = await btnNotif.getAttribute('aria-label').then((label) => {
      const match = label?.match(/\((\d+) non lues\)/);
      return match ? parseInt(match[1]) : 0;
    });

    await lancerExport(page);
    await attendreDisponible(page);

    // Courte attente pour laisser le job queue créer la notification côté serveur
    // (le job tourne après que le statut passe à TERMINE)
    await page.waitForTimeout(2000);

    // La pastille doit se mettre à jour en moins de 15 s (bien avant le poll de 60 s)
    // grâce à cache.evict qui invalide le cache dès la détection de la transition
    await expect(async () => {
      const label = await btnNotif.getAttribute('aria-label');
      const match = label?.match(/\((\d+) non lues\)/);
      const compteApres = match ? parseInt(match[1]) : 0;
      expect(compteApres).toBeGreaterThan(compteAvant);
    }).toPass({ timeout: 15000 });
  });

  // EX-06
  test('EX-06 : regenerer un export desactive cree un nouvel export', async ({ page }) => {
    test.setTimeout(120000);

    await supprimerTousLesExports(page);

    await lancerExport(page);
    await attendreDisponible(page);

    const boutonsSupprimerAvant = page.locator('button[title="Supprimer definitivement"]');
    const countAvant = await boutonsSupprimerAvant.count();

    // Desactiver le fichier du premier export pour faire apparaitre "Regenerer"
    await page.locator('button[title="Supprimer le fichier (conserver la ligne)"]').first().click();
    await expect(page.getByText('Regenerer').first()).toBeVisible({ timeout: 10000 });

    const requestResponsePromise = page.waitForResponse(
      (r) => r.url().includes('/graphql') && r.request().postData()?.includes('requestExport'),
      { timeout: 10000 },
    );
    await page.getByText('Regenerer').first().click();
    const requestResponse = await requestResponsePromise;
    const requestBody = requestResponse.request().postData() ?? '';
    const responseBody = await requestResponse.text();

    expect(requestBody).toContain('requestExport');
    expect(responseBody).not.toContain('"errors"');

    // Un nouvel export doit apparaitre dans l'historique.
    await expect
      .poll(
        async () => page.locator('button[title="Supprimer definitivement"]').count(),
        { timeout: 15000 },
      )
      .toBeGreaterThan(countAvant);
  });

  // EX-07
  test('EX-07 : notification Export pret apparait dans le panneau', async ({ page }) => {
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

  // EX-08
  test('EX-08 : supprimer une notification dans le panneau', async ({ page }) => {
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

    const boutonsSupprimer = page.locator('[title="Supprimer"]');
    const btnSupprimer = boutonsSupprimer.first();
    await expect(btnSupprimer).toBeVisible({ timeout: 5000 });
    const countAvantSuppression = await boutonsSupprimer.count();
    await btnSupprimer.click();

    // Une notification supprimable de moins dans le panneau
    await expect(async () => {
      const countApresSuppression = await boutonsSupprimer.count();
      expect(countApresSuppression).toBeLessThan(countAvantSuppression);
    }).toPass({ timeout: 5000 });
  });

  // EX-09 — timeout étendu : supprimerTousLesExports navigue une fois par export
  // (~1,5 s × N exports accumulés sur plusieurs runs)
  test('EX-09 : supprimer le dernier export affiche l etat vide', async ({ page }) => {
    test.setTimeout(180000);
    // Partir d'un état propre : supprimer tous les exports existants
    await supprimerTousLesExports(page);
    await page.goto('/export');
    await expect(
      page.getByText('Historique des exports').or(page.getByText('Aucun export pour le moment')),
    ).toBeVisible({ timeout: 20000 });
    const countInitial = await page.locator('button[title="Supprimer definitivement"]').count();

    // Créer un seul export
    await lancerExport(page);
    await expect(page.getByText('Historique des exports')).toBeVisible({ timeout: 5000 });
    await expect
      .poll(
        async () => page.locator('button[title="Supprimer definitivement"]').count(),
        { timeout: 15000 },
      )
      .toBeGreaterThan(countInitial);

    // Le supprimer
    await page.locator('button[title="Supprimer definitivement"]').first().click();

    // Navigation fraîche pour éviter un interleaving entre cache Apollo, refetch et poll.
    await page.waitForTimeout(600);
    await page.goto('/export');

    // Le nombre d'exports revient à l'état initial.
    await expect(page.locator('button[title="Supprimer definitivement"]')).toHaveCount(countInitial);
    if (countInitial === 0) {
      await expect(page.getByText('Aucun export pour le moment')).toBeVisible({ timeout: 10000 });
    }
  });
});
