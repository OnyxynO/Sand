# Campagne de tests SAND — 3 rôles

Référence pour l'implémentation des tests. Chaque cas liste le type d'outil recommandé et la priorité.

**Priorités** : P0 = régression critique · P1 = fonctionnel important · P2 = complémentaire
**Types** : 🎭 E2E (Playwright) · 🧪 PHPUnit · ⚛️ Vitest

---

## Fichiers à créer

```
frontend/e2e/
├── auth.setup.ts              # déjà existant (utilisateur)
├── auth.setup.moderateur.ts   # nouveau
├── auth.setup.admin.ts        # nouveau
├── login.spec.ts              # déjà existant
├── saisie.spec.ts             # déjà existant (utilisateur)
├── saisie-moderateur.spec.ts  # nouveau
├── dashboard.spec.ts          # nouveau (commun)
├── supervision.spec.ts        # nouveau (modérateur + admin)
├── admin-activites.spec.ts    # nouveau (admin)
├── admin-utilisateurs.spec.ts # nouveau (admin)
└── acces-refuses.spec.ts      # nouveau (tous rôles)

backend/tests/Feature/
├── Policies/                  # déjà existant à compléter
│   ├── TimeEntryPolicyTest.php
│   ├── ProjectPolicyTest.php
│   ├── UserPolicyTest.php
│   └── ActivityPolicyTest.php
└── GraphQL/                   # à compléter
    ├── SupervisionTest.php
    └── ExportTest.php
```

---

## 1. Authentification — commun aux 3 rôles

### 🎭 E2E — `login.spec.ts` (déjà existant, à compléter)

| ID | Cas de test | Priorité |
|----|-------------|----------|
| AUTH-01 | Formulaire vide → message "Veuillez remplir tous les champs" | P0 |
| AUTH-02 | Identifiants invalides → message d'erreur affiché | P0 |
| AUTH-03 | Connexion UTILISATEUR réussie → redirection `/` | P0 |
| AUTH-04 | Connexion MODERATEUR réussie → redirection `/` | P1 |
| AUTH-05 | Connexion ADMIN réussie → redirection `/` | P1 |
| AUTH-06 | `/login` redirige vers `/` si déjà connecté | P1 |
| AUTH-07 | Déconnexion → redirection vers `/login` | P1 |
| AUTH-08 | Route protégée sans session → redirection `/login` | P0 |

---

## 2. Rôle UTILISATEUR — `jean.martin@sand.local`

Pages accessibles : Dashboard (`/`), Saisie (`/saisie`), Stats projet (`/stats-projet`).

### 🎭 E2E — `saisie.spec.ts` (déjà existant, à compléter)

| ID | Cas de test | Priorité |
|----|-------------|----------|
| U-S01 | Page `/saisie` s'affiche sans feuille blanche *(anti-régression)* | P0 |
| U-S02 | Grille affiche 7 colonnes jour (Lun. → Dim.) | P0 |
| U-S03 | Titre de semaine affiché et contient l'année courante | P1 |
| U-S04 | Navigation semaine précédente → titre mis à jour | P1 |
| U-S05 | Navigation semaine suivante → retour semaine initiale | P1 |
| U-S06 | Bouton "Ajouter une ligne" ouvre la modale "Choisir un projet" | P0 |
| U-S07 | Semaine future → cellules en lecture seule (pas de saisie possible) | P1 |
| U-S08 | EV-01 : quitter la page avec saisie non sauvegardée → modale de confirmation | P1 |
| U-S09 | EV-07 : ligne d'absence visible dans la grille quand une absence existe | P1 |
| U-S10 | Pas de sélecteur d'utilisateur visible (réservé modérateur+) | P1 |

### 🎭 E2E — `dashboard.spec.ts`

| ID | Cas de test | Priorité |
|----|-------------|----------|
| U-D01 | Dashboard `/` s'affiche sans erreur | P0 |
| U-D02 | Lien "Saisie" dans la nav mène à `/saisie` | P1 |
| U-D03 | Pas de lien "Supervision" dans la nav | P1 |
| U-D04 | Pas de lien "Administration" dans la nav | P0 |

