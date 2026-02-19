// Tests E2E de la page de saisie hebdomadaire
// Utilise storageState (utilisateur connecté via auth.setup.ts)
// Inclut le test anti-régression feuille blanche

import { test, expect } from '@playwright/test';

test.describe('Page de saisie', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/saisie');
  });

  test('anti-regression : la page affiche sans feuille blanche', async ({ page }) => {
    // Collecter les erreurs console
    const erreurs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        erreurs.push(msg.text());
      }
    });

    // Le titre principal doit être visible (getByRole pour éviter l'ambiguïté avec le h1 du Layout)
    await expect(page.getByRole('heading', { name: 'Saisie hebdomadaire' })).toBeVisible({
      timeout: 10000,
    });

    // Aucune erreur console fatale (on filtre les erreurs réseau/timeout normales)
    const erreursFatales = erreurs.filter(
      (e) =>
        !e.includes('net::ERR') &&
        !e.includes('Failed to fetch') &&
        !e.includes('NetworkError')
    );
    expect(erreursFatales).toHaveLength(0);
  });

  test('la grille affiche 7 colonnes jour (Lun. au Dim.)', async ({ page }) => {
    // Attendre que la grille soit chargée
    const tableau = page.locator('table');
    await expect(tableau).toBeVisible({ timeout: 10000 });

    // Vérifier les en-têtes de colonnes (7 jours + colonne Projet/Activité + Total = 9 colonnes)
    const enTetes = tableau.locator('thead th');
    await expect(enTetes).toHaveCount(9, { timeout: 5000 });

    // Vérifier que les jours de la semaine sont présents
    const texteEnTetes = await enTetes.allTextContents();
    const joursAttendus = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
    for (const jour of joursAttendus) {
      expect(texteEnTetes.some((t) => t.includes(jour))).toBe(true);
    }
  });

  test('le titre affiche la semaine courante', async ({ page }) => {
    // La navigation semaine est visible
    const navigation = page.locator('.bg-white.rounded-lg.p-4.shadow-sm');
    await expect(navigation).toBeVisible({ timeout: 10000 });

    // Le titre de semaine contient une année (format "Du X au Y MOIS AAAA")
    const titreSemaine = navigation.locator('h2');
    await expect(titreSemaine).toBeVisible();
    const texte = await titreSemaine.textContent();
    expect(texte).toMatch(/\d{4}/); // contient une année
  });

  test('navigation semaine precedente - le titre est mis a jour', async ({ page }) => {
    // Attendre le titre initial
    const titreSemaine = page.locator('.bg-white.rounded-lg.p-4.shadow-sm h2');
    await expect(titreSemaine).toBeVisible({ timeout: 10000 });
    const titreInitial = await titreSemaine.textContent();

    // Cliquer sur "Semaine précédente"
    await page.click('button[title="Semaine precedente"]');

    // Le titre doit changer
    await expect(titreSemaine).not.toHaveText(titreInitial || '', { timeout: 3000 });

    // Le bouton "Aujourd'hui" doit apparaître
    await expect(page.locator("button:has-text(\"Aujourd'hui\")")).toBeVisible();
  });

  test('navigation semaine suivante - retour a la semaine initiale', async ({ page }) => {
    const titreSemaine = page.locator('.bg-white.rounded-lg.p-4.shadow-sm h2');
    await expect(titreSemaine).toBeVisible({ timeout: 10000 });
    const titreInitial = await titreSemaine.textContent();

    // Reculer puis avancer
    await page.click('button[title="Semaine precedente"]');
    await expect(titreSemaine).not.toHaveText(titreInitial || '', { timeout: 3000 });

    await page.click('button[title="Semaine suivante"]');
    await expect(titreSemaine).toHaveText(titreInitial || '', { timeout: 3000 });

    // Le bouton "Aujourd'hui" ne doit plus être visible
    await expect(page.locator("button:has-text(\"Aujourd'hui\")")).not.toBeVisible();
  });

  test('bouton Ajouter une ligne present et cliquable', async ({ page }) => {
    // Attendre que la grille soit chargée
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Trouver le bouton d'ajout de ligne
    const boutonAjouter = page.locator('button:has-text("Ajouter une ligne")');
    await expect(boutonAjouter).toBeVisible();

    // Cliquer ouvre la modale de sélection
    await boutonAjouter.click();

    // La modale doit s'ouvrir : le titre "Choisir un projet" doit être visible
    await expect(page.getByText('Choisir un projet')).toBeVisible({ timeout: 3000 });
  });
});
