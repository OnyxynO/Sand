import { useServiceHealth, type EtatService } from '../hooks/useServiceHealth';

function BadgeStatut({ statut }: { statut: EtatService['statut'] }) {
  if (statut === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        OK
      </span>
    );
  }
  if (statut === 'erreur') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Indisponible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
      <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
      Vérification…
    </span>
  );
}

export default function ServiceWaitingPage() {
  const { services, tousOk, premierCheckFait } = useServiceHealth();

  // Ne rien afficher tant que le premier check n'est pas fait, ou si tout est OK
  if (!premierCheckFait || tousOk) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 mb-4">
            <svg
              className="w-7 h-7 text-yellow-600 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Services en cours de démarrage</h2>
          <p className="mt-1 text-sm text-gray-500">
            L'application sera disponible dès que tous les services seront prêts.
          </p>
        </div>

        <ul className="space-y-3">
          {services.map((service) => (
            <li key={service.nom} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
              <span className="text-sm font-medium text-gray-700">{service.nom}</span>
              <BadgeStatut statut={service.statut} />
            </li>
          ))}
        </ul>

        <p className="mt-5 text-center text-xs text-gray-400">
          Vérification automatique toutes les 3 secondes
        </p>
      </div>
    </div>
  );
}
