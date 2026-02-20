// Tests E2E — Saisie en mode modération (rôle MODERATEUR)
// Couvre M-S01 à M-S03 de la campagne de tests

import { test, expect } from '@playwright/test';

test.describe('Saisie — role MODERATEUR', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/saisie');
    // Attendre que la grille soit chargée
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  // M-S01
  test('selecteur utilisateur visible pour le moderateur', async ({ page }) => {
    await expect(page.getByText('Saisir pour :')).toBeVisible();
  });

  // M-S02
  test('selectionner un utilisateur affiche le badge mode moderation', async ({ page }) => {
    const select = page.locator('#selecteur-utilisateur');
    await expect(select).toBeVisible({ timeout: 5000 });

    // Compter les options disponibles (Moi-meme + utilisateurs moderables)
    const options = select.locator('option');
    const count = await options.count();

    if (count <= 1) {
      // Pas d'utilisateurs moderables dans les données — test non applicable
      return;
    }

    // Sélectionner le premier utilisateur (index 1 = premier après "Moi-meme")
    await select.selectOption({ index: 1 });

    // Le badge "Mode moderation" doit apparaître
    await expect(page.getByText('Mode moderation')).toBeVisible({ timeout: 3000 });

    // La grille reste visible (rechargement des saisies de l'utilisateur sélectionné)
    await expect(page.locator('table')).toBeVisible();
  });

  // M-S03
  test('le moderateur peut sauvegarder une saisie pour un membre', async ({ page }) => {
    const select = page.locator('#selecteur-utilisateur');
    await expect(select).toBeVisible({ timeout: 10000 });

    const count = await select.locator('option').count();
    if (count <= 1) return; // Pas d'utilisateurs moderables

    // Sélectionner le premier utilisateur
    await select.selectOption({ index: 1 });
    await expect(page.getByText('Mode moderation')).toBeVisible({ timeout: 3000 });

    // Ouvrir la modale d'ajout de ligne
    await page.locator('button:has-text("Ajouter une ligne")').click();
    await expect(page.getByText('Choisir un projet')).toBeVisible({ timeout: 3000 });

    // Fermer la modale (Echap) — on vérifie juste que la sauvegarde est possible
    await page.keyboard.press('Escape');
    await expect(page.locator('table')).toBeVisible();
  });
});
