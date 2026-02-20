// Tests E2E — Overlay de vérification des services
// Vérifie que l'overlay apparaît / disparaît selon l'état des services

import { test, expect } from '@playwright/test';

const URL_HEALTH = 'http://localhost:8080/api/health';

test.describe('Overlay services', () => {
  // OV-01 : pas d'overlay en conditions normales
  test('OV-01 : overlay absent quand les services sont disponibles', async ({ page }) => {
    await page.goto('/');
    // Laisser le temps au premier health check de compléter (~1 s)
    await page.waitForTimeout(2000);
    await expect(page.getByText("Services en cours de démarrage")).not.toBeVisible();
  });

  // OV-02 : overlay présent quand l'API est indisponible
  test('OV-02 : overlay present quand health retourne une erreur', async ({ page }) => {
    // Intercepter le health check avant de naviguer
    await page.route(URL_HEALTH, (route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"status":"error"}' }),
    );

    await page.goto('/');

    // L'overlay doit apparaître après le premier check (~quelques ms avec le mock)
    await expect(page.getByText("Services en cours de démarrage")).toBeVisible({ timeout: 5000 });
  });

  // OV-03 : overlay liste bien les 3 services avec leur statut
  test('OV-03 : overlay liste les 3 services avec statut Indisponible', async ({ page }) => {
    await page.route(URL_HEALTH, (route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"status":"error"}' }),
    );

    await page.goto('/');
    await expect(page.getByText("Services en cours de démarrage")).toBeVisible({ timeout: 5000 });

    // Les 3 services doivent être listés
    await expect(page.getByText('API Backend')).toBeVisible();
    await expect(page.getByText('Base de données')).toBeVisible();
    await expect(page.getByText("Redis / Files d'attente")).toBeVisible();

    // Tous en statut "Indisponible"
    const badges = page.getByText('Indisponible');
    expect(await badges.count()).toBe(3);
  });

  // OV-04 : overlay disparaît quand les services reviennent
  test('OV-04 : overlay disparait quand les services redeviennent disponibles', async ({
    page,
  }) => {
    // Phase 1 : bloquer le health check → overlay apparaît
    await page.route(URL_HEALTH, (route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"status":"error"}' }),
    );

    await page.goto('/');
    await expect(page.getByText("Services en cours de démarrage")).toBeVisible({ timeout: 5000 });

    // Phase 2 : retirer le mock → le vrai backend répond → overlay disparaît
    // Le prochain poll (toutes les 3 s) contactera le vrai serveur
    await page.unroute(URL_HEALTH);

    // Attendre que l'overlay disparaisse (intervalle 3 s + temps de fetch)
    await expect(page.getByText("Services en cours de démarrage")).not.toBeVisible({
      timeout: 10000,
    });
  });
});
