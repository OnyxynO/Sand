// Tests E2E — Page de configuration admin
// Couvre : layout, section absences, bouton Enregistrer

import { test, expect } from '@playwright/test';

test.describe('Admin — Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/configuration');
    await expect(page.getByRole('heading', { name: 'Configuration systeme' })).toBeVisible({
      timeout: 8000,
    });
  });

  // CFG-01 — le bouton Enregistrer est present et desactive au chargement
  test('CFG-01 : bouton Enregistrer present et desactive par defaut', async ({ page }) => {
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeVisible();
    await expect(btnEnregistrer).toBeDisabled();
  });

  // CFG-02 — le bouton Enregistrer est sous la section absences (layout correct)
  test('CFG-02 : bouton Enregistrer positionne apres la section Gestion des absences', async ({
    page,
  }) => {
    const sectionAbsences = page.getByRole('heading', { name: 'Gestion des absences' });
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });

    await expect(sectionAbsences).toBeVisible();
    await expect(btnEnregistrer).toBeVisible();

    // Verifier l'ordre DOM : section absences AVANT le bouton Enregistrer
    const absencesY = await sectionAbsences.boundingBox().then((b) => b?.y ?? 0);
    const btnY = await btnEnregistrer.boundingBox().then((b) => b?.y ?? 0);
    expect(btnY).toBeGreaterThan(absencesY);
  });

  // CFG-03 — en mode API, les champs URL et token s'affichent, Enregistrer reste en bas
  test('CFG-03 : mode API affiche les champs et bouton Enregistrer reste en bas', async ({
    page,
  }) => {
    // Passer en mode API
    await page.getByRole('combobox').filter({ hasText: 'Manuel' }).selectOption('api');

    // Les champs URL et token doivent apparaitre
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tester la connexion' })).toBeVisible();

    // Le bouton Enregistrer doit etre visible (sous les champs API)
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeVisible();

    // Et doit etre sous le bouton Tester la connexion
    const btnTester = page.getByRole('button', { name: 'Tester la connexion' });
    const testerY = await btnTester.boundingBox().then((b) => b?.y ?? 0);
    const enregistrerY = await btnEnregistrer.boundingBox().then((b) => b?.y ?? 0);
    expect(enregistrerY).toBeGreaterThan(testerY);
  });

  // CFG-04 — modifier un parametre active le bouton Enregistrer
  test('CFG-04 : modifier un parametre active le bouton Enregistrer', async ({ page }) => {
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeDisabled();

    // Modifier le delai d'annulation
    const spinDelai = page.getByRole('spinbutton').first();
    await spinDelai.fill('10');

    await expect(btnEnregistrer).toBeEnabled();
  });

  // CFG-05 — EV-12 : bouton "Tester la connexion" renvoie un résultat en mode API
  test('CFG-05 : tester connexion API RH affiche un resultat', async ({ page }) => {
    // Passer en mode API
    await page.getByRole('combobox').filter({ hasText: 'Manuel' }).selectOption('api');

    // Les champs API doivent apparaitre
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tester la connexion' })).toBeVisible();

    // Enregistrer pour que modifie = false (le bouton Tester est désactivé si modifie = true)
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeEnabled();
    await btnEnregistrer.click();
    await expect(btnEnregistrer).toBeDisabled({ timeout: 5000 });

    // Le bouton Tester la connexion doit être actif maintenant
    const btnTester = page.getByRole('button', { name: 'Tester la connexion' });
    await expect(btnTester).toBeEnabled({ timeout: 3000 });

    // Cliquer sur "Tester la connexion"
    await btnTester.click();

    // Un résultat doit apparaitre (✓ succès ou ✗ erreur — peu importe, le workflow fonctionne)
    await expect(page.locator('span').filter({ hasText: /^[✓✗]/ })).toBeVisible({ timeout: 10000 });

    // Nettoyage : remettre en mode manuel
    await page.getByRole('combobox').filter({ hasText: 'API externe' }).selectOption('manuel');
    const btnEnregistrerRetour = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrerRetour).toBeEnabled();
    await btnEnregistrerRetour.click();
    await expect(btnEnregistrerRetour).toBeDisabled({ timeout: 5000 });
  });
});
