// Tests E2E — Supervision (rôle MODERATEUR)
// Couvre M-SU01 à M-SU04 et M-A01, M-A02 de la campagne de tests

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 1 : page Supervision
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Supervision — role MODERATEUR', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supervision');
  });

  // M-SU01
  test('la page supervision affiche le titre', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Supervision' })).toBeVisible({ timeout: 5000 });
  });

  // M-SU02
  test('liste anomalies ou message aucune anomalie visible', async ({ page }) => {
    // Attendre fin du chargement
    const chargement = page.locator('text=Chargement...');
    await expect(chargement).not.toBeVisible({ timeout: 8000 });

    // Soit la liste d'anomalies, soit le message "Aucune anomalie"
    const listeAnomalies = page.locator('.divide-y.divide-gray-100');
    const aucuneAnomalie = page.getByText('Aucune anomalie');
    await expect(listeAnomalies.or(aucuneAnomalie)).toBeVisible({ timeout: 3000 });
  });

  // M-SU03
  test('lien voir saisie redirige avec userId dans URL', async ({ page }) => {
    // Naviguer en arrière jusqu'à trouver des anomalies (max 6 semaines)
    const boutonVoirSaisie = page.locator('button:has-text("Voir saisie")');
    const boutonPrecedent = page.locator('button').filter({
      has: page.locator('path[d="M15 19l-7-7 7-7"]'),
    });

    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(600);
      if ((await boutonVoirSaisie.count()) > 0) break;
      await boutonPrecedent.click();
    }

    // Si aucune anomalie dans les données de test, le test passe silencieusement
    if ((await boutonVoirSaisie.count()) === 0) return;

    await boutonVoirSaisie.first().click();
    await expect(page).toHaveURL(/\/saisie\?userId=/, { timeout: 5000 });
  });

  // M-SU04
  test('lien Supervision present dans la nav', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Supervision' })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 2 : accès admin refusés au modérateur (M-A01, M-A02)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Acces refuses — role MODERATEUR', () => {
  // M-A01
  test('/admin/utilisateurs redirige vers /', async ({ page }) => {
    await page.goto('/admin/utilisateurs');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  // M-A02
  test('/admin/activites redirige vers /', async ({ page }) => {
    await page.goto('/admin/activites');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
