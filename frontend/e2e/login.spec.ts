// Tests E2E — Authentification
// Couvre AUTH-01 à AUTH-08 de la campagne de tests

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 1 : tests SANS session (formulaire, connexions, accès protégé)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Authentification — sans session', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // AUTH-01
  test('champs vides - message de validation cote client', async ({ page }) => {
    await page.click('button[type="submit"]');

    const erreur = page.locator('.bg-red-50');
    await expect(erreur).toBeVisible();
    await expect(erreur).toContainText('Veuillez remplir tous les champs');
  });

  // AUTH-02
  test("identifiants invalides - message d'erreur affiche", async ({ page }) => {
    await page.fill('#email', 'inconnu@sand.local');
    await page.fill('#password', 'mauvais-mot-de-passe');
    await page.click('button[type="submit"]');

    const erreur = page.locator('.bg-red-50');
    await expect(erreur).toBeVisible({ timeout: 8000 });
    await expect(erreur).not.toBeEmpty();
  });

  // AUTH-03
  test('connexion UTILISATEUR - redirection vers /', async ({ page }) => {
    await page.fill('#email', 'jean.martin@sand.local');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  // AUTH-04
  test('connexion MODERATEUR - redirection vers /', async ({ page }) => {
    await page.fill('#email', 'marie.dupont@sand.local');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  // AUTH-05
  test('connexion ADMIN - redirection vers /', async ({ page }) => {
    await page.fill('#email', 'admin@sand.local');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  // AUTH-08
  test('route protegee sans session - redirection vers /login', async ({ page }) => {
    await page.goto('/saisie');
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 2 : redirection /login → / (avec session, lecture seule)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Authentification — avec session', () => {
  // AUTH-06
  test('/login redirige vers / si deja connecte', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 3 : déconnexion — contexte isolé pour ne pas invalider le storageState
// partagé (la mutation logout révoque la session Sanctum côté serveur)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Authentification — deconnexion', () => {
  // AUTH-07 : crée sa propre session dans le test, sans toucher à .auth/utilisateur.json
  test('deconnexion - redirection vers /login', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    // Se connecter manuellement dans ce contexte isolé
    await page.goto('/login');
    await page.fill('#email', 'jean.martin@sand.local');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Cliquer sur déconnexion
    const boutonDeconnexion = page.locator('button[title="Se deconnecter"]');
    await expect(boutonDeconnexion).toBeVisible({ timeout: 5000 });
    await boutonDeconnexion.click();

    // Vérifier la redirection et le formulaire de login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    await expect(page.locator('#email')).toBeVisible();

    await context.close();
  });
});
