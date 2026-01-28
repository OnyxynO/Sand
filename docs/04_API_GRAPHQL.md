# SAND - API GraphQL

> Schéma complet de l'API GraphQL (Lighthouse)

---

## 1. Types principaux

### 1.1 User

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  team: Team
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  timeEntries(
    startDate: Date
    endDate: Date
    projectId: ID
  ): [TimeEntry!]!

  notifications(unreadOnly: Boolean): [Notification!]!
  moderatedProjects: [Project!]!
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}
```

### 1.2 Team

```graphql
type Team {
  id: ID!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  users: [User!]!
}
```

### 1.3 Project

```graphql
type Project {
  id: ID!
  name: String!
  description: String
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  moderators: [User!]!
  enabledActivities: [Activity!]!

  # Stats
  totalTime(startDate: Date!, endDate: Date!): Float!
}
```

### 1.4 Activity

```graphql
type Activity {
  id: ID!
  name: String!
  path: String!           # Chemin matérialisé "1.2.3"
  sortOrder: Int!
  isActive: Boolean!
  isSystem: Boolean!      # true pour "Absence"
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  parent: Activity
  children: [Activity!]!

  # Computed
  depth: Int!             # Niveau de profondeur (0 = racine)
  isLeaf: Boolean!        # true si pas d'enfants
  fullPath: [Activity!]!  # Chemin complet depuis la racine
}
```

### 1.5 TimeEntry

```graphql
type TimeEntry {
  id: ID!
  date: Date!
  duration: Float!        # DECIMAL(3,2) - max 2 décimales
  comment: String
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  user: User!
  project: Project!
  activity: Activity!
  logs: [TimeEntryLog!]!
}

type TimeEntryLog {
  id: ID!
  action: LogAction!
  oldValue: JSON
  newValue: JSON
  createdAt: DateTime!

  # Relations
  user: User!             # Qui a fait la modification
  timeEntry: TimeEntry!
}

enum LogAction {
  CREATE
  UPDATE
  DELETE
}
```

### 1.6 Absence

```graphql
type Absence {
  id: ID!
  date: Date!
  duration: Float!        # 0.5 ou 1.0
  source: AbsenceSource!
  externalId: String      # Référence système RH
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  user: User!
}

enum AbsenceSource {
  EXTERNAL
  MANUAL
}
```

### 1.7 Notification

```graphql
type Notification {
  id: ID!
  type: NotificationType!
  data: JSON!
  isRead: Boolean!
  createdAt: DateTime!

  # Relations
  user: User!
}

enum NotificationType {
  INCOMPLETE_DAY       # Total ≠ 1.0
  ABSENCE_CONFLICT     # Conflit absence/saisie
  WEEK_EMPTY          # Semaine sans saisie
  EXPORT_READY        # Export CSV prêt
}
```

### 1.8 Setting

```graphql
type Setting {
  key: String!
  value: JSON!
  updatedAt: DateTime!
}
```

---

## 2. Types pour les statistiques

```graphql
type Statistics {
  totalTime: Float!
  byProject: [ProjectStat!]!
  byActivity: [ActivityStat!]!
  byUser: [UserStat!]!
  byDay: [DayStat!]!
}

type ProjectStat {
  project: Project!
  totalTime: Float!
  percentage: Float!
}

type ActivityStat {
  activity: Activity!
  totalTime: Float!
  percentage: Float!
}

type UserStat {
  user: User!
  totalTime: Float!
  completionRate: Float!  # % de jours complets
}

type DayStat {
  date: Date!
  totalTime: Float!
  isComplete: Boolean!    # total == 1.0
}

type Anomaly {
  id: ID!
  type: AnomalyType!
  user: User!
  date: Date
  week: String            # "2025-W04"
  detail: String!
  project: Project
}

