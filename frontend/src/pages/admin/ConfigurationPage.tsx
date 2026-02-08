import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Cog6ToothIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { PARAMETRES_QUERY, UPDATE_SETTINGS } from '../../graphql/operations/settings';
import NavAdmin from '../../components/admin/NavAdmin';

interface Parametre {
  id: string;
  cle: string;
  valeur: unknown;
  description: string | null;
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

  const { data, loading, error } = useQuery(PARAMETRES_QUERY, {
    fetchPolicy: 'network-only',
  });

  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SETTINGS, {
    onCompleted: () => {
      setModifie(false);
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
      setValeurs(valeursInitiales);
    }
  }, [data]);

  const handleChange = (cle: string, valeur: unknown) => {
    setValeurs((prev) => ({ ...prev, [cle]: valeur }));
    setModifie(true);
    setSucces(false);
  };

  const handleSave = () => {
    const settings = Object.entries(valeurs).map(([cle, valeur]) => ({
      cle,
      valeur,
    }));
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

          {/* Barre d'actions */}
          <div className="p-6 flex items-center justify-between bg-gray-50 rounded-b-xl">
            <div>
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
        </div>
      )}
    </div>
  );
}
