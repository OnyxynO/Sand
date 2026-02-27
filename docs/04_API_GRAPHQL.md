# API GraphQL — SAND

> Généré depuis le schéma Lighthouse réel (`php artisan lighthouse:print-schema`).
> Dernière mise à jour : 2026-02-27.

**Endpoint** : `POST http://localhost:8080/graphql`
**Playground** : `http://localhost:8080/graphiql`

---

## Authentification

L'API utilise **Sanctum SPA avec cookies HttpOnly** (pas de Bearer token).

Avant tout appel, récupérer le cookie CSRF :

```
GET http://localhost:8080/sanctum/csrf-cookie
```

Puis inclure le header `X-XSRF-TOKEN` à chaque mutation, et envoyer les requêtes avec `credentials: 'include'`.

> ⚠️ Après la mutation `login`, le cookie `XSRF-TOKEN` est régénéré avec la nouvelle session. Relire ce cookie et mettre à jour le header `X-XSRF-TOKEN` avant d'envoyer d'autres mutations.

---

## Règles métier communes

| Règle | Détail |
|-------|--------|
| **ETP** | Durée en équivalent temps plein — décimal entre `0.01` et `1.00`, max 2 décimales |
| **Unicité** | Une seule saisie par `(utilisateur, date, projet, activité)` |
| **Activités saisissables** | Uniquement les feuilles (`estFeuille: true`) |
| **Activité Absence** | Protégée (`estSysteme: true`) — gérée par le système, non saisissable manuellement |
| **Soft delete** | Users, Projects, Activities, TimeEntries — restaurables |

---

## Rôles et droits d'accès

| Rôle | Accès |
|------|-------|
| `UTILISATEUR` | Ses propres saisies, lecture de ses projets/activités/absences |
| `MODERATEUR` | Saisies de son équipe, gestion des projets assignés |
| `ADMIN` | Configuration complète (utilisateurs, projets, activités, paramètres, RGPD) |

---

## Scalaires

| Scalaire | Format | Exemple |
|----------|--------|---------|
| `Date` | `YYYY-MM-DD` | `"2026-02-19"` |
| `DateTime` | `YYYY-MM-DD HH:MM:SS` | `"2026-02-19 14:30:00"` |
| `JSON` | Objet/tableau JSON libre | `{"key": "value"}` |

---

## Types principaux

### User

```graphql
type User {
  id: ID!
  matricule: String        # Matricule RH (optionnel)
  nom: String!
  prenom: String!
  nomComplet: String!      # prenom + nom (calculé)
  email: String!
  role: UserRole!
  estActif: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  equipe: Team
  projets: [Project!]!
  projetsModeres: [Project!]!
  saisies(dateDebut: Date, dateFin: Date, projectId: ID): [TimeEntry!]!
  absences(dateDebut: Date, dateFin: Date): [Absence!]!
  notifications(nonLuSeulement: Boolean): [Notification!]!
}

enum UserRole {
  UTILISATEUR   # Saisie personnelle uniquement
  MODERATEUR    # Gestion équipe et projets assignés
  ADMIN         # Configuration globale
}
```

### Team

```graphql
type Team {
  id: ID!
  nom: String!
  code: String!
  description: String
  estActif: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  membres: [User!]!
}
```

### Project

```graphql
type Project {
  id: ID!
  nom: String!
  code: String!
  description: String
  dateDebut: Date
  dateFin: Date
  estActif: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  utilisateurs: [User!]!
  moderateurs: [User!]!
  activitesActives: [Activity!]!   # Activités explicitement activées
  saisies(dateDebut: Date, dateFin: Date): [TimeEntry!]!
  tempsTotal(dateDebut: Date!, dateFin: Date!): Float!
}
```

### Activity

```graphql
type Activity {
  id: ID!
  nom: String!
  code: String
  description: String
  chemin: String!        # Chemin ltree PostgreSQL (ex: "1.2.3")
  niveau: Int!           # Profondeur dans l'arbre (0 = racine)
  ordre: Int!            # Ordre parmi les frères
  estFeuille: Boolean!   # true = saisissable
  estSysteme: Boolean!   # true = protégé (ex: "Absence")
  estActif: Boolean!
  cheminComplet: String! # Noms complets (ex: "Dev > Backend > API")
  createdAt: DateTime!
  updatedAt: DateTime!

  parent: Activity
  enfants: [Activity!]!
  projets: [Project!]!
}
```

