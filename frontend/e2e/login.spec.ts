// Tests E2E de la page de connexion
// Ces tests s'exécutent SANS storageState (utilisateur non connecté)

import { test, expect } from '@playwright/test';

// Désactiver le storageState hérité pour cette suite
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Page de connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('affiche le formulaire de connexion', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('SAND');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Se connecter');
  });

  test("identifiants invalides - message d'erreur affiche", async ({ page }) => {
    await page.fill('#email', 'inconnu@sand.local');
    await page.fill('#password', 'mauvais-mot-de-passe');
    await page.click('button[type="submit"]');

    // Un message d'erreur doit apparaître
    const erreur = page.locator('.bg-red-50');
    await expect(erreur).toBeVisible({ timeout: 8000 });
    await expect(erreur).not.toBeEmpty();
  });

  test('champs vides - validation cote client', async ({ page }) => {
    await page.click('button[type="submit"]');

    const erreur = page.locator('.bg-red-50');
    await expect(erreur).toBeVisible();
    await expect(erreur).toContainText('Veuillez remplir tous les champs');
  });

  test('connexion reussie - redirection vers /', async ({ page }) => {
    await page.fill('#email', 'jean.martin@sand.local');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });
});
