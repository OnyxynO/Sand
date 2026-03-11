// Barre de sauvegarde fixe en bas de page

import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface BoutonSauvegardeProps {
  aDesModifications: boolean;
  sauvegarde: boolean;
  erreur: string | null;
  sauvegarder: () => Promise<void>;
}

export default function BoutonSauvegarde({
  aDesModifications,
  sauvegarde,
  erreur,
  sauvegarder,
}: BoutonSauvegardeProps) {

  // Ne pas afficher si pas de modifications
  if (!aDesModifications && !erreur) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
      <div className="sand-card mx-auto max-w-5xl rounded-[24px] border border-white/60 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Message */}
          <div className="flex items-center gap-2 text-sm">
            {erreur ? (
              <>
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{erreur}</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-gray-600">Modifications non enregistrees</span>
              </>
            )}
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full border border-[var(--sand-line)] bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
              disabled={sauvegarde}
            >
              Annuler
            </button>
            <button
              onClick={sauvegarder}
              disabled={sauvegarde || !aDesModifications}
              className="flex items-center gap-2 rounded-full bg-[var(--sand-accent)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-teal-900/20 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sauvegarde ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
