import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { LOGOUT_MUTATION } from '../graphql/operations/auth';
import { apolloClient } from '../graphql/client';
import NotificationBell from './notifications/NotificationBell';
import NotificationPanel from './notifications/NotificationPanel';
import { construireNavigation } from '../features/app/navigation';

export default function Layout() {
  const navigate = useNavigate();
  const { utilisateur, deconnecter } = useAuthStore();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      deconnecter();
      apolloClient.clearStore();
      navigate('/login');
    },
  });

  const handleLogout = () => {
    logout();
  };

  const navigation = construireNavigation(utilisateur?.role);
  const roleLabel = utilisateur?.role === 'ADMIN'
    ? 'Administration'
    : utilisateur?.role === 'MODERATEUR'
      ? 'Pilotage'
      : 'Saisie';

  return (
    <div className="sand-shell min-h-screen text-gray-900">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700 focus:rounded focus:shadow"
      >
        Aller au contenu principal
      </a>

      {/* Header */}
      <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="sand-card mx-auto max-w-7xl rounded-[28px] border border-white/60">
          <div className="flex items-center justify-between border-b border-[var(--sand-line)] px-5 py-3 text-xs uppercase tracking-[0.24em] text-gray-500">
            <span>Sand v2 workspace</span>
            <span>{roleLabel}</span>
          </div>
          <div className="flex justify-between items-center px-5 py-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sand-accent)] text-sm font-semibold tracking-[0.3em] text-white shadow-lg shadow-teal-900/20">
                SD
              </div>
              <div>
                <p className="sand-display text-2xl leading-none text-gray-900">SAND</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">
                  Saisie d'activite numerique declarative
                </p>
              </div>
            </div>

            {/* Navigation desktop */}
            <nav className="hidden md:flex flex-wrap justify-center gap-2 px-6">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-transparent bg-[var(--sand-accent)] text-white shadow-md shadow-teal-900/15'
                        : 'border-[var(--sand-line)] bg-white/70 text-gray-600 hover:border-[var(--sand-accent)] hover:text-[var(--sand-accent)]'
                    }`
                  }
                >
                  {item.nom}
                </NavLink>
              ))}
            </nav>

            {/* Menu utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />

              <div className="hidden rounded-2xl border border-[var(--sand-line)] bg-white/70 px-4 py-2 text-right sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {utilisateur?.prenom} {utilisateur?.nom}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                  {utilisateur?.equipe?.nom || roleLabel}
                </p>
              </div>

              {/* Bouton deconnexion */}
              <button
                onClick={handleLogout}
                className="rounded-full border border-[var(--sand-line)] bg-white/70 p-2.5 text-gray-500 transition-colors hover:border-[var(--sand-warm)] hover:text-[var(--sand-warm)] focus-visible:ring-2 focus-visible:ring-[var(--sand-accent)]"
                aria-label="Se déconnecter"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              </button>

              {/* Bouton menu mobile */}
              <button
                onClick={() => setMenuOuvert(!menuOuvert)}
                className="rounded-full border border-[var(--sand-line)] bg-white/70 p-2.5 md:hidden focus-visible:ring-2 focus-visible:ring-[var(--sand-accent)]"
                aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOuvert}
              >
                {menuOuvert ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        {menuOuvert && (
          <div className="sand-card mx-auto mt-3 max-w-7xl rounded-[24px] border border-white/60 px-4 py-4 md:hidden">
            <nav className="grid gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOuvert(false)}
                  className={({ isActive }) =>
                    `block rounded-2xl border px-4 py-3 text-sm font-medium ${
                      isActive
                        ? 'border-transparent bg-[var(--sand-accent)] text-white'
                        : 'border-[var(--sand-line)] bg-white/60 text-gray-600'
                    }`
                  }
                >
                  {item.nom}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Panneau notifications (slide-over) */}
      <NotificationPanel />
    </div>
  );
}
