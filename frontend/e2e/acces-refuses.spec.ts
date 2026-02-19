// Tests E2E — Accès refusés par rôle
// Couvre U-A01 à U-A03 de la campagne de tests

import { test, expect } from '@playwright/test';

test.describe('Acces refuses — role UTILISATEUR', () => {
  // U-A01
  test('/admin/utilisateurs redirige vers /', async ({ page }) => {
    await page.goto('/admin/utilisateurs');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  // U-A02
  test('/admin/activites redirige vers /', async ({ page }) => {
    await page.goto('/admin/activites');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  // U-A03
  test('/supervision redirige vers /', async ({ page }) => {
    await page.goto('/supervision');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