### 🎭 E2E — `acces-refuses.spec.ts`

| ID | Cas de test | Priorité |
|----|-------------|----------|
| U-A01 | `/admin/utilisateurs` → redirigé vers `/` | P0 |
| U-A02 | `/admin/activites` → redirigé vers `/` | P0 |
| U-A03 | `/supervision` → redirigé vers `/` | P0 |

### 🧪 PHPUnit — Policies

| ID | Cas de test | Fichier | Priorité |
|----|-------------|---------|----------|
| U-P01 | UTILISATEUR peut créer une saisie pour lui-même | `TimeEntryPolicyTest` | P0 |
| U-P02 | UTILISATEUR ne peut pas créer une saisie pour autrui | `TimeEntryPolicyTest` | P0 |
| U-P03 | UTILISATEUR peut modifier sa propre saisie | `TimeEntryPolicyTest` | P0 |
| U-P04 | UTILISATEUR ne peut pas modifier la saisie d'un autre | `TimeEntryPolicyTest` | P0 |
| U-P05 | UTILISATEUR ne peut pas créer un projet | `ProjectPolicyTest` | P1 |
| U-P06 | UTILISATEUR ne peut pas créer un utilisateur | `UserPolicyTest` | P1 |
| U-P07 | UTILISATEUR ne peut pas créer/modifier une activité | `ActivityPolicyTest` | P1 |

### ⚛️ Vitest — Composants saisie

| ID | Cas de test | Fichier | Priorité |
|----|-------------|---------|----------|
| U-V01 | `GrilleSemaine` : affiche le spinner pendant le chargement | `GrilleSemaine.test.tsx` | P1 |
| U-V02 | `GrilleSemaine` : affiche les lignes de saisie existantes | `GrilleSemaine.test.tsx` | P0 |
| U-V03 | `LigneSaisie` : saisie valeur 0.5 → mise à jour du store | `LigneSaisie.test.tsx` | P0 |
| U-V04 | `LigneSaisie` : valeur > 1 → erreur de validation | `LigneSaisie.test.tsx` | P1 |
| U-V05 | `TotauxJournaliers` : total != 1.0 → warning affiché | `TotauxJournaliers.test.tsx` | P1 |
| U-V06 | `NavigationSemaine` : boutons précédent/suivant mettent à jour le store | `NavigationSemaine.test.tsx` | P1 |
| U-V07 | `BoutonSauvegarde` : visible si modifications, caché si rien à sauvegarder | `BoutonSauvegarde.test.tsx` | P1 |
| U-V08 | `useSaisieHebdo` : charge les saisies de la semaine au montage | `useSaisieHebdo.test.ts` | P0 |
| U-V09 | `useSaisieHebdo` : `aDesModifications` passe à true après modification | `useSaisieHebdo.test.ts` | P0 |

---

## 3. Rôle MODERATEUR — `marie.dupont@sand.local`

Pages supplémentaires : Supervision (`/supervision`), Stats projet (`/stats-projet`), Projets (`/projets`).
Hérite de tous les tests UTILISATEUR.

### 🎭 E2E — `supervision.spec.ts`

| ID | Cas de test | Priorité |
|----|-------------|----------|
| M-SU01 | Page `/supervision` s'affiche | P0 |
| M-SU02 | La liste des anomalies est visible (ou message "aucune anomalie") | P1 |
| M-SU03 | Lien depuis supervision → ouvre la saisie de l'utilisateur concerné avec `?userId=` | P1 |
| M-SU04 | Lien "Supervision" présent dans la nav | P1 |

### 🎭 E2E — `saisie-moderateur.spec.ts`

| ID | Cas de test | Priorité |
|----|-------------|----------|
| M-S01 | Sélecteur d'utilisateur visible sur `/saisie` | P0 |
| M-S02 | Sélectionner un utilisateur → grille affiche ses saisies | P1 |
| M-S03 | MODERATEUR peut sauvegarder une saisie pour un membre de son équipe | P1 |

