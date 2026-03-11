import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  ShieldExclamationIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { USERS_QUERY } from '../../../../graphql/operations/users';
import {
  SUPPRIMER_DONNEES_UTILISATEUR,
  PURGER_TOUTES_DONNEES,
} from '../../../../graphql/operations/rgpd';
import NavAdmin from '../../../../components/admin/NavAdmin';

interface UserBasique {
  id: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  email: string;
}

interface UsersQueryData {
  users: {
    data: UserBasique[];
  };
}

interface SuppressionResultat {
  saisiesSupprimees: number;
  absencesSupprimees: number;
  notificationsSupprimees: number;
  exportsSupprimees: number;
  logsAnonymises: number;
}

interface PurgeResultat {
  saisiesSupprimees: number;
  logsSupprimees: number;
  absencesSupprimees: number;
  notificationsSupprimees: number;
  exportsSupprimees: number;
}

interface SupprimerDonneesMutationData {
  supprimerDonneesUtilisateur: SuppressionResultat;
}

interface SupprimerDonneesMutationVariables {
  userId: string;
  confirmationNom: string;
}

interface PurgerToutesDonneesMutationData {
  purgerToutesDonnees: PurgeResultat;
}

interface PurgerToutesDonneesMutationVariables {
  confirmationPhrase: string;
}

