import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { useAuthStore } from '../stores/authStore';
import { LOGOUT_MUTATION } from '../graphql/operations/auth';
import { apolloClient } from '../graphql/client';
import NotificationBell from './notifications/NotificationBell';
import NotificationPanel from './notifications/NotificationPanel';

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

  const navigation = [
    { nom: 'Tableau de bord', href: '/' },
    { nom: 'Saisie', href: '/saisie' },
  ];

  // Navigation moderateur/admin
  if (utilisateur?.role === 'MODERATEUR' || utilisateur?.role === 'ADMIN') {
    navigation.push({ nom: 'Projets', href: '/projets' });
  }

  // Navigation admin
  if (utilisateur?.role === 'ADMIN') {
    navigation.push({ nom: 'Administration', href: '/admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">SAND</h1>
            </div>

            {/* Navigation desktop */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
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

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {utilisateur?.prenom} {utilisateur?.nom}
                </p>
                <p className="text-xs text-gray-500">{utilisateur?.equipe?.nom}</p>
              </div>

              {/* Bouton deconnexion */}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Se deconnecter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>

              {/* Bouton menu mobile */}
              <button
                onClick={() => setMenuOuvert(!menuOuvert)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {menuOuvert ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        {menuOuvert && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOuvert(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Panneau notifications (slide-over) */}
      <NotificationPanel />
    </div>
  );
}