### 🎭 E2E — `acces-refuses.spec.ts` (suite modérateur)

| ID | Cas de test | Priorité |
|----|-------------|----------|
| M-A01 | `/admin/utilisateurs` → redirigé vers `/` | P0 |
| M-A02 | `/admin/activites` → redirigé vers `/` | P0 |

### 🧪 PHPUnit — Policies modérateur

| ID | Cas de test | Fichier | Priorité |
|----|-------------|---------|----------|
| M-P01 | MODERATEUR peut créer une saisie pour un utilisateur de son projet | `TimeEntryPolicyTest` | P0 |
| M-P02 | MODERATEUR ne peut pas créer une saisie sur un projet non assigné | `TimeEntryPolicyTest` | P0 |
| M-P03 | MODERATEUR peut modifier les activités de son projet (`manageActivities`) | `ProjectPolicyTest` | P1 |
| M-P04 | MODERATEUR ne peut pas supprimer un projet | `ProjectPolicyTest` | P1 |
| M-P05 | MODERATEUR ne peut pas gérer les modérateurs d'un projet (`manageModerators`) | `ProjectPolicyTest` | P1 |

---

## 4. Rôle ADMIN — `admin@sand.local`

Pages supplémentaires : toutes les routes `/admin/*`, export CSV.
Hérite de tous les tests MODERATEUR.

### 🎭 E2E — `admin-activites.spec.ts`

| ID | Cas de test | Priorité |
|----|-------------|----------|
| A-AC01 | Page `/admin/activites` s'affiche, arbre visible | P0 |
| A-AC02 | Bouton "Nouvelle activité racine" présent | P1 |
| A-AC03 | Switch vers vue texte → textarea peuplé | P0 |
| A-AC04 | Switch vue texte → vue arbre → données fraîches (refetch) *(anti-régression)* | P0 |
| A-AC05 | Vue texte : ajout d'une feuille → prévisualisation montre "Création" | P1 |
| A-AC06 | Vue texte : aucune modification "absenceCode ABS → """  sur les activités système *(anti-régression bug corrigé)* | P0 |
| A-AC07 | Drag and drop : déplacer une activité → ordre mis à jour | P2 |

### 🎭 E2E — `admin-utilisateurs.spec.ts`

| ID | Cas de test | Priorité |
|----|-------------|----------|
| A-U01 | Page `/admin/utilisateurs` s'affiche, liste visible | P0 |
| A-U02 | Bouton "Nouvel utilisateur" présent | P1 |
| A-U03 | Page `/admin/equipes` s'affiche | P1 |
| A-U04 | Page `/admin/configuration` s'affiche | P1 |
| A-U05 | Page `/admin/rgpd` s'affiche | P1 |

### 🧪 PHPUnit — Policies admin

| ID | Cas de test | Fichier | Priorité |
|----|-------------|---------|----------|
| A-P01 | ADMIN peut créer/modifier/supprimer un utilisateur | `UserPolicyTest` | P0 |
| A-P02 | ADMIN ne peut pas se supprimer lui-même | `UserPolicyTest` | P0 |
| A-P03 | ADMIN peut créer/supprimer un projet | `ProjectPolicyTest` | P0 |
| A-P04 | ADMIN peut créer/modifier/supprimer une activité non-système | `ActivityPolicyTest` | P0 |
| A-P05 | ADMIN ne peut pas modifier une activité système | `ActivityPolicyTest` | P0 |
| A-P06 | ADMIN peut réordonner (reorder) toutes les activités | `ActivityPolicyTest` | P1 |

### 🧪 PHPUnit — GraphQL admin

