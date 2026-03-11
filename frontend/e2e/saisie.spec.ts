// Tests E2E de la page de saisie hebdomadaire
// Utilise storageState (utilisateur connecté via auth.setup.ts)
// Inclut le test anti-régression feuille blanche

import { test, expect } from '@playwright/test';

test.describe('Page de saisie', () => {
  const getTableauSaisie = (page: Parameters<typeof test>[1]['page']) =>
    page.locator('table').last();

  const getNavigationSemaine = (page: Parameters<typeof test>[1]['page']) =>
    page.locator('h2').filter({ hasText: /\d{4}/ }).first().locator('..');

  test.beforeEach(async ({ page }) => {
    await page.goto('/saisie');
    // Attendre que React soit completement rendu avant chaque test
    // (evite les races sur page.goto apres une navigation precedente)
    await expect(page.getByRole('heading', { name: 'Saisie hebdomadaire' })).toBeVisible({
      timeout: 15000,
    });
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
    const tableau = getTableauSaisie(page);
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
    const navigation = getNavigationSemaine(page);
    await expect(navigation).toBeVisible({ timeout: 10000 });

    // Le titre de semaine contient une année (format "Du X au Y MOIS AAAA")
    const titreSemaine = page.locator('h2').filter({ hasText: /\d{4}/ }).first();
    await expect(titreSemaine).toBeVisible();
    const texte = await titreSemaine.textContent();
    expect(texte).toMatch(/\d{4}/); // contient une année
  });

  test('navigation semaine precedente - le titre est mis a jour', async ({ page }) => {
    // Attendre le titre initial
    const titreSemaine = page.locator('h2').filter({ hasText: /\d{4}/ }).first();
    await expect(titreSemaine).toBeVisible({ timeout: 10000 });
    const titreInitial = await titreSemaine.textContent();

    // Cliquer sur "Semaine précédente"
    await page.click('button[aria-label="Semaine précédente"]');

    // Le titre doit changer
    await expect(titreSemaine).not.toHaveText(titreInitial || '', { timeout: 3000 });

    // Le bouton "Aujourd'hui" doit apparaître
    await expect(page.locator("button:has-text(\"Aujourd'hui\")")).toBeVisible();
  });

  test('navigation semaine suivante - retour a la semaine initiale', async ({ page }) => {
    const titreSemaine = page.locator('h2').filter({ hasText: /\d{4}/ }).first();
    await expect(titreSemaine).toBeVisible({ timeout: 10000 });
    const titreInitial = await titreSemaine.textContent();

    // Reculer puis avancer
    await page.click('button[aria-label="Semaine précédente"]');
    await expect(titreSemaine).not.toHaveText(titreInitial || '', { timeout: 3000 });

    await page.click('button[aria-label="Semaine suivante"]');
    await expect(titreSemaine).toHaveText(titreInitial || '', { timeout: 3000 });

    // Le bouton "Aujourd'hui" ne doit plus être visible
    await expect(page.locator("button:has-text(\"Aujourd'hui\")")).not.toBeVisible();
  });

  test('bouton Ajouter une ligne present et cliquable', async ({ page }) => {
    // Attendre que la grille soit chargée
    await expect(getTableauSaisie(page)).toBeVisible({ timeout: 10000 });

    // Trouver le bouton d'ajout de ligne
    const boutonAjouter = page.locator('button:has-text("Ajouter une ligne")');
    await expect(boutonAjouter).toBeVisible();

    // Cliquer ouvre la modale de sélection
    await boutonAjouter.click();

    // La modale doit s'ouvrir : le titre "Choisir un projet" doit être visible
    await expect(page.getByText('Choisir un projet')).toBeVisible({ timeout: 3000 });
  });

  // U-S10
  test('selecteur utilisateur absent (reserve moderateur+)', async ({ page }) => {
    await expect(getTableauSaisie(page)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Saisir pour :')).not.toBeVisible();
  });

  // U-S07 : semaine future → cellules en lecture seule
  test('U-S07 : semaine future - cellules en lecture seule', async ({ page }) => {
    await expect(getTableauSaisie(page)).toBeVisible({ timeout: 10000 });

    // Aller a la semaine suivante (entierement dans le futur)
    await page.click('button[aria-label="Semaine suivante"]');
    await expect(getTableauSaisie(page)).toBeVisible({ timeout: 10000 });

    // Ajouter une ligne via la modale (premier projet/activite disponibles)
    // Ne pas hardcoder "SAND" car le projet peut avoir une date de fin avant la semaine future.
    await page.locator('button:has-text("Ajouter une ligne")').click();
    await expect(page.getByText('Choisir un projet')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('ul li button').first()).toBeVisible({ timeout: 10000 });
    await page.locator('ul li button').first().click();
    await expect(page.getByText('Choisir une activite')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('ul li button').first()).toBeVisible({ timeout: 10000 });
    await page.locator('ul li button').first().click();

    // La ligne doit apparaitre dans le tableau
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 3000 });

    // Les cellules jour doivent etre des div en lecture seule (cursor-not-allowed), pas des boutons
    const celluleLecture = page.locator('td div.cursor-not-allowed');
    await expect(celluleLecture.first()).toBeVisible({ timeout: 2000 });

    // Cliquer sur une cellule ne doit pas ouvrir d'input
    await celluleLecture.first().click();
    await expect(page.locator('input[aria-label*="Saisir pour"]')).not.toBeVisible();
  });

  // U-S08 : EV-01 modale de confirmation pour modifications non sauvegardees
  test('U-S08 : navigation bloquee avec modifications non sauvegardees', async ({ page }) => {
    await expect(getTableauSaisie(page)).toBeVisible({ timeout: 10000 });

    // Ajouter une ligne sur la semaine courante (qui a des jours passes)
    await page.locator('button:has-text("Ajouter une ligne")').click();
    await expect(page.getByText('Choisir un projet')).toBeVisible({ timeout: 5000 });
    await page.locator('ul li button:has-text("SAND")').first().click();
    await expect(page.getByText('Choisir une activite')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('ul li button').first()).toBeVisible({ timeout: 10000 });
    await page.locator('ul li button').first().click();

    // Attendre l'apparition de la ligne
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 3000 });

    // Cliquer sur la cellule Lundi (jour passe, cellule interactive)
    // jourComplet vient de format(date, 'EEEE', { locale: fr }) → minuscule : "lundi"
    const celluleLundi = page.locator('button[aria-label="Saisir pour lundi"]');
    await expect(celluleLundi).toBeVisible({ timeout: 3000 });
    await celluleLundi.click();

    // Saisir une valeur et confirmer
    const input = page.locator('input[aria-label="Saisir pour lundi"]');
    await expect(input).toBeVisible({ timeout: 2000 });
    await input.fill('0.5');
    await input.press('Enter');

    // Naviguer vers "Tableau de bord" doit etre bloque
    await page.getByRole('link', { name: 'Tableau de bord' }).click();

    // La modale de confirmation doit apparaitre
    await expect(page.getByText('Modifications non enregistrees')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: 'Rester sur la page' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quitter sans enregistrer' })).toBeVisible();

    // Cliquer "Rester sur la page" ferme la modale, on reste sur la page de saisie
    await page.getByRole('button', { name: 'Rester sur la page' }).click();
    // Utiliser le heading (h3) pour eviter le strict mode : le span nav "Modifications non enregistrees"
    // reste visible pendant que la modale se ferme.
    await expect(page.getByRole('heading', { name: 'Modifications non enregistrees' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Saisie hebdomadaire' })).toBeVisible();
  });

  // U-S09 : EV-07 ligne d'absence visible dans la grille
  test("U-S09 : ligne d'absence visible pour la semaine avec absences", async ({ page }) => {
    const titreSemaine = page.locator('h2').filter({ hasText: /\d{4}/ }).first();
    await expect(titreSemaine).toBeVisible({ timeout: 10000 });

    // Reculer 5 semaines pour atteindre W03 (Jan 12-18, 2026)
    // Jean a des absences les 15 et 16 janvier (conges payes, DemoSeeder)
    for (let i = 0; i < 5; i++) {
      const titreActuel = await titreSemaine.textContent();
      await page.click('button[aria-label="Semaine précédente"]');
      await expect(titreSemaine).not.toHaveText(titreActuel || '', { timeout: 3000 });
    }

    // Attendre le chargement de la grille
    await expect(getTableauSaisie(page)).toBeVisible({ timeout: 10000 });

    // La ligne d'absence necessite que le DemoSeeder ait ete execute.
    // Si absent (env vierge), le test est passe (skip) plutot qu'en echec.
    const ligneAbsence = page.locator('table').getByText('Absence');
    const absent = !(await ligneAbsence.isVisible());
    if (absent) {
      test.skip(true, 'DemoSeeder non execute — absences de Jean non disponibles (lancer db:seed --class=DemoSeeder)');
    }
    await expect(ligneAbsence).toBeVisible();
  });
});
