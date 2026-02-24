// Tests E2E — Page de configuration admin
// Couvre : paramètres généraux, section absences (mode manuel/API, URL, token, test connexion)
//
// Notes importantes :
//   - Le bouton "Enregistrer" est dans {!loading && data && (...)}, timeout nécessaire
//   - Les selects sont : premier_jour_semaine, periode_saisie_defaut, absence_mode (dans cet ordre)
//   - En mode API sauvegardé, le combobox absence_mode affiche "API externe" (pas "Manuel")
//     → CFG-05/06/07 utilisent le dernier select (.last()) pour être robustes à l'état initial
//   - CFG-05 effectue un nettoyage obligatoire (retour en mode Manuel + save) pour isoler les runs

import { test, expect } from '@playwright/test';

test.describe('Admin — Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/configuration');
    await expect(page.getByRole('heading', { name: 'Configuration systeme' })).toBeVisible({
      timeout: 8000,
    });
    // Le bouton Enregistrer n'est visible qu'après chargement des données
    await expect(page.getByRole('button', { name: 'Enregistrer' })).toBeVisible({
      timeout: 10000,
    });
  });

  // CFG-01 — le bouton Enregistrer est présent et désactivé au chargement
  test('CFG-01 : bouton Enregistrer present et desactive par defaut', async ({ page }) => {
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeVisible();
    await expect(btnEnregistrer).toBeDisabled();
  });

  // CFG-02 — la section "Gestion des absences" est positionnée avant le bouton Enregistrer
  test('CFG-02 : section Gestion des absences au-dessus du bouton Enregistrer', async ({
    page,
  }) => {
    const sectionAbsences = page.getByRole('heading', { name: 'Gestion des absences' });
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });

    await expect(sectionAbsences).toBeVisible();
    await expect(btnEnregistrer).toBeVisible();

    // Vérifier l'ordre DOM : section absences AVANT le bouton Enregistrer
    const absencesY = await sectionAbsences.boundingBox().then((b) => b?.y ?? 0);
    const btnY = await btnEnregistrer.boundingBox().then((b) => b?.y ?? 0);
    expect(btnY).toBeGreaterThan(absencesY);
  });

  // CFG-03 — modifier un paramètre active le bouton Enregistrer
  test('CFG-03 : modifier un parametre active le bouton Enregistrer', async ({ page }) => {
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeDisabled();

    // Modifier le délai d'annulation (premier champ number)
    const spinDelai = page.getByRole('spinbutton').first();
    const valeurActuelle = await spinDelai.inputValue();
    const nouvelleValeur = valeurActuelle === '5' ? '6' : '5';
    await spinDelai.fill(nouvelleValeur);

    await expect(btnEnregistrer).toBeEnabled();
  });

  // CFG-04 — sauvegarder un paramètre : le bouton se désactive après save
  test('CFG-04 : enregistrer les modifications desactive le bouton Enregistrer', async ({
    page,
  }) => {
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeDisabled();

    // Modifier le délai d'annulation
    const spinDelai = page.getByRole('spinbutton').first();
    const valeurActuelle = await spinDelai.inputValue();
    const nouvelleValeur = valeurActuelle === '5' ? '6' : '5';
    await spinDelai.fill(nouvelleValeur);

    await expect(btnEnregistrer).toBeEnabled();
    await btnEnregistrer.click();

    // Après save : bouton désactivé, message "Parametres enregistres" visible
    await expect(btnEnregistrer).toBeDisabled({ timeout: 8000 });
    await expect(page.getByText('Parametres enregistres')).toBeVisible({ timeout: 5000 });
  });

  // CFG-05 — passer en mode API affiche les champs URL et token
  test('CFG-05 : mode API affiche les champs URL et token', async ({ page }) => {
    // Utiliser le dernier select (absence_mode) — robuste même si mode déjà 'api'
    const modeSelect = page.locator('select').last();
    await modeSelect.selectOption('api');

    // Les champs URL et token doivent apparaître
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByRole('button', { name: 'Tester la connexion' })
    ).toBeVisible();

    // Le bouton Enregistrer doit être visible et en dessous du bouton Tester
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    const btnTester = page.getByRole('button', { name: 'Tester la connexion' });
    const testerY = await btnTester.boundingBox().then((b) => b?.y ?? 0);
    const enregistrerY = await btnEnregistrer.boundingBox().then((b) => b?.y ?? 0);
    expect(enregistrerY).toBeGreaterThan(testerY);
  });

  // CFG-06 — passer de API à Manuel efface URL et token dans le formulaire
  test('CFG-06 : passer en mode Manuel vide les champs URL et token', async ({ page }) => {
    const modeSelect = page.locator('select').last();

    // Passer en mode API et remplir les champs
    await modeSelect.selectOption('api');
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).toBeVisible({ timeout: 3000 });

    await page.getByPlaceholder('https://rh.exemple.fr/api').fill('http://test.exemple.fr/api');
    await page.locator('input[type="password"]').fill('mon-token-secret');

    // Repasser en mode Manuel → les champs API disparaissent
    await modeSelect.selectOption('manuel');
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).not.toBeVisible({
      timeout: 3000,
    });

    // Sauvegarder en mode Manuel → URL et token doivent être vidés en base
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await expect(btnEnregistrer).toBeEnabled();
    await btnEnregistrer.click();
    await expect(btnEnregistrer).toBeDisabled({ timeout: 8000 });

    // Recharger la page : on doit être en mode Manuel, sans champs API
    await page.reload();
    await expect(page.getByRole('button', { name: 'Enregistrer' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).not.toBeVisible();
    await expect(page.locator('select').last()).toHaveValue('manuel');
  });

  // CFG-07 — URL et token persistent après save en mode API
  test('CFG-07 : URL et token API persistent apres save et rechargement', async ({ page }) => {
    const modeSelect = page.locator('select').last();
    await modeSelect.selectOption('api');
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).toBeVisible({ timeout: 3000 });

    const urlTest = 'http://mock-rh:3001/api';
    const tokenTest = 'mock-token-dev';

    await page.getByPlaceholder('https://rh.exemple.fr/api').fill(urlTest);
    await page.locator('input[type="password"]').fill(tokenTest);

    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    await btnEnregistrer.click();
    await expect(btnEnregistrer).toBeDisabled({ timeout: 8000 });

    // Recharger → URL doit être conservée (token = champ password, valeur masquée mais non vide)
    await page.reload();
    await expect(page.getByRole('button', { name: 'Enregistrer' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('select').last()).toHaveValue('api');
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).toHaveValue(urlTest);

    // Nettoyage obligatoire : remettre en mode Manuel
    await modeSelect.selectOption('manuel');
    await btnEnregistrer.click();
    await expect(btnEnregistrer).toBeDisabled({ timeout: 8000 });
  });

  // CFG-08 — bouton Tester la connexion : actif seulement si mode=api ET aucune modification en cours
  test('CFG-08 : tester connexion API RH renvoie un resultat (✓ ou ✗)', async ({ page }) => {
    const modeSelect = page.locator('select').last();
    const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
    const btnTester = page.getByRole('button', { name: 'Tester la connexion' });

    // S'assurer d'être en mode API (robuste à l'état initial)
    await modeSelect.selectOption('api');
    await expect(page.getByPlaceholder('https://rh.exemple.fr/api')).toBeVisible({ timeout: 3000 });

    // Remplir l'URL du mock RH (accessible depuis Docker)
    await page.getByPlaceholder('https://rh.exemple.fr/api').fill('http://mock-rh:3001/api');
    await page.locator('input[type="password"]').fill('mock-token-dev');

    // Tant que modifie=true, Tester est désactivé
    await expect(btnTester).toBeDisabled();
    await expect(page.getByText("Enregistrez d'abord avant de tester.")).toBeVisible();

    // Sauvegarder → modifie=false → Tester actif
    await btnEnregistrer.click();
    await expect(btnEnregistrer).toBeDisabled({ timeout: 8000 });
    await expect(btnTester).toBeEnabled({ timeout: 3000 });

    // Lancer le test de connexion
    await btnTester.click();

    // Un résultat doit apparaître (✓ succès ou ✗ erreur — peu importe, le workflow fonctionne)
    await expect(
      page.locator('span').filter({ hasText: /^[✓✗]/ })
    ).toBeVisible({ timeout: 10000 });

    // Nettoyage obligatoire : remettre en mode Manuel
    await modeSelect.selectOption('manuel');
    await expect(btnEnregistrer).toBeEnabled();
    await btnEnregistrer.click();
    await expect(btnEnregistrer).toBeDisabled({ timeout: 8000 });
  });

  // CFG-09 — réinitialiser les paramètres (modale confirmation + reset)
  test('CFG-09 : reinitialiser les parametres affiche la modale de confirmation', async ({
    page,
  }) => {
    const btnReinitialiser = page.getByRole('button', { name: 'Reinitialiser' });
    await expect(btnReinitialiser).toBeVisible();

    await btnReinitialiser.click();

    // La modale de confirmation doit s'ouvrir
    await expect(page.getByText('Reinitialiser les parametres ?')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reinitialiser' }).last()).toBeVisible();

    // Annuler → la modale se ferme
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByText('Reinitialiser les parametres ?')).not.toBeVisible({
      timeout: 3000,
    });
  });
});
