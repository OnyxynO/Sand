// Setup Playwright : authentification moderateur (marie.dupont@sand.local)
// Sauvegarde les cookies pour réutilisation par les tests moderateur

import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_FILE = path.join(__dirname, '.auth/moderateur.json');

setup('authentification moderateur', async ({ page }) => {
  await page.goto('/login');
  await page.waitForTimeout(1500);
  await expect(page.getByText('Services en cours de démarrage')).not.toBeVisible({ timeout: 10000 });

  await page.fill('#email', 'marie.dupont@sand.local');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/', { timeout: 10000 });

  await page.context().storageState({ path: AUTH_FILE });
});
