import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'fr-FR',
    trace: 'on-first-retry',
  },
  projects: [
    // ── Setups d'authentification (s'exécutent en premier) ──
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts$/,
    },
    {
      name: 'setup-moderateur',
      testMatch: /auth\.setup\.moderateur\.ts/,
    },

    // ── Tests Chromium par rôle ──
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/utilisateur.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/supervision.spec.ts', '**/saisie-moderateur.spec.ts'],
    },
    {
      name: 'chromium-moderateur',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/moderateur.json',
      },
      dependencies: ['setup-moderateur'],
      testMatch: ['**/supervision.spec.ts', '**/saisie-moderateur.spec.ts'],
    },
  ],
});
