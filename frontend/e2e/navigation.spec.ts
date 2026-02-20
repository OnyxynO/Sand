// Tests E2E — Navigation entre les pages (rôle ADMIN)
// Anti-régression : éléments manquants ou erreurs réseau après navigation

import { test, expect } from '@playwright/test';

// ─── helpers ──────────────────────────────────────────────────────────────────

async function verifierPasErreurReseau(page: Parameters<Parameters<typeof test>[1]>[0]) {
  // Aucun bloc d'erreur réseau visible (bg-red-50 = erreur Apollo dans les pages stats)
  await expect(page.locator('.bg-red-50').first()).not.toBeVisible();
  await expect(page.getByText(/NetworkError/)).not.toBeVisible();
  await expect(page.getByText(/Erreur lors du chargement/)).not.toBeVisible();
}

// ─── tests ────────────────────────────────────────────────────────────────────

test.describe('Navigation — chargement des pages (ADMIN)', () => {
  // NAV-01
  test('NAV-01 : stats projet charge sans erreur', async ({ page }) => {
    await page.goto('/stats-projet');
    await expect(page.getByRole('heading', { name: 'Statistiques projet' })).toBeVisible({
      timeout: 15000,
    });
    await verifierPasErreurReseau(page);
  });

  // NAV-02
  test('NAV-02 : stats globales charge sans erreur', async ({ page }) => {
    await page.goto('/stats-globales');
    await expect(page.getByRole('heading', { name: 'Statistiques globales' })).toBeVisible({
      timeout: 15000,
    });
    await verifierPasErreurReseau(page);
  });

  // NAV-03
  test('NAV-03 : supervision charge sans erreur', async ({ page }) => {
    await page.goto('/supervision');
    await expect(page.getByRole('heading', { name: 'Supervision' })).toBeVisible({
      timeout: 15000,
    });
    await verifierPasErreurReseau(page);
  });

  // NAV-04
  test('NAV-04 : export charge sans erreur', async ({ page }) => {
    await page.goto('/export');
    await expect(page.getByRole('heading', { name: 'Export CSV' })).toBeVisible({
      timeout: 15000,
    });
    await verifierPasErreurReseau(page);
  });
});

test.describe('Navigation — enchainement rapide sans erreur', () => {
  // NAV-05 : navigation rapide entre les 4 pages
  test('NAV-05 : enchaîner stats-projet → stats-globales → supervision → export', async ({
    page,
  }) => {
    const pages = [
      { url: '/stats-projet', heading: 'Statistiques projet' },
      { url: '/stats-globales', heading: 'Statistiques globales' },
      { url: '/supervision', heading: 'Supervision' },
      { url: '/export', heading: 'Export CSV' },
    ];

    for (const { url, heading } of pages) {
      await page.goto(url);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 15000 });
      await verifierPasErreurReseau(page);
    }
  });

  // NAV-06 : aller-retour stats-projet ↔ stats-globales (bug historique de rechargement)
  test('NAV-06 : aller-retour stats-projet vers stats-globales sans contenu manquant', async ({
    page,
  }) => {
    await page.goto('/stats-projet');
    await expect(page.getByRole('heading', { name: 'Statistiques projet' })).toBeVisible({
      timeout: 15000,
    });

    await page.goto('/stats-globales');
    await expect(page.getByRole('heading', { name: 'Statistiques globales' })).toBeVisible({
      timeout: 15000,
    });
    await verifierPasErreurReseau(page);

    // Retour sur stats-projet : les données doivent recharger correctement
    await page.goto('/stats-projet');
    await expect(page.getByRole('heading', { name: 'Statistiques projet' })).toBeVisible({
      timeout: 15000,
    });
    await verifierPasErreurReseau(page);
  });

  // NAV-07 : supervision → export → supervision (pages avec beaucoup de données)
  test('NAV-07 : supervision vers export puis retour supervision sans erreur', async ({ page }) => {
    await page.goto('/supervision');
    await expect(page.getByRole('heading', { name: 'Supervision' })).toBeVisible({
      timeout: 15000,
    });

    await page.goto('/export');
    await expect(page.getByRole('heading', { name: 'Export CSV' })).toBeVisible({
      timeout: 15000,
    });

    await page.goto('/supervision');
    await expect(page.getByRole('heading', { name: 'Supervision' })).toBeVisible({
      timeout: 15000,
    });
    await verifierPasErreurReseau(page);
  });
});
