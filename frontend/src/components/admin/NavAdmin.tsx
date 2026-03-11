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
    <div className="mb-6 flex gap-2 overflow-x-auto rounded-[1.4rem] border border-[color:var(--sand-line)] bg-white/70 p-2 shadow-[0_20px_50px_-45px_rgba(52,78,65,0.7)] backdrop-blur">
      {liens.map((lien) => (
        <NavLink
          key={lien.href}
          to={lien.href}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-[color:var(--sand-ink)] text-white shadow-[0_16px_35px_-24px_rgba(52,78,65,1)]'
                : 'text-[color:var(--sand-muted)] hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-ink)]'
            }`
          }
        >
          {lien.nom}
        </NavLink>
      ))}
    </div>
  );
}
