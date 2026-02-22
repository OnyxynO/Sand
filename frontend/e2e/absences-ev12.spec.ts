// Tests E2E — EV-12 : absences mode manuel (déclaration utilisateur + notification)
// Rôle : utilisateur (jean.martin@sand.local)
// Pré-requis : mode absence configuré en 'manuel' (défaut)

import { test, expect } from '@playwright/test';

test.describe('EV-12 — Absences mode manuel (utilisateur)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/saisie');
    await expect(page.getByRole('heading', { name: 'Saisie hebdomadaire' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  // EV-12-01 : la ligne d'absence est visible en mode manuel même sans absence existante
  test('EV-12-01 : ligne absence toujours visible en mode manuel', async ({ page }) => {
    const ligneAbsence = page.locator('tr').filter({ hasText: 'Absence' }).filter({ hasText: 'cliquer pour saisir' });
    await expect(ligneAbsence).toBeVisible({ timeout: 5000 });
  });

  // EV-12-02 : cycle déclaration — vide → 1 ETP → 0.5 ETP → vide
  test('EV-12-02 : cycle declarer absence (vide → 1 ETP → 0.5 ETP → vide)', async ({ page }) => {
    const ligneAbsence = page.locator('tr').filter({ hasText: 'Absence' });
    await expect(ligneAbsence).toBeVisible({ timeout: 5000 });

    // Trouver la première cellule vide cliquable dans la ligne d'absence
    const celluleVide = ligneAbsence.locator('td[title="Cliquer pour declarer une absence"]').first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine (absences deja saisies)');
      return;
    }

    // Clic 1 → 1 ETP (journée complète)
    await celluleVide.click();

    // La cellule doit afficher une durée après mutation GraphQL
    const celluleRemplie = ligneAbsence.locator('td[title*="cliquer pour changer"]').first();
    await expect(celluleRemplie).toBeVisible({ timeout: 5000 });
    await expect(celluleRemplie).toContainText('1');

    // Clic 2 → 0.5 ETP (demi-journée)
    await celluleRemplie.click();
    await expect(celluleRemplie).toContainText('0.5', { timeout: 3000 });

    // Clic 3 → vide (suppression)
    await celluleRemplie.click();
    // La cellule revient à l'état vide
    await expect(celluleVide).toBeVisible({ timeout: 3000 });
  });

  // EV-12-03 : une notification est créée après déclaration d'absence
  test('EV-12-03 : notification envoyee apres declaration absence', async ({ page }) => {
    const ligneAbsence = page.locator('tr').filter({ hasText: 'Absence' });
    await expect(ligneAbsence).toBeVisible({ timeout: 5000 });

    const celluleVide = ligneAbsence.locator('td[title="Cliquer pour declarer une absence"]').first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine');
      return;
    }

    // Déclarer une absence (1 ETP)
    await celluleVide.click();
    const celluleRemplie = ligneAbsence.locator('td[title*="cliquer pour changer"]').first();
    await expect(celluleRemplie).toBeVisible({ timeout: 5000 });

    // Ouvrir le panneau de notifications (cache-and-network → rechargera depuis le serveur)
    const cloche = page.locator('button[title="Notifications"]');
    await expect(cloche).toBeVisible({ timeout: 3000 });
    await cloche.click();

    // Vérifier qu'une notification "Absence declaree" est présente
    await expect(page.getByText('Absence declaree')).toBeVisible({ timeout: 5000 });

    // Nettoyer : fermer le panneau et supprimer l'absence déclarée
    await page.keyboard.press('Escape');
    if (await celluleRemplie.isVisible({ timeout: 1000 })) {
      await celluleRemplie.click(); // → 0.5 ETP
      const celluleRemplie2 = ligneAbsence.locator('td[title*="cliquer pour changer"]').first();
      if (await celluleRemplie2.isVisible({ timeout: 1000 })) {
        await celluleRemplie2.click(); // → vide
      }
    }
  });
});