| ID | Cas de test | Fichier | Priorité |
|----|-------------|---------|----------|
| A-G01 | `exportCsv` : démarre un job queue et retourne un ID | `ExportTest` | P1 |
| A-G02 | `exportCsv` : UTILISATEUR ne peut pas déclencher l'export | `ExportTest` | P1 |
| A-G03 | `supervisionAnomalies` : ADMIN voit les anomalies de tous les utilisateurs | `SupervisionTest` | P1 |
| A-G04 | `supervisionAnomalies` : MODERATEUR ne voit que son équipe | `SupervisionTest` | P1 |

### ⚛️ Vitest — Composants admin

| ID | Cas de test | Fichier | Priorité |
|----|-------------|---------|----------|
| A-V01 | `VueTexteActivites` : render initial peuplé avec l'arbre | `VueTexteActivites.test.tsx` | P1 |
| A-V02 | `VueTexteActivites` : texte modifié → bouton "Appliquer" activé | `VueTexteActivites.test.tsx` | P1 |
| A-V03 | `VueTexteActivites` : ajout d'une feuille → diff montre "Création" | `VueTexteActivites.test.tsx` | P0 |
| A-V04 | `VueTexteActivites` : activité système → aucune "Modification" générée *(anti-régression)* | `VueTexteActivites.test.tsx` | P0 |
| A-V05 | `useParserArbreTexte.calculerDiff` : activité système ignorée dans les modifications de code | `useParserArbreTexte.test.ts` | P0 |
| A-V06 | `useParserArbreTexte.validerTexte` : erreur si activité système absente du texte | `useParserArbreTexte.test.ts` | P1 |

---

## Récapitulatif par priorité

### P0 — À implémenter en premier (régressions et accès)

| ID | Description | Type |
|----|-------------|------|
| AUTH-01/02/03 | Authentification de base | 🎭 |
| AUTH-08 | Route protégée sans session | 🎭 |
| U-S01 | Feuille blanche `/saisie` | 🎭 |
| U-S06 | Modale ajout ligne | 🎭 |
| U-A01/02/03 | Accès admin refusé à l'utilisateur | 🎭 |
| U-P01/02/03/04 | TimeEntry Policy UTILISATEUR | 🧪 |
| U-V02 | GrilleSemaine affiche les saisies | ⚛️ |
| U-V08/09 | useSaisieHebdo charge + détecte modifications | ⚛️ |
| M-SU01 | Page supervision accessible au modérateur | 🎭 |
| M-S01 | Sélecteur d'utilisateur visible | 🎭 |
| M-P01/02 | TimeEntry Policy MODERATEUR | 🧪 |
| M-A01/02 | Accès admin refusé au modérateur | 🎭 |
| A-AC01 | Page activités admin accessible | 🎭 |
| A-AC04 | Refetch au switch de vue *(anti-régression)* | 🎭 |
| A-AC06 | Pas de fausse modification sur activité système *(anti-régression)* | 🎭 |
| A-P01/02 | UserPolicy ADMIN | 🧪 |
| A-P04/05 | ActivityPolicy ADMIN | 🧪 |
| A-V04/05 | calculerDiff ignore les activités système | ⚛️ |

### P1 — Sprint 2

Navigation, modération, projets, supervision, composants secondaires.

### P2 — Bonus

Drag and drop, cas limites.

---

## Comptes Playwright à provisionner

```
e2e/.auth/
├── utilisateur.json    # jean.martin@sand.local (déjà fait)
├── moderateur.json     # marie.dupont@sand.local (à créer)
└── admin.json          # admin@sand.local (à créer)
```

Chaque `auth.setup.*.ts` suit le même pattern que l'existant.

Dans `playwright.config.ts`, ajouter deux projets supplémentaires :

```ts
{ name: 'setup-moderateur', testMatch: /auth\.setup\.moderateur\.ts/ },
{ name: 'setup-admin',      testMatch: /auth\.setup\.admin\.ts/ },
{
  name: 'chromium-moderateur',
  use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/moderateur.json' },
  dependencies: ['setup-moderateur'],
},
{
  name: 'chromium-admin',
  use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
  dependencies: ['setup-admin'],
},
```
