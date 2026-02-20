// Tests E2E — RGPD et reset de la base de données (rôle ADMIN)
//
// ⚠️  ATTENTION : ces tests sont DESTRUCTIFS.
//     Ne jamais les inclure dans la campagne standard (npm run e2e).
//     Utiliser exclusivement : npm run e2e:rgpd
//
// Couverture : A-RGPD01 et suivants

import { test, expect } from '@playwright/test';

test.describe('Admin — RGPD', () => {
  // A-RGPD01
  test('page rgpd affiche le heading', async ({ page }) => {
    await page.goto('/admin/rgpd');
    await expect(
      page.getByRole('heading', { name: 'RGPD - Gestion des donnees' })
    ).toBeVisible({ timeout: 8000 });
  });

  // A-RGPD02 : section droit a l'oubli presente
  test('section droit a l oubli presente', async ({ page }) => {
    await page.goto('/admin/rgpd');
    await expect(
      page.getByRole('heading', { name: 'RGPD - Gestion des donnees' })
    ).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Droit a l'oubli")).toBeVisible();
  });

  // A-RGPD03 : section purge totale presente
  test('section purge totale presente', async ({ page }) => {
    await page.goto('/admin/rgpd');
    await expect(
      page.getByRole('heading', { name: 'RGPD - Gestion des donnees' })
    ).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Purge totale')).toBeVisible();
  });

  // Ajouter ici les tests qui cliquent sur les boutons destructifs.
  // Exemple :
  //   test('purge totale vide la base', async ({ page }) => { ... });
});
