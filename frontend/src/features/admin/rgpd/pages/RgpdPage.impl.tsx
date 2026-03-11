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

export default function RgpdPage() {
  // --- Section 1 : Suppression utilisateur ---
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState<UserBasique | null>(null);
  const [modaleSuppressionOuverte, setModaleSuppressionOuverte] = useState(false);
  const [confirmationNom, setConfirmationNom] = useState('');
  const [resultatSuppression, setResultatSuppression] = useState<Record<string, number> | null>(null);

  // --- Section 2 : Purge totale ---
  const [modalePurgeOuverte, setModalePurgeOuverte] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [resultatPurge, setResultatPurge] = useState<Record<string, number> | null>(null);

  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY, {
    variables: { actifSeulement: false },
  });

  const [supprimerDonnees, { loading: supprimant }] = useMutation(SUPPRIMER_DONNEES_UTILISATEUR, {
    onCompleted: (data) => {
      setResultatSuppression(data.supprimerDonneesUtilisateur);
      setModaleSuppressionOuverte(false);
      setConfirmationNom('');
      setUtilisateurSelectionne(null);
    },
  });

  const [purgerDonnees, { loading: purgeant }] = useMutation(PURGER_TOUTES_DONNEES, {
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
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-3">
        <ShieldExclamationIcon className="w-7 h-7 text-gray-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RGPD - Gestion des donnees</h1>
          <p className="text-gray-600 mt-1">Suppression des donnees personnelles et purge</p>
        </div>
      </div>

      {/* Section 1 : Suppression donnees utilisateur */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrashIcon className="w-5 h-5" />
          Suppression des donnees d'un utilisateur
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Supprime toutes les saisies, absences, notifications et exports d'un utilisateur (droit a l'oubli).
          Les logs de modification sont anonymises.
        </p>

        <div className="mt-4">
          <label htmlFor="select-utilisateur" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="block w-full max-w-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer les donnees de {utilisateurSelectionne.prenom} {utilisateurSelectionne.nom}
            </button>
          </div>
        )}

        {/* Resultat suppression */}
        {resultatSuppression && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
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
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          Purge totale des donnees
        </h2>
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-4">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            Purger toutes les donnees
          </button>
        </div>

        {/* Resultat purge */}
        {resultatPurge && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Pour confirmer, retapez le nom complet de l'utilisateur :
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">{nomCompletAttendu}</p>
            <input
              type="text"
              value={confirmationNom}
              onChange={(e) => setConfirmationNom(e.target.value)}
              placeholder="Prenom Nom"
              className="mt-3 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
              data-testid="input-confirmation-nom"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setModaleSuppressionOuverte(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSuppression}
                disabled={confirmationNom !== nomCompletAttendu || supprimant}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {supprimant ? 'Suppression...' : 'Supprimer definitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale purge totale */}
      {modalePurgeOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-700">
              Purge totale - Confirmation
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Pour confirmer, tapez exactement :
            </p>
            <p className="mt-1 text-sm font-bold text-red-700">CONFIRMER SUPPRESSION</p>
            <input
              type="text"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder="Tapez la phrase de confirmation"
              className="mt-3 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
              data-testid="input-confirmation-purge"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setModalePurgeOuverte(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handlePurge}
                disabled={confirmationPhrase !== 'CONFIRMER SUPPRESSION' || purgeant}
                className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
