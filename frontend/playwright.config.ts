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
    // Setup global : authentification (s'exécute en premier)
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Tests Chromium avec session authentifiée
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/utilisateur.json',
      },
      dependencies: ['setup'],
    },
  ],
});
