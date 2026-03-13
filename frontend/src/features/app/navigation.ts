import type { UserRole } from '../../types';

export interface NavigationItem {
  nom: string;
  href: string;
}

export function construireNavigation(role?: UserRole): NavigationItem[] {
  const items: NavigationItem[] = [
    { nom: 'Tableau de bord', href: '/' },
    { nom: 'Saisie', href: '/saisie' },
  ];

  if (role === 'MODERATEUR' || role === 'ADMIN') {
    items.push(
      { nom: 'Projets', href: '/projets' },
      { nom: 'Supervision', href: '/supervision' },
      { nom: 'Stats projet', href: '/stats-projet' },
    );
  }

  if (role === 'ADMIN') {
    items.push(
      { nom: 'Stats globales', href: '/stats-globales' },
      { nom: 'Export', href: '/export' },
      { nom: 'Administration', href: '/admin' },
    );
  }

  return items;
}
