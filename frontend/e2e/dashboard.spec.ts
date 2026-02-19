// Tests E2E — Dashboard (rôle UTILISATEUR)
// Couvre U-D01 à U-D04 de la campagne de tests

import { test, expect } from '@playwright/test';

test.describe('Dashboard — role UTILISATEUR', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // U-D01
  test('le dashboard affiche le profil sans erreur', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Bonjour/ })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
  });

  // U-D02
  test('lien Saisie dans la nav mene a /saisie', async ({ page }) => {
    await page.getByRole('link', { name: 'Saisie' }).click();
    await expect(page).toHaveURL('/saisie', { timeout: 5000 });
  });

  // U-D03
  test('lien Supervision absent de la nav', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Supervision' })).not.toBeVisible();
  });

  // U-D04
  test('lien Administration absent de la nav', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Administration' })).not.toBeVisible();
  });
});
