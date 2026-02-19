# SAND - Plan de tests E2E

> Strategie de tests end-to-end avec Playwright

---

## Outil recommande

**Playwright** avec le plugin `@playwright/test`

- Support navigateurs multiples (Chromium, Firefox, WebKit)
- API moderne async/await
- Traces visuelles et screenshots automatiques
- Integration CI/CD native

## Prerequis

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

## Structure proposee

```
frontend/
  e2e/
    fixtures/
      auth.ts              # Login helpers, cookies pre-authentifies
      seed.ts              # Appels API pour creer les donnees de test
    pages/
      login.page.ts        # Page Object : page de connexion
      saisie.page.ts       # Page Object : grille de saisie
      supervision.page.ts  # Page Object : supervision
      export.page.ts       # Page Object : export CSV
      stats.page.ts        # Page Object : statistiques
      admin.page.ts        # Page Object : pages admin
    tests/
      auth.spec.ts         # Parcours authentification
      saisie.spec.ts       # Parcours saisie d'activite
      supervision.spec.ts  # Parcours supervision moderateur
      export.spec.ts       # Parcours export CSV
      stats.spec.ts        # Parcours statistiques
      admin.spec.ts        # Parcours administration
    playwright.config.ts
```

## Scenarios E2E prioritaires

### 1. Authentification (`auth.spec.ts`)

| Scenario | Description |
|----------|-------------|
| Connexion valide | Email + mot de passe -> redirection dashboard |
| Connexion invalide | Mauvais identifiants -> message d'erreur |
| Deconnexion | Clic "Deconnexion" -> retour page login |
| Protection des routes | Acces `/saisie` sans auth -> redirection login |
| Session expiree | Cookie expire -> redirection automatique |

### 2. Saisie d'activite (`saisie.spec.ts`)

| Scenario | Description |
|----------|-------------|
| Saisie basique | Selectionner projet/activite, saisir duree, sauvegarder |
| Saisie complete journee | Remplir 1.0 ETP -> indicateur vert |
| Saisie incomplete | Total < 1.0 -> warning jaune |
| Suppression saisie | Supprimer une ligne existante avec toast annulation |
| Navigation semaines | Naviguer semaine precedente/suivante, verifier les dates |
| Saisie retroactive | Saisir sur un jour passe autorise |
| Validation duree | Saisir > 1.0 ou < 0 -> erreur |

### 3. Supervision moderateur (`supervision.spec.ts`)

| Scenario | Description |
|----------|-------------|
| Vue anomalies | Moderateur voit les anomalies de son equipe |
| Modifier saisie equipe | Moderateur modifie la saisie d'un membre |
| Supprimer saisie equipe | Moderateur supprime avec toast annulation |
| Isolation equipe | Moderateur ne voit PAS les saisies d'une autre equipe |

### 4. Export CSV (`export.spec.ts`)

| Scenario | Description |
|----------|-------------|
| Export basique | Selectionner periode -> exporter -> notification |
| Export avec filtres | Filtrer par projet + equipe -> CSV filtre |
| Telechargement | Cliquer lien de telechargement -> fichier CSV valide |
| Expiration | Export expire -> lien desactive |

### 5. Statistiques (`stats.spec.ts`)

| Scenario | Description |
|----------|-------------|
| Dashboard utilisateur | Camembert projets, evolution mois, cartes resume |
| Stats projet | Moderateur selectionne un projet -> graphiques charges |
| Stats globales | Admin voit toutes les equipes, filtre par equipe |
| Navigation periode | Changer de mois -> donnees rafraichies |
| Comparatif M vs M-1 | Deltas affiches avec fleches haut/bas |

### 6. Administration (`admin.spec.ts`)

| Scenario | Description |
|----------|-------------|
| CRUD equipe | Creer, modifier, supprimer une equipe |
| CRUD projet | Creer, activer/desactiver activites, assigner moderateurs |
| CRUD utilisateur | Creer, modifier role, desactiver |
| Arborescence activites | Ajouter sous-activite, verifier est_feuille |
| Configuration | Modifier parametres, verifier persistance |

## Strategie de donnees de test

### Base dediee

Utiliser une base PostgreSQL `sand_e2e` separee, reinitialiser avant chaque suite :

```typescript
// e2e/fixtures/seed.ts
// Reinitialiser la base via une requete HTTP au backend
// ou via un script shell securise
async function resetDatabase() {
  await fetch('http://localhost:8080/api/test/reset', { method: 'POST' });
}
```

### Seeder E2E

Creer un seeder specifique `DatabaseSeeder` avec :

- 2 equipes (Dev, Support)
- 1 admin, 2 moderateurs, 3 utilisateurs
- 3 projets (avec activites configurees)
- Saisies pour la semaine courante et la semaine precedente

### Authentication helper

```typescript
// e2e/fixtures/auth.ts
import { type Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
```

## Configuration Playwright

```typescript
// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

## Priorite d'implementation

1. **P0** : Auth + Saisie basique (parcours critique)
2. **P1** : Supervision + Export
3. **P2** : Statistiques + Administration
4. **P3** : Scenarios edge-case et multi-navigateurs
