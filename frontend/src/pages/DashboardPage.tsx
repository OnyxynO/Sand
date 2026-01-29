import { useAuthStore } from '../stores/authStore';

export default function DashboardPage() {
  const utilisateur = useAuthStore((state) => state.utilisateur);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'MODERATEUR':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MODERATEUR':
        return 'Moderateur';
      default:
        return 'Utilisateur';
    }
  };

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {utilisateur?.prenom} !
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue sur SAND - Saisie d'Activite Numerique Declarative
        </p>
      </div>

      {/* Carte profil */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon profil</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Nom complet</dt>
            <dd className="text-gray-900 font-medium">
              {utilisateur?.prenom} {utilisateur?.nom}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-gray-900">{utilisateur?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Equipe</dt>
            <dd className="text-gray-900">
              {utilisateur?.equipe?.nom || 'Non assignee'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Role</dt>
            <dd>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(utilisateur?.role || '')}`}
              >
                {getRoleLabel(utilisateur?.role || '')}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Placeholder pour les prochaines fonctionnalites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-200">
          <h3 className="font-medium text-gray-400">Saisie hebdomadaire</h3>
          <p className="text-sm text-gray-400 mt-1">A venir...</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-200">
          <h3 className="font-medium text-gray-400">Mes statistiques</h3>
          <p className="text-sm text-gray-400 mt-1">A venir...</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-200">
          <h3 className="font-medium text-gray-400">Notifications</h3>
          <p className="text-sm text-gray-400 mt-1">A venir...</p>
        </div>
      </div>
    </div>
  );
}