export default function RgpdPage() {
  // --- Section 1 : Suppression utilisateur ---
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState<UserBasique | null>(null);
  const [modaleSuppressionOuverte, setModaleSuppressionOuverte] = useState(false);
  const [confirmationNom, setConfirmationNom] = useState('');
  const [resultatSuppression, setResultatSuppression] = useState<SuppressionResultat | null>(null);

  // --- Section 2 : Purge totale ---
  const [modalePurgeOuverte, setModalePurgeOuverte] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [resultatPurge, setResultatPurge] = useState<PurgeResultat | null>(null);

  const { data: usersData, loading: usersLoading } = useQuery<UsersQueryData>(USERS_QUERY, {
    variables: { actifSeulement: false },
  });

  const [supprimerDonnees, { loading: supprimant }] = useMutation<
    SupprimerDonneesMutationData,
    SupprimerDonneesMutationVariables
  >(SUPPRIMER_DONNEES_UTILISATEUR, {
    onCompleted: (data) => {
      setResultatSuppression(data.supprimerDonneesUtilisateur);
      setModaleSuppressionOuverte(false);
      setConfirmationNom('');
      setUtilisateurSelectionne(null);
    },
  });

  const [purgerDonnees, { loading: purgeant }] = useMutation<
    PurgerToutesDonneesMutationData,
    PurgerToutesDonneesMutationVariables
  >(PURGER_TOUTES_DONNEES, {
    onCompleted: (data) => {
      setResultatPurge(data.purgerToutesDonnees);
      setModalePurgeOuverte(false);
      setConfirmationPhrase('');
    },
  });

  const utilisateurs: UserBasique[] = usersData?.users?.data ?? [];

  const handleSuppression = () => {
    if (!utilisateurSelectionne) return;
    supprimerDonnees({
      variables: {
        userId: utilisateurSelectionne.id,
        confirmationNom,
      },
    });
  };

  const handlePurge = () => {
    purgerDonnees({
      variables: { confirmationPhrase },
    });
  };

  const nomCompletAttendu = utilisateurSelectionne
    ? `${utilisateurSelectionne.prenom} ${utilisateurSelectionne.nom}`
    : '';

  return (
    <div className="space-y-6">
      <NavAdmin />

      {/* Titre */}
      <div className="sand-card flex items-center gap-3 rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(52,78,65,0.08),rgba(238,154,104,0.14))] p-6">
        <ShieldExclamationIcon className="w-7 h-7 text-[color:var(--sand-accent-strong)]" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">Conformite</p>
          <h1 className="font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">RGPD - Gestion des donnees</h1>
          <p className="mt-1 text-[color:var(--sand-muted)]">Suppression des donnees personnelles et purge</p>
        </div>
      </div>

      {/* Section 1 : Suppression donnees utilisateur */}
      <div className="sand-card rounded-[1.8rem] p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[color:var(--sand-ink)]">
          <TrashIcon className="w-5 h-5" />
          Suppression des donnees d'un utilisateur
        </h2>
        <p className="mt-1 text-sm text-[color:var(--sand-muted)]">
          Supprime toutes les saisies, absences, notifications et exports d'un utilisateur (droit a l'oubli).
          Les logs de modification sont anonymises.
        </p>

        <div className="mt-4">
          <label htmlFor="select-utilisateur" className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]">
            Selectionner un utilisateur
          </label>
          {usersLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          ) : (
            <select
              id="select-utilisateur"
              value={utilisateurSelectionne?.id ?? ''}
              onChange={(e) => {
                const user = utilisateurs.find((u) => u.id === e.target.value);
                setUtilisateurSelectionne(user ?? null);
                setResultatSuppression(null);
              }}
              className="block w-full max-w-md rounded-2xl border border-[color:var(--sand-line)] bg-white/90 text-sm text-[color:var(--sand-ink)] shadow-sm focus:border-[color:var(--sand-accent)] focus:ring-[color:var(--sand-accent)]/20"
            >
              <option value="">-- Choisir un utilisateur --</option>
              {utilisateurs.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.prenom} {u.nom} ({u.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {utilisateurSelectionne && (
          <div className="mt-4">
            <button
              onClick={() => {
                setModaleSuppressionOuverte(true);
                setConfirmationNom('');
              }}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer les donnees de {utilisateurSelectionne.prenom} {utilisateurSelectionne.nom}
            </button>
          </div>
        )}

        {/* Resultat suppression */}
        {resultatSuppression && (
          <div className="mt-4 rounded-[1.4rem] border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">Donnees supprimees avec succes :</p>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>{resultatSuppression.saisiesSupprimees} saisie(s) supprimee(s)</li>
              <li>{resultatSuppression.absencesSupprimees} absence(s) supprimee(s)</li>
              <li>{resultatSuppression.notificationsSupprimees} notification(s) supprimee(s)</li>
              <li>{resultatSuppression.exportsSupprimees} export(s) supprime(s)</li>
              <li>{resultatSuppression.logsAnonymises} log(s) anonymise(s)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Section 2 : Purge totale */}
      <div className="sand-card rounded-[1.8rem] p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[color:var(--sand-ink)]">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          Purge totale des donnees
        </h2>
        <div className="mt-2 rounded-[1.4rem] border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-800">
            ATTENTION : Cette action supprime TOUTES les saisies, absences, notifications, exports et logs de l'application.
          </p>
          <p className="text-sm text-red-700 mt-1">
            Les utilisateurs, equipes, projets, activites et parametres sont conserves.
            Cette action est irreversible.
          </p>
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              setModalePurgeOuverte(true);
              setConfirmationPhrase('');
            }}
            className="inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            Purger toutes les donnees
          </button>
        </div>

        {/* Resultat purge */}
        {resultatPurge && (
          <div className="mt-4 rounded-[1.4rem] border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">Purge effectuee avec succes :</p>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>{resultatPurge.saisiesSupprimees} saisie(s) supprimee(s)</li>
              <li>{resultatPurge.logsSupprimees} log(s) supprime(s)</li>
              <li>{resultatPurge.absencesSupprimees} absence(s) supprimee(s)</li>
              <li>{resultatPurge.notificationsSupprimees} notification(s) supprimee(s)</li>
              <li>{resultatPurge.exportsSupprimees} export(s) supprime(s)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Modale suppression utilisateur */}
      {modaleSuppressionOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sand-ink)]/40">
          <div className="mx-4 max-w-md rounded-[1.8rem] border border-white/70 bg-white/95 p-6 shadow-[0_32px_70px_-40px_rgba(52,78,65,0.8)] backdrop-blur">
            <h3 className="font-['Fraunces',serif] text-2xl text-[color:var(--sand-ink)]">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-sm text-[color:var(--sand-muted)]">
              Pour confirmer, retapez le nom complet de l'utilisateur :
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">{nomCompletAttendu}</p>
            <input
              type="text"
              value={confirmationNom}
              onChange={(e) => setConfirmationNom(e.target.value)}
              placeholder="Prenom Nom"
              className="mt-3 block w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 text-sm text-[color:var(--sand-ink)] shadow-sm focus:border-red-500 focus:ring-red-500"
              data-testid="input-confirmation-nom"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setModaleSuppressionOuverte(false)}
                className="rounded-full border border-[color:var(--sand-line)] bg-white/90 px-4 py-2 text-sm font-medium text-[color:var(--sand-ink)] transition hover:bg-[color:var(--sand-surface-strong)]"
              >
                Annuler
              </button>
              <button
                onClick={handleSuppression}
                disabled={confirmationNom !== nomCompletAttendu || supprimant}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {supprimant ? 'Suppression...' : 'Supprimer definitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale purge totale */}
      {modalePurgeOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sand-ink)]/40">
          <div className="mx-4 max-w-md rounded-[1.8rem] border border-white/70 bg-white/95 p-6 shadow-[0_32px_70px_-40px_rgba(52,78,65,0.8)] backdrop-blur">
            <h3 className="font-['Fraunces',serif] text-2xl text-red-700">
              Purge totale - Confirmation
            </h3>
            <p className="mt-2 text-sm text-[color:var(--sand-muted)]">
              Pour confirmer, tapez exactement :
            </p>
            <p className="mt-1 text-sm font-bold text-red-700">CONFIRMER SUPPRESSION</p>
            <input
              type="text"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder="Tapez la phrase de confirmation"
              className="mt-3 block w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 text-sm text-[color:var(--sand-ink)] shadow-sm focus:border-red-500 focus:ring-red-500"
              data-testid="input-confirmation-purge"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setModalePurgeOuverte(false)}
                className="rounded-full border border-[color:var(--sand-line)] bg-white/90 px-4 py-2 text-sm font-medium text-[color:var(--sand-ink)] transition hover:bg-[color:var(--sand-surface-strong)]"
              >
                Annuler
              </button>
              <button
                onClick={handlePurge}
                disabled={confirmationPhrase !== 'CONFIRMER SUPPRESSION' || purgeant}
                className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {purgeant ? 'Purge en cours...' : 'Purger toutes les donnees'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
