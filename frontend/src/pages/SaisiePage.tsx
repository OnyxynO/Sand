// Page principale de saisie hebdomadaire

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const { erreur, aDesModifications, sauvegarde, sauvegarder } = useSaisieHebdo(userIdModeration);
  const utilisateur = useAuthStore((state) => state.utilisateur);
  const setSemaine = useSaisieStore((state) => state.setSemaine);

  // Afficher le selecteur si moderateur ou admin
  const estModerateurOuAdmin = utilisateur?.role === 'MODERATEUR' || utilisateur?.role === 'ADMIN';

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
      {isMobile ? <GrilleSemaineMobile /> : <GrilleSemaine />}

      {/* Barre de sauvegarde */}
      <BoutonSauvegarde
        aDesModifications={aDesModifications}
        sauvegarde={sauvegarde}
        erreur={erreur}
        sauvegarder={sauvegarder}
      />
    </div>
  );
}