### TimeEntry

```graphql
type TimeEntry {
  id: ID!
  date: Date!
  duree: Float!          # ETP — 0.01 à 1.00
  commentaire: String
  createdAt: DateTime!
  updatedAt: DateTime!

  utilisateur: User!
  projet: Project!
  activite: Activity!
  historique: [TimeEntryLog!]!
}

type TimeEntryLog {
  id: ID!
  action: LogAction!         # CREATION | MODIFICATION | SUPPRESSION
  ancienneDuree: Float
  nouvelleDuree: Float
  ancienCommentaire: String
  nouveauCommentaire: String
  createdAt: DateTime!

  auteur: User!
  saisie: TimeEntry!
}
```

### Absence

```graphql
type Absence {
  id: ID!
  type: String!              # Code type (ex: "CP", "RTT", "MALADIE")
  typeLibelle: String!       # Libellé lisible
  dateDebut: Date!
  dateFin: Date!
  dureeJournaliere: Float!   # 0.5 (demi-journée) ou 1.0 (journée entière)
  statut: String!
  referenceExterne: String   # Référence système RH
  importeLe: DateTime
  nombreJours: Int!          # Calculé
  totalEtp: Float!           # Calculé : nombreJours × dureeJournaliere
  createdAt: DateTime!
  updatedAt: DateTime!

  utilisateur: User!
}
```

### Notification

```graphql
type Notification {
  id: ID!
  type: String!
  titre: String!
  message: String!
  donnees: JSON              # Données contextuelles (ex: IDs des saisies en conflit)
  estLu: Boolean!
  luLe: DateTime
  createdAt: DateTime!

  utilisateur: User!
}

enum NotificationType {
  SAISIE_INCOMPLETE    # Total jour ≠ 1.0 ETP
  ABSENCE_IMPORTEE     # Nouvelle absence depuis l'API RH
  CONFLIT_ABSENCE      # Conflit entre absence et saisies existantes
  EXPORT_PRET          # Export CSV disponible
  SYSTEME              # Notification générale
}
```

### Setting

```graphql
type Setting {
  id: ID!
  cle: String!
  valeur: JSON!
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Anomaly

```graphql
type Anomaly {
  type: AnomalyType!
  date: Date!
  detail: String!        # Description lisible (ex: "Total ETP = 0.8 sur 5 saisies")
  utilisateur: User!
  projet: Project
}
```

---

## Queries

### Authentification

```graphql
# Utilisateur connecté (null si non authentifié)
me: User
```

### Utilisateurs

```graphql
# Liste paginée (Admin)
users(
  equipeId: ID
  role: UserRole
  search: String            # Recherche partielle sur le nom
  actifSeulement: Boolean
  first: Int = 20           # Taille de page
  page: Int
): UserPaginator!

# Un utilisateur par ID
user(id: ID!): User

# Utilisateurs dont le modérateur peut gérer les saisies
utilisateursModerables: [User!]!
```

**Pagination** :

```graphql
type UserPaginator {
  paginatorInfo: PaginatorInfo!  # total, lastPage, currentPage...
  data: [User!]!
}
```

### Équipes

```graphql
equipes(actifSeulement: Boolean): [Team!]!
equipe(id: ID!): Team
```

### Projets

```graphql
projets(actif: Boolean, moderateurId: ID): [Project!]!
projet(id: ID!): Project
```

### Activités

```graphql
# Arborescence complète (Admin — tous les niveaux)
arbreActivites: [Activity!]!

# Activités disponibles pour l'utilisateur courant sur un projet
activitesDisponibles(projetId: ID!): [Activity!]!

activite(id: ID!): Activity
```

### Saisies

```graphql
# Liste filtrée (droits vérifiés côté serveur)
saisies(
  userId: ID
  projetId: ID
  activiteId: ID
  dateDebut: Date!
  dateFin: Date!
): [TimeEntry!]!

# Saisies de la semaine (format ISO : "2026-W08")
mesSaisiesSemaine(semaine: String!, userId: ID): [TimeEntry!]!
```

### Absences

```graphql
# Resolver custom — détecte les chevauchements de période
absences(userId: ID, dateDebut: Date!, dateFin: Date!): [Absence!]!
```

### Notifications

```graphql
mesNotifications(nonLuSeulement: Boolean, limite: Int): [Notification!]!
nombreNotificationsNonLues: Int!
```

### Statistiques

```graphql
statistiques(
  projetId: ID
  equipeId: ID
  userId: ID
  dateDebut: Date!
  dateFin: Date!
): Statistics!

