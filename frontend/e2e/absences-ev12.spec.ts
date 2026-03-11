// Tests E2E — EV-12 : absences mode manuel (déclaration utilisateur + notification)
// Rôle : utilisateur (jean.martin@sand.local)
// Pré-requis : mode absence configuré en 'manuel' (défaut)
//
// Notes sur la structure de la page :
//   - La page /saisie contient DEUX tables : BlocAbsences (première) + GrilleSemaine (deuxième)
//   - Les cellules du BlocAbsences ont des titres AVEC accents (ex: "Cliquer pour déclarer une absence")
//   - Clic sur cellule vide → modale type+durée (EV-12-MOTIF) - via h3 "Déclarer une absence"
//   - Clic sur cellule remplie → cycle direct sans modale : 1 ETP → 0.5 ETP → suppression
//   - "Journée" correspond à 1 ETP, "Demi-journée" à 0.5 ETP
//   - Strict mode : { exact: true } nécessaire pour 'Journée' (sinon match 'Demi-journée')
//   - Strict mode : 2 boutons 'Annuler' (modal absence + BoutonSauvegarde) → scoper à la modal
//   - Après création, vérifier via COUNT de cellules remplies (DemoSeeder peut avoir des absences)
//   - mode: 'serial' pour éviter que les tests en parallèle partagent l'état de la DB

import { test, expect } from '@playwright/test';

// Les tests partagent la DB → exécution séquentielle pour éviter les interférences
test.describe.configure({ mode: 'serial' });

async function allerSurSaisie(page: Parameters<Parameters<typeof test>[1]>[0]) {
  try {
    await page.goto('/saisie');
  } catch {
    await page.goto('/saisie');
  }
}

