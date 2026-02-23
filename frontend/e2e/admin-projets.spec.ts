// Tests E2E — Administration des projets (rôle ADMIN)
// Couvre PRJ-01 à PRJ-07 de la campagne de tests

import { test, expect } from '@playwright/test';

test.describe('Admin — Projets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/projets');
    await expect(page.getByRole('heading', { name: 'Projets' })).toBeVisible({
      timeout: 10000,
    });
  });

  // PRJ-01 : Affichage de la liste des projets
  test('page projets affiche le heading et la liste', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projets' })).toBeVisible();
    // DemoSeeder crée au moins 3 projets
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Aucun projet')).not.toBeVisible();
  });

  // PRJ-02 : Bouton "Nouveau projet" présent (visible pour admin)
  test('bouton Nouveau projet present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nouveau projet' })).toBeVisible();
  });

  // PRJ-03 : Création d'un projet → apparaît dans la liste
  test('creer un projet - apparait dans la liste', async ({ page }) => {
    await page.getByRole('button', { name: 'Nouveau projet' }).click();

    // Headless UI : tester le titre visible de la modale (pas getByRole('dialog'))
    await expect(page.getByText('Nouveau projet', { exact: true })).toBeVisible({ timeout: 5000 });

    const nomUnique = `Projet E2E Test ${Date.now()}`;
    await page.getByLabel('Nom *').fill(nomUnique);
    await page.getByLabel('Code *').fill('E2E');

    await page.getByRole('button', { name: 'Creer' }).click();

    // Après fermeture de la modale, le projet doit apparaître dans la liste
    await expect(page.getByText(nomUnique)).toBeVisible({ timeout: 8000 });
  });

  // PRJ-04 : Filtre actifs/archivés (checkbox)
  test('filtre afficher uniquement les projets actifs - decochable', async ({ page }) => {
    const checkbox = page.getByLabel('Afficher uniquement les projets actifs');
    await expect(checkbox).toBeChecked();

    // Décocher → peut afficher les projets archivés aussi
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // Recocher → retour à l'état initial
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  // PRJ-05 : Ouverture de la modale de configuration des activités
  test('ouvrir modale configuration activites', async ({ page }) => {
    // Attendre que la liste soit chargée
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

    // Cliquer sur le bouton "Configurer les activites" du premier projet
    await page.locator('button[title="Configurer les activites"]').first().click();

    // Headless UI : tester le contenu visible de la modale (titre dynamique "Activites pour X")
    await expect(page.getByText('activite(s) selectionnee(s)')).toBeVisible({ timeout: 5000 });

    // Les boutons de sélection globale sont présents
    await expect(page.getByText('Tout selectionner')).toBeVisible();
    await expect(page.getByText('Tout deselectionner')).toBeVisible();
  });

  // PRJ-06 : Ouverture de la modale de gestion des modérateurs
  test('ouvrir modale gestion moderateurs', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[title="Gerer les moderateurs"]').first().click();

    // Headless UI : tester le texte visible de la modale
    await expect(page.getByText('Moderateurs')).toBeVisible({ timeout: 5000 });
  });

  // PRJ-07 : Ouverture de la modale de restrictions de visibilité
  test('ouvrir modale restrictions visibilite', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[title="Restrictions de visibilite"]').first().click();

    // Headless UI : vérifier qu'une modale est ouverte (titre ou contenu)
    await expect(page.getByText('Visibilite')).toBeVisible({ timeout: 5000 });
  });

  // PRJ-08 : Ouverture de la modale de modification d'un projet
  test('ouvrir modale modification projet', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[title="Modifier"]').first().click();

    // Headless UI : tester le titre visible de la modale
    await expect(page.getByText('Modifier projet', { exact: true })).toBeVisible({
      timeout: 5000,
    });

    // Le champ nom doit être pré-rempli
    const champNom = page.getByLabel('Nom *');
    await expect(champNom).toBeVisible();
    await expect(champNom).not.toHaveValue('');
  });

  // PRJ-09 : Confirmation de suppression affiche bien les boutons
  test('modale confirmation suppression affiche les boutons', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[title="Supprimer"]').first().click();

    await expect(page.getByText('Confirmer la suppression')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();

    // Annuler ferme la modale sans supprimer
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByText('Confirmer la suppression')).not.toBeVisible();
  });
});
