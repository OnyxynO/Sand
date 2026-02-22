// Tests E2E — Administration des utilisateurs et pages admin (rôle ADMIN)
// Couvre A-U01 à A-U06 de la campagne de tests

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

  // A-U03 — régression EV-08 : la liste ne doit pas être vide
  test('liste contient au moins un utilisateur', async ({ page }) => {
    await page.goto('/admin/utilisateurs');
    await expect(page.getByRole('heading', { name: 'Utilisateurs' })).toBeVisible({
      timeout: 8000,
    });
    // Attendre que le chargement soit terminé (spinner disparaît ou tableau apparaît)
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
    // Vérifier qu'il n'y a pas le message "vide"
    await expect(page.getByText('Aucun utilisateur trouve')).not.toBeVisible();
  });

  // A-U04 — régression EV-08 : navigation depuis la page de saisie ne vide pas la liste
  test('liste non vide apres navigation depuis saisie', async ({ page }) => {
    // Passer par SaisiePage (qui charge PARAMETRE_ABSENCE_MODE dans le cache Apollo)
    await page.goto('/saisie');
    await expect(page.getByRole('heading', { name: 'Saisie' })).toBeVisible({ timeout: 8000 });

    // Naviguer vers la page utilisateurs
    await page.goto('/admin/utilisateurs');
    await expect(page.getByRole('heading', { name: 'Utilisateurs' })).toBeVisible({
      timeout: 8000,
    });
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Aucun utilisateur trouve')).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bloc 2 : autres pages admin
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Admin — Autres pages', () => {
  // A-U05
  test('page equipes affiche le heading', async ({ page }) => {
    await page.goto('/admin/equipes');
    await expect(page.getByRole('heading', { name: 'Equipes' })).toBeVisible({ timeout: 8000 });
  });

  // A-U06
  test('page configuration affiche le heading', async ({ page }) => {
    await page.goto('/admin/configuration');
    await expect(page.getByRole('heading', { name: 'Configuration systeme' })).toBeVisible({
      timeout: 8000,
    });
  });
});
