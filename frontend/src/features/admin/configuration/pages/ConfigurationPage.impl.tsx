import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Cog6ToothIcon,
  CheckIcon,
  ArrowPathIcon,
  WifiIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { PARAMETRES_QUERY, UPDATE_SETTINGS, RESET_SETTINGS, TESTER_CONNEXION_RH_API } from '../../../../graphql/operations/settings';
import NavAdmin from '../../../../components/admin/NavAdmin';

interface Parametre {
  id: string;
  cle: string;
  valeur: unknown;
  description: string | null;
}

interface ParametresQueryData {
  parametres: Parametre[];
}

interface UpdateSettingsMutationData {
  updateSettings: Parametre[];
}

interface UpdateSettingsMutationVariables {
  settings: Array<{ cle: string; valeur: unknown }>;
}

interface ResetSettingsMutationData {
  resetSettings: Parametre[];
}

interface TesterConnexionRhApiMutationData {
  testerConnexionRhApi: string | null;
}

// Configuration des champs du formulaire
const CHAMPS_CONFIG = [
  {
    cle: 'delai_annulation',
    label: 'Delai d\'annulation (secondes)',
    type: 'number' as const,
    min: 1,
    max: 30,
    description: 'Duree du toast d\'annulation apres une action de masse',
  },
  {
    cle: 'afficher_weekends',
    label: 'Afficher les weekends',
    type: 'boolean' as const,
    description: 'Inclure samedi/dimanche dans la grille de saisie',
  },
  {
    cle: 'premier_jour_semaine',
    label: 'Premier jour de la semaine',
    type: 'select' as const,
    options: [
      { valeur: 1, label: 'Lundi' },
      { valeur: 0, label: 'Dimanche' },
    ],
    description: 'Jour de debut de la semaine dans le calendrier',
  },
  {
    cle: 'jours_retroactifs',
    label: 'Jours retroactifs',
    type: 'number' as const,
    min: 0,
    max: 90,
    description: 'Nombre de jours dans le passe ou la saisie est autorisee',
  },
  {
    cle: 'periode_saisie_defaut',
    label: 'Periode d\'affichage par defaut',
    type: 'select' as const,
    options: [
      { valeur: 'jour', label: 'Jour' },
      { valeur: 'semaine', label: 'Semaine' },
      { valeur: 'mois', label: 'Mois' },
    ],
    description: 'Vue par defaut de la grille de saisie',
  },
  {
    cle: 'rappel_saisie_actif',
    label: 'Rappels de saisie',
    type: 'boolean' as const,
    description: 'Envoyer des notifications pour les saisies incompletes',
  },
];

