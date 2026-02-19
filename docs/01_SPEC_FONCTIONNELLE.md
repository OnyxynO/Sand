# SAND - Spécifications Fonctionnelles

> **SAND** = Saisie d'Activité Numérique Déclarative

---

## 1. Présentation

### 1.1 Contexte

SAND est une application web de saisie d'activités professionnelles permettant aux collaborateurs de déclarer leur temps de travail par projet. Elle succède à l'ancienne application SAEL (Saisie d'Activité En Ligne).

### 1.2 Objectifs

- Permettre la saisie hebdomadaire des activités par journée
- Suivre la répartition du temps par projet pour le pilotage budgétaire
- Récupérer automatiquement les absences depuis un système externe
- Fournir des statistiques et exports pour le reporting

---

## 2. Utilisateurs et rôles

### 2.1 Rôles

| Rôle | Description |
|------|-------------|
| **Utilisateur** | Saisit ses propres activités hebdomadaires |
| **Modérateur** | Consulte, crée, modifie et supprime les saisies des utilisateurs sur les projets dont il a la charge |
| **Administrateur** | Gère la configuration globale : utilisateurs, projets, activités, équipes, paramètres système |

### 2.2 Équipes / Services

- Un utilisateur appartient à **une équipe**
- Une équipe regroupe plusieurs utilisateurs
- Permet d'organiser les collaborateurs par service

---

## 3. Gestion des projets

### 3.1 Caractéristiques

| Champ | Description |
|-------|-------------|
| Nom | Identifiant du projet |
| Description | Optionnelle |
| Statut | Actif / Archivé |
| Modérateurs | Utilisateurs assignés à la modération |
| Activités | Sélection depuis l'arborescence globale |

### 3.2 Règles

- Un projet est **permanent** (pas de date de début/fin)
- Un projet peut être **archivé** (invisible pour la saisie, conservé pour les stats)
- Un modérateur peut être assigné à **plusieurs projets**

---

## 4. Gestion des activités

### 4.1 Arborescence globale

Les activités sont organisées en **arborescence hiérarchique globale**, partagée entre tous les projets.

```
Activités (arbre global)
├── Développement
│   ├── Backend
│   │   ├── API
│   │   └── Base de données
│   ├── Frontend
│   │   ├── Intégration
│   │   └── Composants
│   └── Tests
├── Gestion de projet
│   ├── Réunion
│   ├── Planification
│   └── Reporting
├── Support
│   ├── Tickets
│   └── Documentation
└── 🔒 Absence (système, toujours activé)
```

### 4.2 Caractéristiques d'une activité

| Champ | Description |
|-------|-------------|
| Libellé | Nom affiché (ex: "Développement") |
| Parent | Activité parente (null si racine) |
| Ordre | Position dans l'arborescence |
| Statut global | Actif / Inactif |

### 4.3 Activation par projet (système tri-state)

Chaque projet **active/désactive** les activités avec un système de **checkbox tri-state** :

| État | Symbole | Signification |
|------|---------|---------------|
| Vide | ☐ | Aucun enfant activé |
| Indéterminé | ☑ | Au moins un enfant activé (pas tous) |
| Coché | ✓ | Tous les enfants activés |

**Comportement au clic :**

```
Vide ──────► Tout activé ──────► Vide
                 ▲                  │
                 │                  │
                 └── Indéterminé ◄──┘
```

**Protection contre les erreurs :**
- Toast d'annulation après désactivation massive
- Délai configurable par l'admin (défaut : 5 secondes)
- Message : "X activités désactivées. [Annuler]"

### 4.4 Interface d'arborescence (UX)

**Affichage pliable :**
- Chevrons rotatifs : `▶` (plié) / `▼` (déplié)
- Clic chevron → plie/déplie
- Double-clic libellé → plie/déplie (raccourci)
- Animation fluide de rotation

**Zones de clic distinctes :**
- Chevron : plie/déplie
- Checkbox : cycle tri-state
- Libellé : sélection pour édition

### 4.5 Visibilité par utilisateur

Certaines activités peuvent être **masquées** pour certains utilisateurs **sur un projet donné**.

**Exemple :**
- Masquer "Planification" aux stagiaires sur Projet Alpha
- Le même stagiaire peut voir "Planification" sur Projet Beta

### 4.6 Règles de saisie

- Seules les **feuilles** (sans enfants) sont saisissables
- Les nœuds intermédiaires (catégories) ne sont pas saisissables
- L'activité "Absence" est **système** et toujours activée

---

## 5. Saisie des temps

### 5.1 Interface

- Affichage par **semaine** (lundi à vendredi par défaut)
- Saisie **journalière**
- Unité : **Équivalent Temps Plein (ETP)**

### 5.2 Validation de saisie

| Règle | Valeur |
|-------|--------|
| Granularité | 2 décimales max |
| Valeurs valides | 0.01 à 1.00 |
| Exemples OK | 0.1, 0.25, 0.33, 0.5, 0.75, 1.0 |
| Exemples KO | 0.333, 0.125, 0.001 |

### 5.3 Fonctionnalités

- Sélection projet → navigation dans l'arborescence d'activités
- Possibilité d'ajouter **plusieurs activités par jour**
- Indicateur visuel du total journalier
- Commentaire optionnel par saisie
- Navigation entre semaines

### 5.4 Règles métier

| Règle | Comportement |
|-------|--------------|
| Semaines futures | Navigation possible, champs en **lecture seule** |
| Modification du passé | Toujours possible (confiance) |
| Validation hiérarchique | Aucune |
| Historique | Log de toutes les modifications |

### 5.5 Contrainte d'unicité

**Une seule ligne** par combinaison : `utilisateur + jour + activité + projet`

Exemples :
- Même activité sur 2 projets différents → 2 lignes
- Modification d'une saisie existante → mise à jour (pas de création)

### 5.6 Warnings

| Situation | Comportement |
|-----------|--------------|
| Total jour ≠ 1.0 | Warning visuel (non bloquant) |
| Warning sur jour futur | Non affiché |
| Remontée | Page de supervision |

---

## 6. Gestion des absences

### 6.1 Source

- API externe (système RH)
- Authentification LDAP (mock en dev)

### 6.2 Fonctionnement

- Type unique : "Absence" (distinction CP/RTT/maladie gérée par le système source)
- Peut être **partielle** (ex: 0.5 ETP pour demi-journée)
- Pré-remplit la journée avec l'activité "Absence"

### 6.3 Gestion des conflits

Les absences sont généralement saisies **en amont** (congés planifiés).

Si une absence est importée sur un jour avec saisies existantes :
1. **Warning affiché** à l'utilisateur
2. L'utilisateur choisit : écraser, ignorer, ou ajuster
3. Si total > 1.0 → warning mais pas bloquant

---

## 7. Statistiques et reporting

### 7.1 Tableaux de bord

| Vue | Contenu |
|-----|---------|
| Par projet | Temps total, répartition par activité, évolution mensuelle |
| Par utilisateur | Temps déclaré par projet, taux de complétion |
| Par période | Vue mensuelle, trimestrielle, annuelle |
| Par équipe | Agrégation des temps par service |

### 7.2 Graphiques

- Répartition du temps par projet (camembert/barres)
- Évolution temporelle (courbes)
- Comparatif entre périodes

### 7.3 Export CSV

- Format : CSV brut
- Contenu : utilisateur, date, projet, activité, temps, commentaire
- Filtres : période, projet, équipe, utilisateur
- Génération : **asynchrone** (job queue, notification quand prêt)

---

## 8. Notifications et supervision

### 8.1 Notifications utilisateur

Déclencheurs :
- Jours incomplets (total ≠ 1.0) sur jours passés
- Conflits absence/saisie à résoudre
- (Modérateur) Anomalies sur les saisies de son équipe

Affichage :
- Icône cloche dans le header avec badge compteur
- Panneau latéral listant les notifications
- Marquage lu/non lu

Rafraîchissement : **au chargement de page** (pas de temps réel)

### 8.2 Page de supervision

**Accès :** Modérateurs (leurs projets) / Admins (tous les projets)

**Anomalies listées :**
- Jours incomplets (total < 1.0 ou > 1.0)
- Semaines sans saisie
- Conflits absences non résolus

**Fonctionnalités :**
- Filtres : utilisateur, équipe, projet, période
- Actions rapides : accéder à la saisie, envoyer rappel

---

## 9. Configuration système

### 9.1 Paramètres

| Paramètre | Description | Défaut |
|-----------|-------------|--------|
| `undo_delay_seconds` | Délai d'annulation après action massive | 5 |
| `week_starts_on` | Premier jour de la semaine (0=dim, 1=lun) | 1 |
| `show_weekends` | Afficher samedi/dimanche | false |
| `decimal_precision` | Nombre de décimales pour la saisie | 2 |

---

## 10. Pages de l'application

| Page | Accès | Description |
|------|-------|-------------|
| Login | Public | Authentification |
| Dashboard | Tous | Vue d'ensemble + notifications |
| Saisie hebdomadaire | Tous | Grille de saisie des temps |
| Mes statistiques | Tous | Stats personnelles |
| Supervision | Modérateur | Anomalies sur ses projets |
| Gestion équipe | Modérateur | Saisies des membres |
| Stats projet | Modérateur | Statistiques projets assignés |
| Supervision globale | Admin | Anomalies tous projets |
| Administration | Admin | Gestion utilisateurs, équipes |
| Config. Activités | Admin | Arborescence globale |
| Config. Projets | Admin | Projets et activation activités |
| Config. Système | Admin | Paramètres système |
| Stats globales | Admin | Statistiques complètes, exports |

---

*Document v1.0 - Janvier 2025*
