# SAND - Architecture

> Diagrammes au format Mermaid - rendus automatiquement sur GitHub/GitLab

---

## 1. Architecture générale (C4 - Contexte)

```mermaid
flowchart TB
    subgraph Users["Utilisateurs"]
        U1[👤 Utilisateur]
        U2[👤 Modérateur]
        U3[👤 Admin]
    end

    subgraph SAND["SAND - Application"]
        FE[🖥️ Frontend React]
        BE[⚙️ Backend Laravel]
        DB[(🗄️ PostgreSQL)]
        CACHE[(📦 Redis)]
    end

    subgraph External["Services Externes"]
        RH[🏢 API RH<br/>Absences/Congés]
    end

    U1 & U2 & U3 --> FE
    FE <-->|GraphQL| BE
    BE <--> DB
    BE <--> CACHE
    BE <-->|REST/LDAP| RH

    style SAND fill:#e1f5fe
    style External fill:#fff3e0
```

---

## 2. Architecture technique (C4 - Container)

```mermaid
flowchart LR
    subgraph Client["Client (Browser)"]
        REACT[React 18<br/>+ Apollo Client<br/>+ Zustand]
    end

    subgraph Server["Serveur"]
        NGINX[Nginx<br/>Reverse Proxy]
        PHP[PHP-FPM<br/>Laravel 11]
        LIGHTHOUSE[Lighthouse<br/>GraphQL]
    end

    subgraph Data["Données"]
        PG[(PostgreSQL 16)]
        REDIS[(Redis<br/>Cache + Queue)]
    end

    subgraph Jobs["Background"]
        WORKER[Laravel Worker<br/>Queue Jobs]
    end

    REACT <-->|HTTPS| NGINX
    NGINX --> PHP
    PHP --> LIGHTHOUSE
    LIGHTHOUSE <--> PG
    PHP <--> REDIS
    WORKER <--> REDIS
    WORKER <--> PG

    style Client fill:#c8e6c9
    style Server fill:#bbdefb
    style Data fill:#ffe0b2
    style Jobs fill:#f3e5f5
```

---

## 3. Modèle de données (ERD)

```mermaid
erDiagram
    TEAM ||--o{ USER : "appartient à"
    USER ||--o{ TIME_ENTRY : "saisit"
    USER ||--o{ NOTIFICATION : "reçoit"
    USER }o--o{ PROJECT : "modère"

    PROJECT ||--o{ TIME_ENTRY : "concerne"
    PROJECT ||--o{ PROJECT_ACTIVITY : "active"
    PROJECT ||--o{ ACTIVITY_VISIBILITY : "configure"

    ACTIVITY ||--o{ ACTIVITY : "parent"
    ACTIVITY ||--o{ TIME_ENTRY : "type"
    ACTIVITY ||--o{ PROJECT_ACTIVITY : "activée dans"
    ACTIVITY ||--o{ ACTIVITY_VISIBILITY : "visible pour"

    USER ||--o{ ABSENCE : "a"
    USER ||--o{ TIME_ENTRY_LOG : "modifie"
    TIME_ENTRY ||--o{ TIME_ENTRY_LOG : "historique"

    TEAM {
        uuid id PK
        string name
        timestamp created_at
        timestamp updated_at
    }

    USER {
        uuid id PK
        string email UK
        string password
        string name
        enum role "user|moderator|admin"
        uuid team_id FK
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    PROJECT {
        uuid id PK
        string name
        text description
        boolean is_active
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    ACTIVITY {
        uuid id PK
        string nom
        uuid parent_id FK
        ltree chemin "ltree PostgreSQL"
        int ordre
        boolean est_feuille
        boolean est_actif
        boolean est_systeme
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_ACTIVITY {
        uuid project_id PK,FK
        uuid activity_id PK,FK
        boolean is_enabled
    }

    ACTIVITY_VISIBILITY {
        uuid project_id PK,FK
        uuid activity_id PK,FK
        uuid user_id PK,FK
        boolean is_visible
    }

    TIME_ENTRY {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        uuid activity_id FK
        date date
        decimal duration "max 2 decimals"
        text comment
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    TIME_ENTRY_LOG {
        uuid id PK
        uuid time_entry_id FK
        uuid user_id FK
        enum action "create|update|delete"
        jsonb old_value
        jsonb new_value
        timestamp created_at
    }

    ABSENCE {
        uuid id PK
        uuid user_id FK
        date date
        decimal duration "0.5 or 1.0"
        enum source "external|manual"
        string external_id
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK
        string type
        jsonb data
        boolean is_read
        timestamp created_at
    }

    SETTING {
        string key PK
        jsonb value
        timestamp updated_at
    }
```

---

## 4. Arborescence des activités

```mermaid
flowchart TB
    subgraph Global["Arborescence Globale (Admin)"]
        DEV[📁 Développement]
        DEV --> BE[📁 Backend]
        DEV --> FE[📁 Frontend]
        DEV --> TEST[📄 Tests]

        BE --> API[📄 API]
        BE --> BDD[📄 Base de données]

        FE --> INT[📄 Intégration]
        FE --> COMP[📄 Composants]

        GP[📁 Gestion projet]
        GP --> REU[📄 Réunion]
        GP --> PLAN[📄 Planification]
        GP --> REP[📄 Reporting]

        SUP[📁 Support]
        SUP --> TIC[📄 Tickets]
        SUP --> DOC[📄 Documentation]

        ABS[🔒 Absence]
    end

    subgraph Legend["Légende"]
        L1[📁 Catégorie<br/>non saisissable]
        L2[📄 Activité<br/>saisissable]
        L3[🔒 Système<br/>toujours actif]
    end

    style ABS fill:#ffcdd2
    style Legend fill:#f5f5f5
```

