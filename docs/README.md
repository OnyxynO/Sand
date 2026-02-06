# SAND - Documentation

> **SAND** = Saisie d'Activité Numérique Déclarative

Application web de saisie d'activités professionnelles.

---

## 📚 Documents

| Document | Description | Audience |
|----------|-------------|----------|
| [01_SPEC_FONCTIONNELLE.md](./01_SPEC_FONCTIONNELLE.md) | Règles métier, UX, fonctionnalités | PO, Métier, Devs |
| [02_SPEC_TECHNIQUE.md](./02_SPEC_TECHNIQUE.md) | Stack, décisions techniques, BDD | Devs |
| [03_ARCHITECTURE.md](./03_ARCHITECTURE.md) | Diagrammes Mermaid (ERD, flux, C4) | Devs, Architectes |
| [04_API_GRAPHQL.md](./04_API_GRAPHQL.md) | Schéma GraphQL complet | Devs Backend/Frontend |
| [05_BACKLOG.md](./05_BACKLOG.md) | User stories, phases de développement | PO, Devs |

---

## 🚀 Quick Start

```bash
# Cloner le projet
git clone <repo-url>
cd sand

# Lancer l'environnement Docker
docker-compose up -d

# Backend (Laravel)
cd backend
composer install
php artisan migrate --seed

# Frontend (React)
cd frontend
npm install
npm run dev
```

**URLs :**
- Frontend : http://localhost:5173
- API GraphQL : http://localhost:8080/graphql
- GraphQL Playground : http://localhost:8080/graphiql

---

## 🔧 Stack technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 18, TypeScript, Apollo Client, Tailwind CSS, Zustand |
| **Backend** | Laravel 11, PHP 8.3, Lighthouse (GraphQL), Sanctum |
| **Base de données** | PostgreSQL 16 |
| **Cache/Queue** | Redis |
| **Conteneurisation** | Docker, Docker Compose |

---

## 📊 Diagrammes

Les diagrammes dans `03_ARCHITECTURE.md` sont au format **Mermaid** :
- ✅ Rendu natif sur GitHub/GitLab
- ✅ Extension VS Code disponible
- ✅ Modifiables en texte (versionnables)

---

## 📝 Changelog

### v1.2 - Fevrier 2026
- **119 tests backend** (PHPUnit) - 504 assertions, 0 echecs
- **66 tests frontend** (Vitest) - 0 echecs
- Correction de 6 bugs applicatifs decouverts par les tests
- Migration arborescence activites vers ltree PostgreSQL
- Documentation problemes Lighthouse (@rename, @delete, cache schema)

### v1.1 - Janvier 2026
- Phases 1 a 4 implementees
- Infrastructure Docker + healthchecks + smoke tests
- graphql-codegen pour validation schema front/back
- Import absences depuis API RH (mock)
- Systeme de notifications et resolution conflits

### v1.0 - Janvier 2025
- Documentation initiale complete
- Specs fonctionnelles et techniques
- Schema GraphQL
- Backlog avec user stories

---

*Projet SAND - Successeur de SAEL (Saisie d'Activite En Ligne)*