type Statistics {
  tempsTotal: Float!
  parProjet:      [ProjectStat!]!
  parActivite:    [ActivityStat!]!
  parUtilisateur: [UserStat!]!    # Modérateurs/Admins uniquement
  parJour:        [DayStat!]!
}
```

### Supervision

```graphql
anomalies(
  projetId: ID
  equipeId: ID
  userId: ID
  dateDebut: Date!
  dateFin: Date!
  types: [AnomalyType!]
): [Anomaly!]!

enum AnomalyType {
  JOUR_INCOMPLET       # Total ETP < 1.0
  JOUR_DEPASSE         # Total ETP > 1.0
  SEMAINE_VIDE         # Aucune saisie sur la semaine
  CONFLIT_ABSENCE      # Conflit absence/saisie
  JOUR_MANQUANT        # Jour ouvré sans saisie
  SAISIE_SUR_ABSENCE   # Saisie sur un jour d'absence
}
```

### Paramètres

```graphql
parametres: [Setting!]!
parametre(cle: String!): Setting

# Visibilité par utilisateur sur un projet
restrictionsVisibilite(projetId: ID!): [ActivityVisibility!]!
```

---

## Mutations

### Authentification

```graphql
login(input: LoginInput!): AuthPayload!
logout: Boolean!

# Demande de réinitialisation (accessible sans authentification)
# Retourne toujours true — ne révèle pas si l'email est inscrit (anti-OAT-013)
demanderReinitialisationMdp(input: DemanderReinitialisationMdpInput!): Boolean!

# Réinitialisation du mot de passe via token reçu par email
reinitialiserMdp(input: ReinitialisationMdpInput!): Boolean!

input LoginInput {
  email: String!    # required, email, max:80
  password: String! # required, min:6, max:80
}

input DemanderReinitialisationMdpInput {
  email: String!    # required, email, max:80
}

input ReinitialisationMdpInput {
  token: String!
  email: String!                 # required, email, max:80
  password: String!              # required, min:8, max:80, confirmed
  password_confirmation: String! # required, max:80
}

type AuthPayload {
  user: User!
  # Pas de token — auth via cookies Sanctum HttpOnly
}
```

### Saisies de temps

```graphql
createTimeEntry(input: TimeEntryInput!): TimeEntry!
updateTimeEntry(id: ID!, input: TimeEntryInput!): TimeEntry!
deleteTimeEntry(id: ID!): Boolean!

# Saisie en lot (sauvegarde d'une semaine entière)
bulkCreateTimeEntries(inputs: [TimeEntryInput!]!): [TimeEntry!]!
bulkUpdateTimeEntries(entries: [BulkUpdateEntry!]!): [TimeEntry!]!

input TimeEntryInput {
  projetId: ID!
  activiteId: ID!
  date: Date!
  duree: Float!           # 0.01 ≤ x ≤ 1.00, 2 décimales max
  commentaire: String     # 1000 caractères max
  userId: ID              # Modérateurs/Admins uniquement
}

input BulkUpdateEntry {
  id: ID!
  duree: Float!
  commentaire: String
}
```

### Absences

```graphql
# Import depuis l'API RH
syncAbsences(userId: ID, dateDebut: Date!, dateFin: Date!): SyncResult!

# Saisie manuelle
createAbsence(input: AbsenceInput!): Absence!
deleteAbsence(id: ID!): Boolean!

# Déclaration manuelle par l'utilisateur lui-même (mode manuel uniquement)
# duree: null ou <= 0 = supprimer l'absence du jour
# type: code du motif (conges_payes | rtt | maladie | formation | autre) — TYPE_AUTRE par défaut
#   - Premier clic sur cellule vide : modale de sélection type + durée
#   - Clic suivant sur absence existante : cycle durée uniquement (type préservé)
# userId: optionnel — réservé aux modérateurs et admins pour déclarer au nom d'un autre utilisateur
# Accessible à tous les rôles authentifiés si mode = 'manuel'
declarerAbsence(date: Date!, duree: Float, type: String, userId: ID): Boolean!

