// Page principale de saisie hebdomadaire

import { useEffect, useState } from 'react';
import NavigationSemaine from '../components/saisie/NavigationSemaine';
import GrilleSemaine from '../components/saisie/GrilleSemaine';
import GrilleSemaineMobile from '../components/saisie/GrilleSemaineMobile';
import BoutonSauvegarde from '../components/saisie/BoutonSauvegarde';
import SelecteurUtilisateur from '../components/saisie/SelecteurUtilisateur';
import { useSaisieHebdo } from '../hooks/useSaisieHebdo';
import { useAuthStore } from '../stores/authStore';

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
  const [userIdModeration, setUserIdModeration] = useState<string | null>(null);
  const { erreur, aDesModifications } = useSaisieHebdo(userIdModeration);
  const utilisateur = useAuthStore((state) => state.utilisateur);

  // Afficher le selecteur si moderateur ou admin
  const estModerateurOuAdmin = utilisateur?.role === 'MODERATEUR' || utilisateur?.role === 'ADMIN';

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
      <BoutonSauvegarde />
    </div>
  );
}