---

## 5. Flux de saisie hebdomadaire

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as Frontend
    participant API as GraphQL API
    participant DB as PostgreSQL

    U->>FE: Ouvre la saisie (semaine courante)
    FE->>API: query { timeEntries(week: "2025-W04") }
    API->>DB: SELECT * FROM time_entries WHERE date BETWEEN ...
    DB-->>API: Saisies existantes
    API-->>FE: [TimeEntry, ...]
    FE-->>U: Affiche la grille

    U->>FE: Saisit 0.5 sur "API" / Projet Alpha / Lundi
    FE->>FE: Validation locale (2 décimales, ≤ 1.0)
    FE->>API: mutation { createTimeEntry(...) }
    API->>API: Vérifie unicité (user/date/activity/project)
    API->>DB: INSERT INTO time_entries
    API->>DB: INSERT INTO time_entry_logs (action: CREATE)
    DB-->>API: OK
    API-->>FE: TimeEntry créé
    FE-->>U: Mise à jour grille + total jour

    U->>FE: Modifie la saisie (0.5 → 0.8)
    FE->>API: mutation { updateTimeEntry(id, duration: 0.8) }
    API->>DB: UPDATE time_entries SET duration = 0.8
    API->>DB: INSERT INTO time_entry_logs (action: UPDATE)
    DB-->>API: OK
    API-->>FE: TimeEntry modifié
    FE-->>U: Grille mise à jour
```

---

## 6. Flux d'activation tri-state

```mermaid
stateDiagram-v2
    [*] --> Vide: État initial

    Vide --> ToutActive: Clic checkbox
    ToutActive --> Vide: Clic checkbox

    Indetermine --> ToutActive: Clic checkbox
    ToutActive --> Vide: Clic checkbox

    state Vide {
        [*]: ☐ Aucun enfant activé
    }

    state Indetermine {
        [*]: ☑ Au moins un enfant<br/>(mais pas tous)
    }

    state ToutActive {
        [*]: ✓ Tous les enfants activés
    }

    note right of ToutActive
        Si désactivation massive:
        Toast "X activités désactivées [Annuler]"
        Délai configurable (défaut: 5s)
    end note
```

---

## 7. Flux d'import des absences

```mermaid
flowchart TD
    START([Déclenchement]) --> FETCH[Appel API RH externe]
    FETCH --> PARSE[Parse des absences]
    PARSE --> LOOP{Pour chaque absence}

    LOOP --> CHECK{Saisie existante<br/>ce jour ?}

    CHECK -->|Non| INSERT[Créer TimeEntry<br/>Activité: Absence]
    CHECK -->|Oui| CONFLICT[Conflit détecté]

    CONFLICT --> NOTIF[Créer Notification<br/>pour l'utilisateur]
    NOTIF --> WAIT[Attendre choix user]

    WAIT -->|Écraser| REPLACE[Supprimer saisies<br/>+ Créer absence]
    WAIT -->|Ignorer| SKIP[Ne rien faire]
    WAIT -->|Ajuster| PARTIAL[Créer absence partielle]

    INSERT --> NEXT
    REPLACE --> NEXT
    SKIP --> NEXT
    PARTIAL --> NEXT

    NEXT{Autre absence ?}
    NEXT -->|Oui| LOOP
    NEXT -->|Non| END([Fin])

    style CONFLICT fill:#ffcdd2
    style NOTIF fill:#fff9c4
```

---

## 8. Structure des dossiers

```mermaid
flowchart TB
    subgraph Root["📁 sand/"]
        subgraph Backend["📁 backend/ (Laravel)"]
            APP[📁 app/]
            APP --> MODELS[📁 Models/]
            APP --> GRAPHQL[📁 GraphQL/]
            APP --> POLICIES[📁 Policies/]
            APP --> JOBS[📁 Jobs/]
            APP --> SERVICES[📁 Services/]

            DB_DIR[📁 database/]
            DB_DIR --> MIGRATIONS[📁 migrations/]
            DB_DIR --> SEEDERS[📁 seeders/]
        end

        subgraph Frontend["📁 frontend/ (React)"]
            SRC[📁 src/]
            SRC --> COMPONENTS[📁 components/]
            SRC --> PAGES[📁 pages/]
            SRC --> HOOKS[📁 hooks/]
            SRC --> GRAPHQL_FE[📁 graphql/]
            SRC --> STORES[📁 stores/]
        end

        subgraph Docker["📁 docker/"]
            PHP_D[📁 php/]
            NGINX_D[📁 nginx/]
            NODE_D[📁 node/]
            MOCK[📁 mock-rh/]
        end

        DOCS[📁 docs/]
        COMPOSE[📄 docker-compose.yml]
    end

    style Backend fill:#bbdefb
    style Frontend fill:#c8e6c9
    style Docker fill:#ffe0b2
```

---

## 9. Responsive Design

```mermaid
flowchart LR
    subgraph Desktop["🖥️ Desktop (≥1024px)"]
        D1[Grille semaine complète]
        D2[Sidebar navigation]
        D3[Tableaux complets]
    end

    subgraph Tablet["📱 Tablette (768-1023px)"]
        T1[Grille scrollable horizontalement]
        T2[Menu hamburger]
        T3[Tableaux scrollables]
    end

    subgraph Mobile["📱 Mobile (<768px)"]
        M1[Vue jour par jour]
        M2[Navigation swipe]
        M3[Cards empilées]
    end

    Desktop -.->|Breakpoint| Tablet
    Tablet -.->|Breakpoint| Mobile
```

---

*Document v1.1 - Janvier 2026*
*Mise à jour : type ltree pour l'arborescence des activités*
*Diagrammes Mermaid - Rendu natif GitHub/GitLab/VS Code*
