// Page principale de saisie hebdomadaire

import { useEffect, useState } from 'react';
import { useSearchParams, useBlocker } from 'react-router';
import { SparklesIcon } from '@heroicons/react/24/outline';
import NavigationSemaine from '../../../components/saisie/NavigationSemaine';
import BlocAbsences from '../../../components/saisie/BlocAbsences';
import GrilleSemaine from '../../../components/saisie/GrilleSemaine';
import GrilleSemaineMobile from '../../../components/saisie/GrilleSemaineMobile';
import BoutonSauvegarde from '../../../components/saisie/BoutonSauvegarde';
import SelecteurUtilisateur from '../../../components/saisie/SelecteurUtilisateur';
import { useSaisieHebdo } from '../hooks/useSaisieHebdo';
import { useAuthStore } from '../../../stores/authStore';
import { useSaisieStore } from '../../../stores/saisieStore';
import { useIsMobile } from '../../../hooks/useIsMobile';

export default function SaisiePage() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userIdModeration, setUserIdModeration] = useState<string | null>(null);
  const { erreur, aDesModifications, sauvegarde, sauvegarder, absencesParJour, modeAbsence, refetcherAbsences } = useSaisieHebdo(userIdModeration);
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
      <div className="sand-card overflow-hidden rounded-[32px]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[var(--sand-accent)]">Atelier de saisie</p>
            <h1 className="sand-display mt-3 text-4xl text-gray-900">Saisie hebdomadaire</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
              La grille reste la meme fonctionnellement, mais la v2 cherche une lecture plus calme:
              navigation plus lisible, surfaces plus nettes et separation plus claire entre absences et travail saisi.
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--sand-line)] bg-white/65 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--sand-accent-soft)] p-3 text-[var(--sand-accent)]">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Contexte</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {estModerateurOuAdmin && userIdModeration ? 'Saisie en mode moderation' : 'Saisie personnelle'}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-gray-600">
              <div className="rounded-2xl bg-amber-50 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Profil</p>
                <p className="mt-2 font-medium text-gray-900">
                  {utilisateur?.prenom} {utilisateur?.nom}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Equipe</p>
                <p className="mt-2 font-medium text-gray-900">{utilisateur?.equipe?.nom || 'Non assignee'}</p>
              </div>
            </div>
          </div>
        </div>
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

      {/* Bloc absences — indépendant des projets */}
      {!isMobile && (
        <BlocAbsences
          absencesParJour={absencesParJour}
          modeAbsence={modeAbsence}
          onAbsenceModifiee={refetcherAbsences}
          userId={userIdModeration}
        />
      )}

      {/* Grille de saisie (projets + activités) */}
      {isMobile ? (
        <GrilleSemaineMobile absencesParJour={absencesParJour} modeAbsence={modeAbsence} />
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
          <div className="sand-card max-w-md rounded-[28px] p-6 shadow-xl mx-4">
            <h3 className="sand-display text-2xl text-gray-900">
              Modifications non enregistrees
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Vous avez des saisies non enregistrees. Si vous quittez cette page, vos modifications seront perdues.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => blocker.reset()}
                className="rounded-full border border-[var(--sand-line)] bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
              >
                Rester sur la page
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
