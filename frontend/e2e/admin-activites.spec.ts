// Tests E2E — Administration des activités (rôle ADMIN)
// Couvre A-AC01 à A-AC06 de la campagne de tests

import { test, expect } from '@playwright/test';

test.describe('Admin — Activites', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/activites');
    await expect(page.getByRole('heading', { name: 'Activites' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Nouvelle activite racine' })).toBeVisible({
      timeout: 10000,
    });
  });

  // A-AC01
  test('page activites affiche l arbre', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Activites' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Vue arbre' })).toBeVisible();
    await expect(page.getByText('Saisissable').first()).toBeVisible({ timeout: 10000 });
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
    // Aller en vue texte
    await page.getByRole('button', { name: 'Vue texte' }).click();
    await expect(page.locator('[data-testid="textarea-arbre"]')).toBeVisible({ timeout: 3000 });

    // Revenir en vue arbre (déclenche refetch)
    await page.getByRole('button', { name: 'Vue arbre' }).click();

    // L'arbre est toujours visible et les actions principales sont de retour
    await expect(
      page.getByRole('button', { name: 'Nouvelle activite racine' })
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Saisissable').first()).toBeVisible({ timeout: 5000 });
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

  // A-AC07 : DESACTIVE — flaky en CI
  // La mutation moveActivity fonctionne mais le refetch Apollo n'est pas deterministe :
  // l'ordre des activites dans le cache peut ne pas correspondre a l'ordre attendu si
  // plusieurs tests precedents ont modifie l'etat du DemoSeeder (ordres dephasés).
  // Le comportement est couvert par les tests PHPUnit (ActivityMutatorGraphQLTest::monter/descendre).
  test.skip('A-AC07 : reordonner une activite - ordre mis a jour', async ({ page }) => {
    const items = page.locator('span.font-medium');

    // Memoriser l'ordre initial des deux premieres activites non systeme
    // DemoSeeder : Absence (systeme, idx 0), puis les activites racines par ordre croissant
    const nomIdx1 = await items.nth(1).textContent();
    const nomIdx2 = await items.nth(2).textContent();

    // Cliquer "Descendre" sur la 2eme activite (index 1 dans la liste aplatie)
    // force:true car les boutons sont opacity-0 tant qu'on ne survole pas la rangee
    await page.locator('button[title="Descendre"]').nth(1).click({ force: true });

    // Attendre que la liste se rafraichisse (refetch Apollo apres moveActivity)
    await expect(items.nth(1)).toHaveText(nomIdx2 ?? '', { timeout: 5000 });

    // Verifier que les deux activites ont echange de position
    expect(await items.nth(2).textContent()).toBe(nomIdx1);
  });
});