export default function ConfigurationPage() {
  const [valeurs, setValeurs] = useState<Record<string, unknown>>({});
  const [modifie, setModifie] = useState(false);
  const [succes, setSucces] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [testConnexionResultat, setTestConnexionResultat] = useState<{ ok: boolean; message: string } | null>(null);

  const { data, loading, error } = useQuery<ParametresQueryData>(PARAMETRES_QUERY, {
    fetchPolicy: 'network-only',
  });

  const [updateSettings, { loading: saving, error: saveError }] = useMutation<
    UpdateSettingsMutationData,
    UpdateSettingsMutationVariables
  >(UPDATE_SETTINGS, {
    onCompleted: () => {
      setModifie(false);
      setSucces(true);
      setTimeout(() => setSucces(false), 3000);
    },
    refetchQueries: [{ query: PARAMETRES_QUERY }],
  });

  const [testerConnexionRhApi, { loading: testing }] = useMutation<TesterConnexionRhApiMutationData>(TESTER_CONNEXION_RH_API, {
    onCompleted: (data) => {
      const erreur = data.testerConnexionRhApi;
      setTestConnexionResultat(
        erreur ? { ok: false, message: erreur } : { ok: true, message: 'Connexion etablie avec succes.' }
      );
    },
    onError: (err) => {
      setTestConnexionResultat({ ok: false, message: err.message });
    },
  });

  const [resetSettings, { loading: resetting }] = useMutation<ResetSettingsMutationData>(RESET_SETTINGS, {
    onCompleted: () => {
      setModifie(false);
      setConfirmReset(false);
      setSucces(true);
      setTimeout(() => setSucces(false), 3000);
    },
    refetchQueries: [{ query: PARAMETRES_QUERY }],
  });

  // Charger les valeurs initiales
  useEffect(() => {
    if (data?.parametres) {
      const valeursInitiales: Record<string, unknown> = {};
      data.parametres.forEach((p: Parametre) => {
        valeursInitiales[p.cle] = p.valeur;
      });
      // Synchronisation transitoire avec les settings charges par l'API.
      // La v2 garde encore ce formulaire historique, en attendant une extraction plus profonde.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValeurs(valeursInitiales);
    }
  }, [data]);

  const handleChange = (cle: string, valeur: unknown) => {
    if (cle === 'absence_mode' && valeur === 'manuel') {
      // Effacer les champs API lors du passage en mode manuel
      setValeurs((prev) => ({ ...prev, [cle]: valeur, absence_api_url: '', absence_api_token: '' }));
    } else {
      setValeurs((prev) => ({ ...prev, [cle]: valeur }));
    }
    setModifie(true);
    setSucces(false);
  };

  const handleSave = () => {
    // 'api' est le seul mode explicite — tout autre valeur (undefined, 'manuel', null) = manuel
    const modeManuel = valeurs['absence_mode'] !== 'api';

    const settings = Object.entries(valeurs).map(([cle, valeur]) => {
      // En mode manuel, forcer les champs API à vide
      if (modeManuel && (cle === 'absence_api_url' || cle === 'absence_api_token')) {
        return { cle, valeur: '' };
      }
      // Garantir que la valeur est serialisable en JSON (JSON! non-nullable)
      // NaN -> 0, null/undefined -> '', les valeurs NaN passent en JSON.stringify comme null
      if (valeur === null || valeur === undefined) return { cle, valeur: '' };
      if (typeof valeur === 'number' && !isFinite(valeur)) return { cle, valeur: 0 };
      return { cle, valeur };
    });

    updateSettings({ variables: { settings } });
  };

  return (
    <div className="space-y-6">
      <NavAdmin />

      {/* Titre */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-3">
        <Cog6ToothIcon className="w-7 h-7 text-gray-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration systeme</h1>
          <p className="text-gray-600 mt-1">Parametres globaux de l'application</p>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Erreur lors du chargement : {error.message}
        </div>
      )}

      {/* Chargement */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Formulaire */}
      {!loading && data && (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {CHAMPS_CONFIG.map((champ) => (
            <div key={champ.cle} className="p-6 flex items-center justify-between gap-8">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">
                  {champ.label}
                </label>
                <p className="text-xs text-gray-500 mt-0.5">{champ.description}</p>
              </div>

              <div className="flex-shrink-0 w-48">
                {champ.type === 'number' && (
                  <input
                    type="number"
                    value={Number(valeurs[champ.cle] ?? 0)}
                    onChange={(e) => handleChange(champ.cle, Number(e.target.value))}
                    min={champ.min}
                    max={champ.max}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                )}

                {champ.type === 'boolean' && (
                  <button
                    type="button"
                    onClick={() => handleChange(champ.cle, !valeurs[champ.cle])}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      valeurs[champ.cle] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        valeurs[champ.cle] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}

                {champ.type === 'select' && (
                  <select
                    value={String(valeurs[champ.cle] ?? '')}
                    onChange={(e) => {
                      const opt = champ.options?.find((o) => String(o.valeur) === e.target.value);
                      handleChange(champ.cle, opt?.valeur ?? e.target.value);
                    }}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {champ.options?.map((opt) => (
                      <option key={String(opt.valeur)} value={String(opt.valeur)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Section Gestion des absences */}
      {!loading && data && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Gestion des absences</h2>
          </div>

          {/* Mode */}
          <div className="p-6 flex items-center justify-between gap-8 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">Mode de saisie</label>
              <p className="text-xs text-gray-500 mt-0.5">
                Manuel : les utilisateurs declarent leurs absences directement dans la grille.
                API : les absences sont importees automatiquement depuis le systeme RH externe.
              </p>
            </div>
            <div className="flex-shrink-0 w-48">
              <select
                value={String(valeurs['absence_mode'] ?? 'manuel')}
                onChange={(e) => handleChange('absence_mode', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="manuel">Manuel</option>
                <option value="api">API externe</option>
              </select>
            </div>
          </div>

          {/* Champs API (conditionnels) */}
          {valeurs['absence_mode'] === 'api' && (
            <>
              <div className="p-6 flex items-center justify-between gap-8 border-b border-gray-100">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">URL de l'API RH</label>
                  <p className="text-xs text-gray-500 mt-0.5">Adresse de l'API RH externe (ex : http://rh.entreprise.fr/api)</p>
                </div>
                <div className="flex-shrink-0 w-72">
                  <input
                    type="text"
                    value={String(valeurs['absence_api_url'] ?? '')}
                    onChange={(e) => handleChange('absence_api_url', e.target.value)}
                    placeholder="https://rh.exemple.fr/api"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="p-6 flex items-center justify-between gap-8 border-b border-gray-100">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">Token d'authentification</label>
                  <p className="text-xs text-gray-500 mt-0.5">Token Bearer pour l'API RH (stocke en base de donnees)</p>
                </div>
                <div className="flex-shrink-0 w-72">
                  <input
                    type="password"
                    value={String(valeurs['absence_api_token'] ?? '')}
                    onChange={(e) => handleChange('absence_api_token', e.target.value)}
                    placeholder="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="p-6 flex items-center gap-4 bg-gray-50">
                <button
                  onClick={() => {
                    setTestConnexionResultat(null);
                    testerConnexionRhApi();
                  }}
                  disabled={testing || modifie}
                  title={modifie ? 'Enregistrez d\'abord les modifications avant de tester' : undefined}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <WifiIcon className="w-4 h-4" />
                  {testing ? 'Test en cours...' : 'Tester la connexion'}
                </button>
                {modifie && (
                  <span className="text-xs text-gray-500">Enregistrez d'abord avant de tester.</span>
                )}
                {testConnexionResultat && !modifie && (
                  <span className={`text-sm font-medium ${testConnexionResultat.ok ? 'text-green-700' : 'text-red-700'}`}>
                    {testConnexionResultat.ok ? '✓ ' : '✗ '}{testConnexionResultat.message}
                  </span>
                )}
              </div>

              {/* Config de test — mock RH dev uniquement */}
              {import.meta.env.DEV && (
                <div className="px-6 pb-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      Config de test (mock RH local) :
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>
                        URL :{' '}
                        <code className="bg-amber-100 px-1 rounded">http://mock-rh:3001/api</code>
                        <span className="ml-1 text-amber-500">(hostname Docker interne)</span>
                      </li>
                      <li>
                        Token :{' '}
                        <code className="bg-amber-100 px-1 rounded">mock-token-dev</code>
                        <span className="ml-1 text-amber-500">(non vérifié par le mock)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Erreur de sauvegarde */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Erreur lors de l'enregistrement : {saveError.message}
        </div>
      )}

      {/* Barre d'actions — en bas de toute la configuration */}
      {!loading && data && (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setConfirmReset(true)}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reinitialiser
            </button>
            {succes && (
              <span className="inline-flex items-center gap-1 text-sm text-green-700">
                <CheckIcon className="w-4 h-4" />
                Parametres enregistres
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!modifie || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}

      {/* Modale de confirmation reset */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Reinitialiser les parametres ?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Tous les parametres seront remis a leurs valeurs par defaut. Cette action est irreversible.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => resetSettings()}
                disabled={resetting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {resetting ? 'Reinitialisation...' : 'Reinitialiser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
