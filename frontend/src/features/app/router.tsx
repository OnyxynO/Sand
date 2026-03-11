import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import ServiceWaitingPage from '../../components/ServiceWaitingPage';
import { useAuthStore } from '../../stores/authStore';
import { useAuthSessionBootstrap } from '../auth/hooks/useAuthSessionBootstrap';

const LoginPage = lazy(() => import('../../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../../pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const SaisiePage = lazy(() => import('../../pages/SaisiePage'));
const SupervisionPage = lazy(() => import('../../pages/SupervisionPage'));
const StatsProjetPage = lazy(() => import('../stats/pages/StatsProjetPage'));
const StatsGlobalesPage = lazy(() => import('../stats/pages/StatsGlobalesPage'));
const ExportPage = lazy(() => import('../export/pages/ExportPage'));
const UtilisateursPage = lazy(() => import('../admin/users/pages/UtilisateursPage'));
const EquipesPage = lazy(() => import('../admin/teams/pages/EquipesPage'));
const ActivitesPage = lazy(() => import('../admin/activities/pages/ActivitesPage'));
const ConfigurationPage = lazy(() => import('../admin/configuration/pages/ConfigurationPage'));
const RgpdPage = lazy(() => import('../admin/rgpd/pages/RgpdPage'));
const ProjetsPage = lazy(() => import('../projets/pages/ProjetsPage'));

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="sand-card w-full max-w-md rounded-[28px] p-10 text-center">
        <div className="mx-auto flex h-14 w-14 animate-spin items-center justify-center rounded-full border-2 border-[var(--sand-accent-soft)] border-t-[var(--sand-accent)]" />
        <p className="sand-display mt-6 text-3xl text-gray-900">SAND v2</p>
        <p className="mt-2 text-sm uppercase tracking-[0.22em] text-gray-500">Chargement de l'espace de travail</p>
      </div>
    </div>
  );
}

function RootLayout() {
  useAuthSessionBootstrap();
  const { chargement } = useAuthStore();

  if (chargement) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}

function LoginRoute() {
  const { estConnecte } = useAuthStore();
  return estConnecte ? <Navigate to="/" replace /> : <LoginPage />;
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginRoute /> },
      { path: '/mot-de-passe-oublie', element: <ForgotPasswordPage /> },
      { path: '/reinitialiser-mdp', element: <ResetPasswordPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/saisie', element: <SaisiePage /> },
          { path: '/stats-projet', element: <StatsProjetPage /> },
          {
            element: (
              <ProtectedRoute roles={['MODERATEUR', 'ADMIN']}>
                <Outlet />
              </ProtectedRoute>
            ),
            children: [
              { path: '/projets', element: <ProjetsPage /> },
              { path: '/supervision', element: <SupervisionPage /> },
            ],
          },
          {
            element: (
              <ProtectedRoute roles={['ADMIN']}>
                <Outlet />
              </ProtectedRoute>
            ),
            children: [
              { path: '/admin', element: <Navigate to="/admin/utilisateurs" replace /> },
              { path: '/admin/utilisateurs', element: <UtilisateursPage /> },
              { path: '/admin/equipes', element: <EquipesPage /> },
              { path: '/admin/activites', element: <ActivitesPage /> },
              { path: '/admin/configuration', element: <ConfigurationPage /> },
              { path: '/admin/rgpd', element: <RgpdPage /> },
              { path: '/stats-globales', element: <StatsGlobalesPage /> },
              { path: '/export', element: <ExportPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function AppRouter() {
  return (
    <>
      <ServiceWaitingPage />
      <RouterProvider router={router} />
    </>
  );
}
