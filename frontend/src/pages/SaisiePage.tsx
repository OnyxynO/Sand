// Page principale de saisie hebdomadaire

import { useEffect, useState } from 'react';
import { useSearchParams, useBlocker } from 'react-router';
import NavigationSemaine from '../components/saisie/NavigationSemaine';
import GrilleSemaine from '../components/saisie/GrilleSemaine';
import GrilleSemaineMobile from '../components/saisie/GrilleSemaineMobile';
import BoutonSauvegarde from '../components/saisie/BoutonSauvegarde';
import SelecteurUtilisateur from '../components/saisie/SelecteurUtilisateur';
import { useSaisieHebdo } from '../hooks/useSaisieHebdo';
import { useAuthStore } from '../stores/authStore';
import { useSaisieStore } from '../stores/saisieStore';

// Hook pour detecter la taille d'ecran
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function SaisiePage() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userIdModeration, setUserIdModeration] = useState<string | null>(null);
  const { erreur, aDesModifications, sauvegarde, sauvegarder, absencesParJour } = useSaisieHebdo(userIdModeration);
  const utilisateur = useAuthStore((state) => state.utilisateur);
  const setSemaine = useSaisieStore((state) => state.setSemaine);

  // Afficher le selecteur si moderateur ou admin
  const estModerateurOuAdmin = utilisateur?.role === 'MODERATEUR' || utilisateur?.role === 'ADMIN';

  // Bloquer la navigation si des modifications non sauvegardees
  const blocker = useBlocker(aDesModifications);

  // Bloquer la fermeture d'onglet si des modifications non sauvegardees
  useEffect(() => {
    if (!aDesModifications) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [aDesModifications]);

  // Lire les query params au montage (navigation depuis supervision)
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    const semaineParam = searchParams.get('semaine');

    if (userIdParam && estModerateurOuAdmin) {
      setUserIdModeration(userIdParam);
    }

    if (semaineParam && /^\d{4}-W\d{2}$/.test(semaineParam)) {
      setSemaine(semaineParam);
    }

    // Nettoyer les query params apres utilisation
    if (userIdParam || semaineParam) {
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`space-y-4 ${aDesModifications || erreur ? 'pb-20' : ''}`}>
      {/* Titre */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Saisie hebdomadaire</h1>
      </div>

      {/* Selecteur d'utilisateur (moderateurs/admins) */}
      {estModerateurOuAdmin && (
        <SelecteurUtilisateur
          utilisateurId={userIdModeration}
          onChange={setUserIdModeration}
        />
      )}

      {/* Navigation semaine */}
      <NavigationSemaine />

      {/* Grille selon taille ecran */}
      {isMobile ? (
        <GrilleSemaineMobile absencesParJour={absencesParJour} />
      ) : (
        <GrilleSemaine absencesParJour={absencesParJour} />
      )}

      {/* Barre de sauvegarde */}
      <BoutonSauvegarde
        aDesModifications={aDesModifications}
        sauvegarde={sauvegarde}
        erreur={erreur}
        sauvegarder={sauvegarder}
      />

      {/* Modale de confirmation si navigation avec modifications non sauvegardees */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Modifications non enregistrees
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Vous avez des saisies non enregistrees. Si vous quittez cette page, vos modifications seront perdues.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => blocker.reset()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Rester sur la page
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Quitter sans enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
