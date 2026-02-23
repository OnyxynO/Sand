// Tests E2E — Administration des équipes (rôle ADMIN)
// Couvre EQP-01 à EQP-05 de la campagne de tests

import { test, expect } from '@playwright/test';

test.describe('Admin — Equipes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/equipes');
    await expect(page.getByRole('heading', { name: 'Equipes' })).toBeVisible({
      timeout: 10000,
    });
  });

  // EQP-01 : Affichage de la liste des équipes
  test('page equipes affiche le heading et la liste', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Equipes' })).toBeVisible();
    // DemoSeeder crée au moins une équipe
    await expect(page.locator('.bg-white.rounded-lg.shadow-sm').first()).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByText('Aucune equipe trouvee')).not.toBeVisible();
  });

  // EQP-02 : Bouton "Nouvelle equipe" présent et ouvre la modale de création
  test('bouton Nouvelle equipe present et ouvre la modale', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nouvelle equipe' })).toBeVisible();

    await page.getByRole('button', { name: 'Nouvelle equipe' }).click();

    // Headless UI : tester le titre h2 de la modale via son role (strict mode: bouton + titre matchent le meme texte)
    await expect(page.getByRole('heading', { name: 'Nouvelle equipe' })).toBeVisible({
      timeout: 5000,
    });

    // Les champs obligatoires sont présents (les labels n'ont pas d'attribut for/id → cibler par name)
    await expect(page.locator('input[name="nom"]')).toBeVisible();
    await expect(page.locator('input[name="code"]')).toBeVisible();

    // Fermer la modale
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByRole('heading', { name: 'Nouvelle equipe' })).not.toBeVisible();
  });

  // EQP-03 : Création d'une équipe → apparaît dans la liste
  test('creer une equipe - apparait dans la liste', async ({ page }) => {
    await page.getByRole('button', { name: 'Nouvelle equipe' }).click();

    // Headless UI : titre h2 (strict mode: bouton + titre matchent le meme texte)
    await expect(page.getByRole('heading', { name: 'Nouvelle equipe' })).toBeVisible({
      timeout: 5000,
    });

    const suffix = Date.now();
    const nomUnique = `Equipe E2E ${suffix}`;
    const codeUnique = `E${String(suffix % 10000).padStart(4, '0')}`;
    await page.locator('input[name="nom"]').fill(nomUnique);
    await page.locator('input[name="code"]').fill(codeUnique);

    await page.getByRole('button', { name: 'Creer' }).click();

    // Après fermeture de la modale, l'équipe doit apparaître dans la liste
    await expect(page.getByText(nomUnique)).toBeVisible({ timeout: 8000 });
  });

  // EQP-04 : Ouverture de la modale de modification
  test('ouvrir modale modification equipe', async ({ page }) => {
    // Attendre qu'une carte équipe soit chargée
    await expect(
      page.locator('button[title="Modifier"]').first()
    ).toBeVisible({ timeout: 8000 });

    await page.locator('button[title="Modifier"]').first().click();

    // Headless UI : tester le titre visible
    await expect(page.getByText("Modifier l'equipe", { exact: true })).toBeVisible({
      timeout: 5000,
    });

    // Le champ nom doit être pré-rempli (label sans for/id → cibler par name)
    const champNom = page.locator('input[name="nom"]');
    await expect(champNom).toBeVisible();
    await expect(champNom).not.toHaveValue('');

    await page.getByRole('button', { name: 'Annuler' }).click();
  });

  // EQP-05 : Modale confirmation suppression affiche les boutons
  test('modale confirmation suppression affiche les boutons', async ({ page }) => {
    await expect(
      page.locator('button[title="Supprimer"]').first()
    ).toBeVisible({ timeout: 8000 });

    await page.locator('button[title="Supprimer"]').first().click();

    await expect(page.getByText('Confirmer la suppression')).toBeVisible({ timeout: 5000 });
    // .last() : le bouton Supprimer du dialog vient après les boutons des cartes dans le DOM
    await expect(page.getByRole('button', { name: 'Supprimer' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();

    // Annuler ferme la modale sans supprimer
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByText('Confirmer la suppression')).not.toBeVisible();
  });

  // EQP-06 : Filtre équipes actives
  test('filtre afficher uniquement les equipes actives - decochable', async ({ page }) => {
    const checkbox = page.getByLabel('Afficher uniquement les equipes actives');
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });
});