enum AnomalyType {
  INCOMPLETE_DAY
  OVERFLOW_DAY
  EMPTY_WEEK
  ABSENCE_CONFLICT
}
```

---

## 3. Queries

```graphql
type Query {
  # ─── Auth ───────────────────────────────────────
  me: User

  # ─── Users ──────────────────────────────────────
  users(
    teamId: ID
    role: UserRole
    search: String
  ): [User!]! @paginate

  user(id: ID!): User

  # ─── Teams ──────────────────────────────────────
  teams: [Team!]!
  team(id: ID!): Team

  # ─── Projects ───────────────────────────────────
  projects(
    active: Boolean
    moderatorId: ID
  ): [Project!]!

  project(id: ID!): Project

  # ─── Activities ─────────────────────────────────
  # Arborescence complète (admin)
  activityTree: [Activity!]!

  # Activités disponibles pour l'utilisateur courant sur un projet
  availableActivities(projectId: ID!): [Activity!]!

  activity(id: ID!): Activity

  # ─── Time Entries ───────────────────────────────
  timeEntries(
    userId: ID
    projectId: ID
    activityId: ID
    startDate: Date!
    endDate: Date!
  ): [TimeEntry!]!

  # Saisies de la semaine pour l'utilisateur courant
  myWeekEntries(week: String!): [TimeEntry!]!

  # ─── Absences ───────────────────────────────────
  absences(
    userId: ID
    startDate: Date!
    endDate: Date!
  ): [Absence!]!

  # ─── Notifications ──────────────────────────────
  myNotifications(
    unreadOnly: Boolean
    limit: Int
  ): [Notification!]!

  unreadNotificationCount: Int!

  # ─── Statistics ─────────────────────────────────
  statistics(
    projectId: ID
    teamId: ID
    userId: ID
    startDate: Date!
    endDate: Date!
  ): Statistics!

  # ─── Supervision ────────────────────────────────
  anomalies(
    projectId: ID
    teamId: ID
    userId: ID
    startDate: Date!
    endDate: Date!
    types: [AnomalyType!]
  ): [Anomaly!]!

  # ─── Settings ───────────────────────────────────
  settings: [Setting!]!
  setting(key: String!): Setting
}
```

---

## 4. Mutations

### 4.1 Authentification

```graphql
type Mutation {
  # ─── Auth ───────────────────────────────────────
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!

  # Pour Sanctum SPA, le login utilise les cookies
}

input LoginInput {
  email: String!
  password: String!
}

type AuthPayload {
  user: User!
}
```

### 4.2 Users (Admin)

```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  restoreUser(id: ID!): User!
}

input CreateUserInput {
  email: String!
  password: String!
  name: String!
  role: UserRole!
  teamId: ID
}

input UpdateUserInput {
  email: String
  password: String
  name: String
  role: UserRole
  teamId: ID
}
```

### 4.3 Teams (Admin)

```graphql
type Mutation {
  createTeam(input: TeamInput!): Team!
  updateTeam(id: ID!, input: TeamInput!): Team!
  deleteTeam(id: ID!): Boolean!
}

input TeamInput {
  name: String!
}
```

### 4.4 Projects (Admin)

```graphql
type Mutation {
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
  restoreProject(id: ID!): Project!

  # Gestion des modérateurs
  addProjectModerator(projectId: ID!, userId: ID!): Project!
  removeProjectModerator(projectId: ID!, userId: ID!): Project!

  # Activation des activités (tri-state)
  setProjectActivities(
    projectId: ID!
    activityIds: [ID!]!
    enabled: Boolean!
  ): Project!

  # Visibilité par utilisateur
  setActivityVisibility(
    projectId: ID!
    activityId: ID!
    userId: ID!
    visible: Boolean!
  ): Boolean!
}

input CreateProjectInput {
  name: String!
  description: String
  isActive: Boolean
  moderatorIds: [ID!]
  enabledActivityIds: [ID!]
}

input UpdateProjectInput {
  name: String
  description: String
  isActive: Boolean
}
```

### 4.5 Activities (Admin)

```graphql
type Mutation {
  createActivity(input: CreateActivityInput!): Activity!
  updateActivity(id: ID!, input: UpdateActivityInput!): Activity!
  deleteActivity(id: ID!): Boolean!
  restoreActivity(id: ID!): Activity!

  # Réorganisation de l'arborescence
  moveActivity(id: ID!, parentId: ID, sortOrder: Int!): Activity!
  reorderActivities(ids: [ID!]!): [Activity!]!
}

input CreateActivityInput {
  name: String!
  parentId: ID
  sortOrder: Int
  isActive: Boolean
}

input UpdateActivityInput {
  name: String
  parentId: ID
  sortOrder: Int
  isActive: Boolean
}
```

### 4.6 Time Entries

```graphql
type Mutation {
  createTimeEntry(input: TimeEntryInput!): TimeEntry!
  updateTimeEntry(id: ID!, input: TimeEntryInput!): TimeEntry!
  deleteTimeEntry(id: ID!): Boolean!

  # Saisie rapide (plusieurs entrées d'un coup)
  bulkCreateTimeEntries(inputs: [TimeEntryInput!]!): [TimeEntry!]!
  bulkUpdateTimeEntries(entries: [BulkUpdateEntry!]!): [TimeEntry!]!
}

