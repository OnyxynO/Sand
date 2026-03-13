// Setup global Playwright : authentification unique réutilisée par tous les tests
// Se connecte avec jean.martin@sand.local et sauvegarde les cookies

import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_FILE = path.join(__dirname, '.auth/utilisateur.json');

setup('authentification utilisateur', async ({ page }) => {
  await page.goto('/login');
  await page.waitForTimeout(1500);
  await expect(page.getByText('Services en cours de démarrage')).not.toBeVisible({ timeout: 10000 });

  // Remplir le formulaire de connexion
  await page.fill('#email', 'jean.martin@sand.local');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');

  // Attendre la redirection vers le dashboard
  await expect(page).toHaveURL('/', { timeout: 10000 });

  // Sauvegarder les cookies/localStorage pour réutilisation
  await page.context().storageState({ path: AUTH_FILE });
});
