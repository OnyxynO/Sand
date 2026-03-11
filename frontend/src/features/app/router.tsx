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
const StatsProjetPage = lazy(() => import('../../pages/StatsProjetPage'));
const StatsGlobalesPage = lazy(() => import('../../pages/StatsGlobalesPage'));
const ExportPage = lazy(() => import('../../pages/ExportPage'));
const UtilisateursPage = lazy(() => import('../../pages/admin/UtilisateursPage'));
const EquipesPage = lazy(() => import('../../pages/admin/EquipesPage'));
const ActivitesPage = lazy(() => import('../../pages/admin/ActivitesPage'));
const ConfigurationPage = lazy(() => import('../../pages/admin/ConfigurationPage'));
const RgpdPage = lazy(() => import('../../pages/admin/RgpdPage'));
const ProjetsPage = lazy(() => import('../../pages/ProjetsPage'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Chargement...</p>
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