input TimeEntryInput {
  projectId: ID!
  activityId: ID!
  date: Date!
  duration: Float!    # Validation: 0.01 ≤ x ≤ 1.00, max 2 décimales
  comment: String
}

input BulkUpdateEntry {
  id: ID!
  duration: Float!
  comment: String
}
```

### 4.7 Absences

```graphql
type Mutation {
  # Import depuis API RH
  syncAbsences(
    userId: ID
    startDate: Date!
    endDate: Date!
  ): SyncResult!

  # Saisie manuelle
  createAbsence(input: AbsenceInput!): Absence!
  deleteAbsence(id: ID!): Boolean!

  # Résolution de conflit
  resolveAbsenceConflict(
    absenceId: ID!
    resolution: ConflictResolution!
  ): Boolean!
}

input AbsenceInput {
  userId: ID!
  date: Date!
  duration: Float!    # 0.5 ou 1.0
}

enum ConflictResolution {
  OVERWRITE   # Écraser les saisies existantes
  IGNORE      # Ignorer l'absence
  ADJUST      # Garder les deux (dépassement accepté)
}

type SyncResult {
  imported: Int!
  conflicts: Int!
  errors: [String!]!
}
```

### 4.8 Notifications

```graphql
type Mutation {
  markNotificationRead(id: ID!): Notification!
  markAllNotificationsRead: Boolean!
  deleteNotification(id: ID!): Boolean!
}
```

### 4.9 Settings (Admin)

```graphql
type Mutation {
  updateSetting(key: String!, value: JSON!): Setting!
  updateSettings(settings: [SettingInput!]!): [Setting!]!
}

input SettingInput {
  key: String!
  value: JSON!
}
```

### 4.10 Export

```graphql
type Mutation {
  # Lance un export asynchrone
  requestExport(input: ExportInput!): ExportJob!
}

input ExportInput {
  format: ExportFormat!
  startDate: Date!
  endDate: Date!
  projectId: ID
  teamId: ID
  userId: ID
}

enum ExportFormat {
  CSV
}

type ExportJob {
  id: ID!
  status: ExportStatus!
  downloadUrl: String      # Disponible quand COMPLETED
  expiresAt: DateTime      # URL expire après X heures
}

enum ExportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 5. Subscriptions (optionnel, pas en v1)

```graphql
# Non implémenté en v1 (notifications au chargement uniquement)
# Prévu pour évolution future

type Subscription {
  notificationReceived: Notification!
  timeEntryUpdated(userId: ID!): TimeEntry!
}
```

---

## 6. Scalaires personnalisés

```graphql
scalar Date        # Format: "2025-01-27"
scalar DateTime    # Format: "2025-01-27T14:30:00Z"
scalar JSON        # Objet JSON flexible
```

---

## 7. Directives Lighthouse

```graphql
# Pagination
type Query {
  users: [User!]! @paginate(defaultCount: 20)
}

# Autorisation
type Mutation {
  createProject: Project! @can(ability: "create", model: "Project")
  updateProject: Project! @can(ability: "update", find: "id")
}

# Validation
input TimeEntryInput {
  duration: Float! @rules(apply: ["numeric", "min:0.01", "max:1", "decimal:0,2"])
}

# Soft deletes
type Query {
  users: [User!]! @softDeletes
}
```

---

## 8. Exemples de requêtes

### 8.1 Récupérer la semaine courante

```graphql
query MyWeek($week: String!) {
  myWeekEntries(week: $week) {
    id
    date
    duration
    comment
    project {
      id
      name
    }
    activity {
      id
      name
      fullPath {
        name
      }
    }
  }
}
```

### 8.2 Sauvegarder une saisie

```graphql
mutation SaveEntry($input: TimeEntryInput!) {
  createTimeEntry(input: $input) {
    id
    date
    duration
    project { name }
    activity { name }
  }
}
```

### 8.3 Récupérer l'arborescence pour un projet

```graphql
query ProjectActivities($projectId: ID!) {
  availableActivities(projectId: $projectId) {
    id
    name
    path
    depth
    isLeaf
    parent { id }
    children { id name }
  }
}
```

### 8.4 Statistiques d'un projet

```graphql
query ProjectStats($projectId: ID!, $start: Date!, $end: Date!) {
  statistics(projectId: $projectId, startDate: $start, endDate: $end) {
    totalTime
    byActivity {
      activity { name }
      totalTime
      percentage
    }
    byUser {
      user { name }
      totalTime
      completionRate
    }
  }
}
```

---

*Document v1.0 - Janvier 2025*
