# Bouton de réveil du backend — implémentation terminée

Permet à un utilisateur bloqué sur la page "Services en cours de démarrage" de déclencher automatiquement le réveil du backend, sans intervention manuelle sur le VPS.

## Architecture

```
Navigateur
    │
    │  GET /api/wake  (header X-Wake-Token)
    ▼
  Caddy  (hôte, toujours actif)
    │
    │  handle /api/wake → localhost:8082
    ▼
 sand-watcher  ← service Bun systemd, HORS Docker
    │
    │  docker compose -f ... up -d
    ▼
 Containers Docker redémarrés
```

> **Note** : la route `/api/wake` est gérée par **Caddy** (pas nginx), ce qui évite tout changement dans Docker. Caddy est toujours actif même quand les containers sont arrêtés.

---

## Tâches

### Infra (repo privé — instructions dans `../infra/DEPLOY_PROD_SAND.md`)

- [x] **1. Créer `watcher/wake-server.ts`** — serveur Bun (port 8082), endpoint GET /wake, header X-Wake-Token, exécute docker compose up -d
- [x] **2. Créer `watcher/sand-watcher.service`** — template systemd, Restart=always, variable WAKE_TOKEN
- [x] **3. Mettre à jour la config Caddy** — `handle /api/wake → localhost:8082` avant le proxy nginx
- [x] **4. Générer et déployer `WAKE_TOKEN`** — `openssl rand -hex 32`, dans systemd + `frontend/.env.production.local` comme `VITE_WAKE_TOKEN`

### Frontend (repo sand)

- [x] **5. Modifier `useServiceHealth.ts`**
  - Après MAX_TENTATIVES (10 × 3s = ~30s) sans réponse → appel automatique `/api/wake`
  - Polling étendu post-réveil : 10s d'attente initiale + 12 × 5s = ~70s max
  - Nouveaux états exportés : `reveilEnCours` et `echec` (remplacent `abandonne`)
- [x] **6. Mettre à jour `ServiceWaitingPage.tsx`**
  - Phase "démarrage" : spinner + "Services en cours de démarrage"
  - Phase "réveil" : spinner + "Réveil en cours… 20 à 30 secondes"
  - Phase "échec" : icône rouge + "Réessayer" (seulement si le réveil a aussi échoué)

### Validation

- [ ] **7. Tester le flux complet en prod**
  1. Stopper manuellement les containers Docker sur le VPS
  2. Visiter sand.interstice.work → page de démarrage s'affiche
  3. Après ~30s → réveil automatique déclenché (message "Réveil en cours…")
  4. Containers redémarrent → app se charge automatiquement
