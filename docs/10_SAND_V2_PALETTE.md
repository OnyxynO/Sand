# SAND V2 - Palette UI

Ce document recense la palette principale utilisee par la V2, avec l'intention de chaque couleur et les zones ou elle apparait.

## Variables principales

| Variable | Valeur | Role | Usages principaux |
|----------|--------|------|-------------------|
| `--sand-bg` | `#f3efe6` | Fond sable clair | Base visuelle generale |
| `--sand-surface` | `rgba(255, 252, 247, 0.8)` | Surface legere | Cartes `.sand-card`, panneaux flottants |
| `--sand-surface-strong` | `#fffdf8` | Surface renforcee | Etats hover doux, en-tetes de tableaux, fonds internes |
| `--sand-ink` | `#1f2937` | Encre principale | Texte principal, boutons pleins, overlays |
| `--sand-muted` | `#6b7280` | Texte secondaire | Descriptions, labels, metadonnees, actions discretes |
| `--sand-line` | `rgba(31, 41, 55, 0.12)` | Lignes et bordures | Separateurs, bordures de cartes, structure |
| `--sand-accent` | `#0f766e` | Accent froid | Liens, focus, etats actifs, toggles |
| `--sand-accent-strong` | `#115e59` | Accent froid fort | Hover de boutons, texte accentue, etats forts |
| `--sand-accent-soft` | `rgba(15, 118, 110, 0.14)` | Accent froid doux | Fonds d'accent, badges, emphasis faible |
| `--sand-warm` | `#d97706` | Accent chaud | Halos, tensions visuelles, rappels ocres |
| `--sand-shadow` | `0 18px 50px rgba(42, 47, 54, 0.08)` | Ombre generale | Cartes et panneaux elevés |

Source : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/index.css`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/index.css)

## Apercu visuel

| Variable | Apercu | Valeur |
|----------|--------|--------|
| `--sand-bg` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:#f3efe6;"></span> | `#f3efe6` |
| `--sand-surface-strong` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:#fffdf8;"></span> | `#fffdf8` |
| `--sand-ink` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:#1f2937;"></span> | `#1f2937` |
| `--sand-muted` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:#6b7280;"></span> | `#6b7280` |
| `--sand-accent` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:#0f766e;"></span> | `#0f766e` |
| `--sand-accent-strong` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:#115e59;"></span> | `#115e59` |
| `--sand-warm` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:#d97706;"></span> | `#d97706` |

### Fonds et transparences

| Variable | Apercu | Valeur |
|----------|--------|--------|
| `--sand-surface` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:rgba(255,252,247,0.8);"></span> | `rgba(255, 252, 247, 0.8)` |
| `--sand-line` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:rgba(31,41,55,0.12);"></span> | `rgba(31, 41, 55, 0.12)` |
| `--sand-accent-soft` | <span style="display:inline-block;width:36px;height:20px;border-radius:6px;border:1px solid #d1d5db;background:rgba(15,118,110,0.14);"></span> | `rgba(15, 118, 110, 0.14)` |

## Fonds et gradients

| Valeur | Usage |
|--------|-------|
| `#f8f4ec` -> `#f1ebe0` | Gradient global du fond HTML |
| `rgba(15, 118, 110, 0.12)` | Halo froid du fond global |
| `rgba(217, 119, 6, 0.10)` | Halo chaud du fond global |
| `rgba(238,154,104,0.18)` a `0.22` | Halos chauds sur ecrans d'auth |
| `#f7f4ef`, `#eef4ef`, `#f6efe6` | Gradient login |
| `#f6f2ea`, `#edf3ee`, `#f6efe7` | Gradients forgot/reset password |

Usages :
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/index.css`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/index.css)
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/pages/LoginPage.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/pages/LoginPage.tsx)
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/pages/ForgotPasswordPage.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/pages/ForgotPasswordPage.tsx)
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/pages/ResetPasswordPage.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/pages/ResetPasswordPage.tsx)

## Zones ou la palette est la plus visible

- Shell global et cartes : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/index.css`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/index.css)
- Login : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/pages/LoginPage.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/pages/LoginPage.tsx)
- Reset password : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/pages/ResetPasswordPage.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/pages/ResetPasswordPage.tsx)
- Supervision : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/pages/SupervisionPage.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/pages/SupervisionPage.tsx)
- Projets : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/projets/pages/ProjetsPage.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/projets/pages/ProjetsPage.tsx)
- Configuration admin : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/admin/configuration/pages/ConfigurationPage.impl.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/admin/configuration/pages/ConfigurationPage.impl.tsx)
- Equipes admin : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/admin/teams/pages/EquipesPage.impl.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/admin/teams/pages/EquipesPage.impl.tsx)
- Utilisateurs admin : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/admin/users/pages/UtilisateursPage.impl.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/admin/users/pages/UtilisateursPage.impl.tsx)
- Export : [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/export/pages/ExportPage.impl.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/export/pages/ExportPage.impl.tsx)

## Couleurs hors palette principale

Les graphiques dashboard utilisent encore une palette dataviz plus standard, distincte du theme sable :

- `#3B82F6`
- `#10B981`
- `#F59E0B`
- `#EF4444`
- `#8B5CF6`
- `#EC4899`
- `#06B6D4`
- `#84CC16`
- `#F97316`
- `#6366F1`
- `#9CA3AF` pour les lignes de reference

Usages :
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueUtilisateurs.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueUtilisateurs.tsx)
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueJournalier.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueJournalier.tsx)
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueEvolution.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueEvolution.tsx)
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueRepartitionProjets.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueRepartitionProjets.tsx)
- [`/Users/seb/Documents/Claude projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueActivites.tsx`](/Users/seb/Documents/Claude%20projet/sand-v2/frontend/src/features/dashboard/components/GraphiqueActivites.tsx)

## Note

La palette principale de la V2 est volontairement minerale :
- sable
- pierre
- encre
- accent froid vegetal
- pointe chaude ocre

Si une future iteration veut pousser encore plus loin l'identite "sable", le premier chantier logique serait d'harmoniser aussi les couleurs de graphiques sur une palette derivee de ces tons.