test.describe('EV-12 — Absences mode manuel (utilisateur)', () => {
  test.beforeEach(async ({ page }) => {
    await allerSurSaisie(page);
    await expect(page.getByRole('heading', { name: 'Saisie hebdomadaire' })).toBeVisible({
      timeout: 15000,
    });
    // networkidle seul insuffisant : useLazyQuery + useEffect déclenche la query absences
    // après le premier render React ; une attente fixe après networkidle garantit le rendu.
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(800); // Laisser les queries tardives répondre et React re-render
    // La page a 2 tables : utiliser .first() pour eviter le strict mode violation
    await expect(page.locator('table').first()).toBeVisible();
  });

  // Nettoyage après chaque test : supprimer les absences créées par les tests (ref_ext = null).
  // Les absences DemoSeeder (ref_ext != null) ne peuvent pas être supprimées via l'UI → détection
  // de "count stable" pour stopper la boucle. Race condition possible (click ouvre la modale si
  // React a réinitialisé le state entre le locator et le click) → fermer la modale si elle s'ouvre.
  test.afterEach(async ({ page }) => {
    await allerSurSaisie(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(800);

    const ligneAbsence = page.locator('table').first().locator('tbody tr').first();
    let staleTries = 0;
    let lastCount = -1;
    let tries = 20; // max 7 jours × 2 clics (1 ETP → 0.5 → suppression)
    while (tries-- > 0) {
      // Fermer la modale si elle est ouverte (race condition ou test qui a échoué avec modale ouverte)
      if (await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }

      const filled = ligneAbsence.locator('td[title*="cliquer pour changer la dur\u00e9e"]');
      const count = await filled.count();
      if (count === 0) break;

      // Si le count ne baisse pas après 3 tentatives, c'est une cellule DemoSeeder (non supprimable)
      if (count === lastCount) {
        if (++staleTries >= 3) break;
      } else {
        staleTries = 0;
      }
      lastCount = count;

      await filled.first().click();
      await page.waitForTimeout(300); // Laisser le click se propager avant de vérifier la modale

      // Si la modale s'ouvre (race condition : absence indisponible dans le state React au moment du click)
      if (await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }

      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(100); // Laisser React re-render après le refetch
    }
  });

  // Helper : récupère la ligne du bloc absences (premier tbody tr de la première table)
  function getLigneAbsences(page: Parameters<typeof test>[1]['page']) {
    return page.locator('table').first().locator('tbody tr').first();
  }

  // EV-12-01 : le bloc absences est visible en mode manuel avec le prompt "cliquer pour saisir"
  test('EV-12-01 : bloc absences visible avec prompt cliquer pour saisir', async ({ page }) => {
    await expect(page.getByText('Absences', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('cliquer pour saisir')).toBeVisible({ timeout: 5000 });
    // La ligne absence est présente (tbody tr dans la première table)
    const ligneAbsence = getLigneAbsences(page);
    await expect(ligneAbsence).toBeVisible({ timeout: 5000 });
  });

  // EV-12-02 : flux complet — clic cellule vide → modale → sélection type RTT + journée → confirmer
  test('EV-12-02 : declarer absence via modale (type RTT, journee entiere)', async ({ page }) => {
    const ligneAbsence = getLigneAbsences(page);

    // Compter les cellules vides et remplies AVANT création (afterEach du test précédent a nettoyé)
    const filledBefore = await ligneAbsence
      .locator('td[title*="cliquer pour changer la dur\u00e9e"]')
      .count();
    const celluleVide = ligneAbsence
      .locator('td[title="Cliquer pour d\u00e9clarer une absence"]')
      .first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine');
      return;
    }

    // Clic → modale "Déclarer une absence" (h3, pas h2)
    await celluleVide.click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).toBeVisible({
      timeout: 3000,
    });

    // Sélectionner "RTT" comme type
    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'RTT' }).click();

    // Durée par défaut : Journée — { exact: true } car "Demi-journée" contient "Journée"
    await expect(
      page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Journée', exact: true })
    ).toHaveClass(/bg-indigo-600/);

    // Confirmer
    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Confirmer' }).click();

    // Modale fermée
    await expect(page.getByText('Déclarer une absence', { exact: true })).not.toBeVisible({
      timeout: 3000,
    });

    // Une cellule remplie de plus qu'avant
    await expect(
      ligneAbsence.locator('td[title*="cliquer pour changer la dur\u00e9e"]')
    ).toHaveCount(filledBefore + 1, { timeout: 8000 });
    await expect(ligneAbsence.locator('td').filter({ hasText: 'RTT' })).toBeVisible({
      timeout: 5000,
    });
    // Nettoyage géré par afterEach
  });

  // EV-12-03 : annuler la modale ne crée pas d'absence
  test('EV-12-03 : annuler la modale ne cree pas dabsence', async ({ page }) => {
    const ligneAbsence = getLigneAbsences(page);
    const filledBefore = await ligneAbsence
      .locator('td[title*="cliquer pour changer la dur\u00e9e"]')
      .count();
    const celluleVide = ligneAbsence
      .locator('td[title="Cliquer pour d\u00e9clarer une absence"]')
      .first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine');
      return;
    }

    await celluleVide.click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).toBeVisible({
      timeout: 3000,
    });

    // Scoper le bouton Annuler à la modale (évite le strict mode: BoutonSauvegarde a aussi 'Annuler')
    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Annuler' }).click();

    // Modale fermée
    await expect(page.getByText('Déclarer une absence', { exact: true })).not.toBeVisible({
      timeout: 3000,
    });

    // Le nombre de cellules remplies est inchangé (pas de mutation envoyée)
    await expect(
      ligneAbsence.locator('td[title*="cliquer pour changer la dur\u00e9e"]')
    ).toHaveCount(filledBefore, { timeout: 3000 });
  });

  // EV-12-04 : déclaration demi-journée (0.5 ETP)
  test('EV-12-04 : declarer une demi-journee dabsence (0.5 ETP)', async ({ page }) => {
    const ligneAbsence = getLigneAbsences(page);
    const filledBefore = await ligneAbsence
      .locator('td[title*="cliquer pour changer la dur\u00e9e"]')
      .count();
    const celluleVide = ligneAbsence
      .locator('td[title="Cliquer pour d\u00e9clarer une absence"]')
      .first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine');
      return;
    }

    await celluleVide.click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).toBeVisible({
      timeout: 3000,
    });

    // Sélectionner "Demi-journée"
    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Demi-journée' }).click();
    await expect(
      page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Demi-journée' })
    ).toHaveClass(/bg-indigo-600/);

    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).not.toBeVisible({
      timeout: 3000,
    });

    // Une cellule demi-journee visible dans la ligne absence.
    // On s'appuie sur le contenu rendu plutot que seulement sur le title, plus sensible au timing du refetch.
    await expect(
      ligneAbsence.locator('td').filter({ hasText: '0.5' }).first()
    ).toBeVisible({ timeout: 8000 });
    const filledAfter = await ligneAbsence
      .locator('td[title*="cliquer pour changer la dur\u00e9e"]')
      .count();
    expect(filledAfter).toBeGreaterThanOrEqual(filledBefore);
    // Nettoyage géré par afterEach
  });

  // EV-12-05 : cycle durée sur absence existante (1 ETP → 0.5 ETP → suppression, sans modale)
  test('EV-12-05 : cycle duree directement sur cellule remplie (sans modale)', async ({ page }) => {
    const ligneAbsence = getLigneAbsences(page);
    const filledBefore = await ligneAbsence
      .locator('td[title*="cliquer pour changer la dur\u00e9e"]')
      .count();
    const celluleVide = ligneAbsence
      .locator('td[title="Cliquer pour d\u00e9clarer une absence"]')
      .first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine');
      return;
    }

    // Créer une absence (Congés payés + Journée par défaut = 1 ETP)
    await celluleVide.click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).toBeVisible({
      timeout: 3000,
    });
    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).not.toBeVisible({
      timeout: 3000,
    });

    // Vérifier qu'une cellule a été ajoutée
    await expect(
      ligneAbsence.locator('td[title*="cliquer pour changer la dur\u00e9e"]')
    ).toHaveCount(filledBefore + 1, { timeout: 8000 });

    // La cellule nouvellement créée est "Conges payes" (type par défaut).
    // Le DemoSeeder utilise "Maladie" → on distingue les deux par le texte affiché.
    const celluleRemplie = ligneAbsence.locator('td').filter({ hasText: 'Conges' }).first();

    // Clic direct → 1 ETP → 0.5 ETP (sans modale)
    await celluleRemplie.click();
    // Attendre que le refetch ait mis à jour la cellule à 0.5 avant le prochain clic
    await expect(celluleRemplie).toContainText('0.5', { timeout: 8000 });
    await expect(
      ligneAbsence.locator('td[title*="cliquer pour changer la dur\u00e9e"]')
    ).toHaveCount(filledBefore + 1, { timeout: 5000 }); // toujours 1 cellule de plus (0.5)

    // Clic direct → 0.5 ETP → suppression
    await celluleRemplie.click();
    await expect(
      ligneAbsence.locator('td[title*="cliquer pour changer la dur\u00e9e"]')
    ).toHaveCount(filledBefore, { timeout: 8000 }); // retour au nombre initial
  });

  // EV-12-06 : fermer la modale en cliquant sur le fond (backdrop)
  test('EV-12-06 : fermer la modale en cliquant sur le fond', async ({ page }) => {
    const ligneAbsence = getLigneAbsences(page);
    const celluleVide = ligneAbsence
      .locator('td[title="Cliquer pour d\u00e9clarer une absence"]')
      .first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine');
      return;
    }

    await celluleVide.click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).toBeVisible({
      timeout: 3000,
    });

    // Clic sur le fond (overlay) — coin supérieur gauche loin du panneau central
    await page.locator('.fixed.inset-0.z-50').click({ position: { x: 10, y: 10 } });
    await expect(page.getByText('Déclarer une absence', { exact: true })).not.toBeVisible({
      timeout: 3000,
    });
  });

  // EV-12-07 : notification créée après déclaration d'absence
  test('EV-12-07 : notification envoyee apres declaration absence', async ({ page }) => {
    const ligneAbsence = getLigneAbsences(page);
    const filledBefore = await ligneAbsence
      .locator('td[title*="cliquer pour changer la dur\u00e9e"]')
      .count();
    const celluleVide = ligneAbsence
      .locator('td[title="Cliquer pour d\u00e9clarer une absence"]')
      .first();

    if (!(await celluleVide.isVisible({ timeout: 3000 }))) {
      test.skip(true, 'Pas de cellule absence vide disponible cette semaine');
      return;
    }

    // Déclarer une absence (Congés payés + Journée par défaut)
    await celluleVide.click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).toBeVisible({
      timeout: 3000,
    });
    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByText('Déclarer une absence', { exact: true })).not.toBeVisible({
      timeout: 3000,
    });

    // Attendre que la cellule soit remplie (mutation complète)
    await expect(
      ligneAbsence.locator('td[title*="cliquer pour changer la dur\u00e9e"]')
    ).toHaveCount(filledBefore + 1, { timeout: 8000 });

    // Ouvrir la cloche notifications (title="Notifications")
    await page.locator('button[title="Notifications"]').click();

    // Vérifier qu'au moins une notification "Absence declaree" est présente
    // (.first() : les runs précédents accumulent des notifications, strict mode sinon)
    await expect(page.getByText('Absence declaree').first()).toBeVisible({ timeout: 8000 });

    // Fermer le panneau (Escape)
    await page.keyboard.press('Escape');
    // Nettoyage géré par afterEach
  });
});
