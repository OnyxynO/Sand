// Navigation entre les pages d'administration

import { NavLink } from 'react-router-dom';

const liens = [
  { nom: 'Utilisateurs', href: '/admin/utilisateurs' },
  { nom: 'Equipes', href: '/admin/equipes' },
  { nom: 'Activites', href: '/admin/activites' },
  { nom: 'Configuration', href: '/admin/configuration' },
  { nom: 'RGPD', href: '/admin/rgpd' },
];

export default function NavAdmin() {
  return (
    <div className="flex gap-1 mb-6 border-b overflow-x-auto">
      {liens.map((lien) => (
        <NavLink
          key={lien.href}
          to={lien.href}
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          {lien.nom}
        </NavLink>
      ))}
    </div>
  );
}
