// Setup Playwright : authentification admin (admin@sand.local)
// Sauvegarde les cookies pour réutilisation par les tests admin

import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_FILE = path.join(__dirname, '.auth/admin.json');

setup('authentification admin', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#email', 'admin@sand.local');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/', { timeout: 10000 });

  await page.context().storageState({ path: AUTH_FILE });
});