# Test de connexion à l'API RH (modérateur/admin, mode api uniquement)
testerConnexionRhApi: String  # null = OK, message d'erreur si KO

# Résolution de conflit (après import)
resolveAbsenceConflict(
  absenceId: ID!
  resolution: ConflictResolution!
): Boolean!

input AbsenceInput {
  userId: ID!
  type: String!
  dateDebut: Date!
  dateFin: Date!
  dureeJournaliere: Float  # 0.5 ou 1.0 (défaut: 1.0)
}

enum ConflictResolution {
  ECRASER   # Supprime les saisies en conflit
  IGNORER   # Conserve les saisies, ignore l'absence
  AJUSTER   # Non implémenté en v1 — réservé pour une version future
}

type SyncResult {
  importes: Int!
  conflits: Int!
  erreurs: [String!]!
}
```

### Utilisateurs (Admin)

```graphql
createUser(input: CreateUserInput!): User!
updateUser(id: ID!, input: UpdateUserInput!): User!
deleteUser(id: ID!): Boolean!    # Soft delete
restoreUser(id: ID!): User!

input CreateUserInput {
  matricule: String
  nom: String!
  prenom: String!
  email: String!
  password: String!    # 8 caractères minimum
  role: UserRole!
  equipeId: ID
}

input UpdateUserInput {
  matricule: String
  nom: String
  prenom: String
  email: String
  password: String
  role: UserRole
  equipeId: ID
  estActif: Boolean
}
```

### Équipes (Admin)

```graphql
createTeam(input: TeamInput!): Team!
updateTeam(id: ID!, input: TeamInput!): Team!
deleteTeam(id: ID!): Boolean!

input TeamInput {
  nom: String!
  code: String!
  description: String
  estActif: Boolean
}
```

### Projets (Admin)

```graphql
createProject(input: CreateProjectInput!): Project!
updateProject(id: ID!, input: UpdateProjectInput!): Project!
deleteProject(id: ID!): Boolean!
restoreProject(id: ID!): Project!

# Modérateurs
addProjectModerator(projetId: ID!, userId: ID!): Project!
removeProjectModerator(projetId: ID!, userId: ID!): Project!

# Affectation des utilisateurs
addProjectUser(projetId: ID!, userId: ID!): Project!
removeProjectUser(projetId: ID!, userId: ID!): Project!

# Activités actives sur le projet (système tri-state)
setProjectActivities(projetId: ID!, activiteIds: [ID!]!): Project!

# Visibilité par utilisateur
hideActivityForUser(projetId: ID!, activiteId: ID!, userId: ID!): Boolean!
showActivityForUser(projetId: ID!, activiteId: ID!, userId: ID!): Boolean!

input CreateProjectInput {
  nom: String!
  code: String!
  description: String
  dateDebut: Date
  dateFin: Date
  estActif: Boolean
  moderateurIds: [ID!]
  activiteIds: [ID!]
}

input UpdateProjectInput {
  nom: String
  code: String
  description: String
  dateDebut: Date
  dateFin: Date
  estActif: Boolean
}
```

### Activités (Admin)

```graphql
createActivity(input: CreateActivityInput!): Activity!
updateActivity(id: ID!, input: UpdateActivityInput!): Activity!
deleteActivity(id: ID!): Boolean!
restoreActivity(id: ID!): Activity!

# Déplacement dans l'arborescence (drag & drop)
moveActivity(id: ID!, parentId: ID, ordre: Int!): Activity!
reorderActivities(ids: [ID!]!): [Activity!]!

input CreateActivityInput {
  nom: String!
  code: String
  description: String
  parentId: ID     # null = racine
  ordre: Int
  estActif: Boolean
}

input UpdateActivityInput {
  nom: String
  code: String
  description: String
  parentId: ID
  ordre: Int
  estActif: Boolean
}
```

### Notifications

```graphql
markNotificationRead(id: ID!): Notification!
markAllNotificationsRead: Boolean!
deleteNotification(id: ID!): Boolean!
supprimerToutesNotifications: Boolean!   # Supprime toutes les notifications de l'utilisateur courant (EV-10)
```

### Export CSV (asynchrone)

```graphql
requestExport(input: ExportInput!): ExportJob!

input ExportInput {
  format: ExportFormat!   # CSV uniquement
  dateDebut: Date!
  dateFin: Date!
  projetId: ID
  equipeId: ID
  userId: ID
}

