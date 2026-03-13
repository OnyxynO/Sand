import { defineConfig, devices } from '@playwright/test';

const previewPort = Number(process.env.PLAYWRIGHT_PORT || '5173');
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${previewPort}`;
const apiURL = process.env.VITE_API_URL || 'http://localhost:8081/graphql';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL,
    locale: 'fr-FR',
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1'
    ? undefined
    : {
        command: `VITE_API_URL=${apiURL} npm run build:docker && npm run preview -- --host 127.0.0.1 --port ${previewPort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
        stderr: 'pipe',
        timeout: 120000,
      },
  projects: [
    // ── Setups d'authentification (s'exécutent en premier) ──
    { name: 'setup',           testMatch: /auth\.setup\.ts$/ },
    { name: 'setup-moderateur', testMatch: /auth\.setup\.moderateur\.ts/ },
    { name: 'setup-admin',      testMatch: /auth\.setup\.admin\.ts/ },

    // ── Tests Chromium par rôle ──
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/utilisateur.json' },
      dependencies: ['setup'],
      testMatch: [
        '**/login.spec.ts',
        '**/dashboard.spec.ts',
        '**/saisie.spec.ts',
        '**/absences-ev12.spec.ts',
        '**/acces-refuses.spec.ts',
      ],
    },
    {
      name: 'chromium-moderateur',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/moderateur.json' },
      dependencies: ['setup-moderateur'],
      testMatch: ['**/supervision.spec.ts', '**/saisie-moderateur.spec.ts'],
    },
    {
      name: 'chromium-admin',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup-admin'],
      testMatch: [
        '**/admin-activites.spec.ts',
        '**/admin-utilisateurs.spec.ts',
        '**/admin-configuration.spec.ts',
        '**/admin-projets.spec.ts',
        '**/admin-equipes.spec.ts',
        '**/export.spec.ts',
        '**/navigation.spec.ts',
        '**/service-overlay.spec.ts',
      ],
    },

    // ⚠️  Projet destructif — RGPD et reset BDD
    // Exécution uniquement via : npm run e2e:rgpd
    {
      name: 'chromium-admin-rgpd',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup-admin'],
      testMatch: ['**/admin-rgpd.spec.ts'],
    },
  ],
});
