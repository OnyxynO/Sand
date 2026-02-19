// Tests E2E — Administration des activités (rôle ADMIN)
// Couvre A-AC01 à A-AC06 de la campagne de tests

import { test, expect } from '@playwright/test';

test.describe('Admin — Activites', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/activites');
    // Attendre que l'arbre soit chargé (au moins une activite visible)
    await expect(page.locator('span.font-medium.text-gray-900').first()).toBeVisible({
      timeout: 10000,
    });
  });

  // A-AC01
  test('page activites affiche l arbre', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Activites' })).toBeVisible();
    const items = page.locator('span.font-medium.text-gray-900');
    expect(await items.count()).toBeGreaterThan(0);
  });

  // A-AC02
  test('bouton Nouvelle activite racine present', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Nouvelle activite racine' })
    ).toBeVisible();
  });

  // A-AC03
  test('switch vue texte - textarea peuple', async ({ page }) => {
    await page.getByRole('button', { name: 'Vue texte' }).click();

    const textarea = page.locator('[data-testid="textarea-arbre"]');
    await expect(textarea).toBeVisible({ timeout: 5000 });

    const contenu = await textarea.inputValue();
    expect(contenu.length).toBeGreaterThan(0);
  });

  // A-AC04 (anti-régression refetch)
  test('switch vue texte puis vue arbre - donnees fraiches apres refetch', async ({ page }) => {
    // Mémoriser un nom d'activite dans l'arbre
    const premierNom = await page.locator('span.font-medium.text-gray-900').first().textContent();

    // Aller en vue texte
    await page.getByRole('button', { name: 'Vue texte' }).click();
    await expect(page.locator('[data-testid="textarea-arbre"]')).toBeVisible({ timeout: 3000 });

    // Revenir en vue arbre (déclenche refetch)
    await page.getByRole('button', { name: 'Vue arbre' }).click();

    // L'arbre est toujours visible et contient les données
    await expect(page.locator('span.font-medium.text-gray-900').first()).toBeVisible({
      timeout: 5000,
    });
    const nomApres = await page.locator('span.font-medium.text-gray-900').first().textContent();
    expect(nomApres).toBe(premierNom);

    // Le bouton racine est visible (arbre non vide)
    await expect(
      page.getByRole('button', { name: 'Nouvelle activite racine' })
    ).toBeVisible();
  });

  // A-AC05 + A-AC06 (anti-régression bug système ABS)
  test('vue texte ajout feuille - Creation dans preview sans fausse Modification systeme', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Vue texte' }).click();

    const textarea = page.locator('[data-testid="textarea-arbre"]');
    await expect(textarea).toBeVisible({ timeout: 5000 });

    const texteInitial = await textarea.inputValue();
    expect(texteInitial.length).toBeGreaterThan(0);

    // Ajouter une nouvelle activite racine à la fin
    await textarea.fill(texteInitial + '\nNouvelleActiviteTest');

    // Ouvrir la prévisualisation
    await page.getByRole('button', { name: 'Appliquer les modifications' }).click();

    // A-AC05 : la prévisualisation montre "Création"
    await expect(page.locator('[data-testid="changement-creation"]')).toBeVisible({
      timeout: 3000,
    });

    // A-AC06 : aucune "Modification" avec ABS → "" (anti-régression bug système)
    const modifications = page.locator('[data-testid="changement-modification"]');
    const nbModifs = await modifications.count();
    for (let i = 0; i < nbModifs; i++) {
      await expect(modifications.nth(i)).not.toContainText('ABS');
    }
  });
});