type ExportJob {
  id: ID!
  statut: ExportStatus!
  urlTelechargement: String   # Disponible quand statut = TERMINE
  expireLe: DateTime
}

enum ExportStatus {
  EN_ATTENTE   # Dans la queue Redis
  EN_COURS     # En cours de génération
  TERMINE      # Prêt à télécharger
  ECHEC        # Erreur de génération
}
```

> Le fichier CSV est accessible via `GET /exports/{id}/download` (route web authentifiée).

### Paramètres (Admin)

```graphql
updateSetting(cle: String!, valeur: JSON!): Setting!
updateSettings(settings: [SettingInput!]!): [Setting!]!
resetSettings: [Setting!]!    # Remet les valeurs par défaut

input SettingInput {
  cle: String!
  valeur: JSON!
}
```

### RGPD (Admin)

```graphql
# Droit à l'oubli — supprime les données d'un utilisateur
supprimerDonneesUtilisateur(
  userId: ID!
  confirmationNom: String!    # Nom complet de l'utilisateur (protection contre les erreurs)
): ResultatSuppressionRgpd!

# Purge totale de toutes les données transactionnelles
purgerToutesDonnees(
  confirmationPhrase: String! # "PURGER TOUTES LES DONNEES"
): ResultatPurge!

type ResultatSuppressionRgpd {
  saisiesSupprimees: Int!
  absencesSupprimees: Int!
  notificationsSupprimees: Int!
  exportsSupprimees: Int!
  logsAnonymises: Int!
}

type ResultatPurge {
  saisiesSupprimees: Int!
  logsSupprimees: Int!
  absencesSupprimees: Int!
  notificationsSupprimees: Int!
  exportsSupprimees: Int!
}
```

---

## Exemples

### Connexion

```graphql
mutation {
  login(input: { email: "admin@sand.local", password: "password" }) {
    user {
      id
      nomComplet
      role
    }
  }
}
```

### Saisies de la semaine courante

```graphql
query {
  mesSaisiesSemaine(semaine: "2026-W08") {
    id
    date
    duree
    commentaire
    projet { nom code }
    activite { nom cheminComplet }
  }
}
```

### Sauvegarder plusieurs saisies

```graphql
mutation SauvegarderSemaine($inputs: [TimeEntryInput!]!) {
  bulkCreateTimeEntries(inputs: $inputs) {
    id
    date
    duree
  }
}
```

Variables :

```json
{
  "inputs": [
    { "projetId": "1", "activiteId": "5", "date": "2026-02-17", "duree": 0.5 },
    { "projetId": "1", "activiteId": "5", "date": "2026-02-18", "duree": 1.0 }
  ]
}
```

### Arborescence des activités

```graphql
query {
  arbreActivites {
    id
    nom
    chemin
    niveau
    estFeuille
    estSysteme
    estActif
    enfants {
      id
      nom
      estFeuille
      enfants {
        id
        nom
        estFeuille
      }
    }
  }
}
```

### Statistiques par projet

```graphql
query Stats($debut: Date!, $fin: Date!) {
  statistiques(dateDebut: $debut, dateFin: $fin) {
    tempsTotal
    parProjet {
      projet { nom code }
      tempsTotal
      pourcentage
    }
    parActivite {
      activite { nom cheminComplet }
      tempsTotal
      pourcentage
    }
  }
}
```

### Supervision — anomalies de la semaine

```graphql
query {
  anomalies(
    dateDebut: "2026-02-16"
    dateFin: "2026-02-22"
    types: [JOUR_INCOMPLET, SEMAINE_VIDE]
  ) {
    type
    date
    detail
    utilisateur { nomComplet equipe { nom } }
    projet { nom }
  }
}
```

### Import d'absences et résolution de conflit

```graphql
# 1. Import
mutation {
  syncAbsences(userId: "3", dateDebut: "2026-02-01", dateFin: "2026-02-28") {
    importes
    conflits
    erreurs
  }
}

# 2. Résolution si conflits détectés (notif CONFLIT_ABSENCE reçue)
mutation {
  resolveAbsenceConflict(absenceId: "12", resolution: ECRASER)
}
```

---

## Schéma complet

Pour exporter le schéma SDL à jour :

```bash
docker compose exec app php artisan lighthouse:print-schema > docs/schema.graphql
```
