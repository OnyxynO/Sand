// Tests E2E — Administration des utilisateurs et pages admin (rôle ADMIN)
// Couvre A-U01 à A-U05 de la campagne de tests

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 1 : page Utilisateurs
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Admin — Utilisateurs', () => {
  // A-U01
  test('page utilisateurs affiche la liste', async ({ page }) => {
    await page.goto('/admin/utilisateurs');
    await expect(page.getByRole('heading', { name: 'Utilisateurs' })).toBeVisible({
      timeout: 8000,
    });
  });

  // A-U02
  test('bouton Nouvel utilisateur present', async ({ page }) => {
    await page.goto('/admin/utilisateurs');
    await expect(page.getByRole('heading', { name: 'Utilisateurs' })).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByRole('button', { name: 'Nouvel utilisateur' })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 2 : autres pages admin
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Admin — Autres pages', () => {
  // A-U03
  test('page equipes affiche le heading', async ({ page }) => {
    await page.goto('/admin/equipes');
    await expect(page.getByRole('heading', { name: 'Equipes' })).toBeVisible({ timeout: 8000 });
  });

  // A-U04
  test('page configuration affiche le heading', async ({ page }) => {
    await page.goto('/admin/configuration');
    await expect(page.getByRole('heading', { name: 'Configuration systeme' })).toBeVisible({
      timeout: 8000,
    });
  });

  // A-U05 déplacé dans admin-rgpd.spec.ts (campagne destructive séparée)
});
