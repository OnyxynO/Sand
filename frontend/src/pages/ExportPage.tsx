import { useMemo, useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { REQUEST_EXPORT, MES_EXPORTS, DESACTIVER_EXPORT, SUPPRIMER_EXPORT } from '../graphql/operations/export';
import { PROJETS_ACTIFS } from '../graphql/operations/saisie';
import { TEAMS_FULL_QUERY } from '../graphql/operations/teams';
import { SqueletteTableau } from '../components/Squelette';

function dernierJourDuMois(annee: number, mois: number): number {
  return new Date(annee, mois + 1, 0).getDate();
}

function periodeInitiale() {
  const maintenant = new Date();
  const a = maintenant.getFullYear();
  const m = maintenant.getMonth();
  const debut = `${a}-${String(m + 1).padStart(2, '0')}-01`;
  const fin = `${a}-${String(m + 1).padStart(2, '0')}-${dernierJourDuMois(a, m)}`;
  return { debut, fin };
}

interface ExportJob {
  id: string;
  statut: string;
  filtres: Record<string, string> | null;
  expireLe: string | null;
  creeLe: string;
}

interface Projet {
  id: string;
  nom: string;
  code: string;
}

interface Equipe {
  id: string;
  nom: string;
  code: string;
}

export default function ExportPage() {
  const initial = useMemo(() => periodeInitiale(), []);
  const [dateDebut, setDateDebut] = useState(initial.debut);
  const [dateFin, setDateFin] = useState(initial.fin);
  const [projetId, setProjetId] = useState('');
  const [equipeId, setEquipeId] = useState('');

  const { data: dataProjets } = useQuery(PROJETS_ACTIFS, { fetchPolicy: 'cache-and-network' });
  const { data: dataEquipes } = useQuery(TEAMS_FULL_QUERY, {
    variables: { actifSeulement: true },
    fetchPolicy: 'cache-and-network',
  });
  const { data: dataExports, loading: loadingExports, refetch: refetchExports } = useQuery(MES_EXPORTS, {
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const projets: Projet[] = dataProjets?.projets ?? [];
  const equipes: Equipe[] = dataEquipes?.equipes ?? [];

  // Exports locaux créés dans cette session (affichés immédiatement, avant le refetch)
  const [exportsLocaux, setExportsLocaux] = useState<ExportJob[]>([]);

  const exportsServeur: ExportJob[] = dataExports?.mesExports ?? [];

  // Merge : les exports serveur ont la priorité, on ajoute les locaux pas encore en BDD
  const exports = useMemo(() => {
    const idsServeur = new Set(exportsServeur.map((e) => e.id));
    const pending = exportsLocaux.filter((e) => !idsServeur.has(e.id));
    return [...pending, ...exportsServeur];
  }, [exportsServeur, exportsLocaux]);

  const [requestExport, { loading: exporting }] = useMutation(REQUEST_EXPORT, {
    onCompleted: (data) => {
      // Apparition immédiate de la ligne avec EN_ATTENTE
      setExportsLocaux((prev) => [data.requestExport, ...prev]);
      // Puis refetch pour synchroniser avec le serveur
      refetchExports();
    },
  });

  const [desactiverExport] = useMutation(DESACTIVER_EXPORT, {
    onCompleted: () => refetchExports(),
  });

  const [supprimerExport] = useMutation(SUPPRIMER_EXPORT, {
    onCompleted: () => {
      // Vider le cache local : le refetch serveur fait autorité après suppression
      setExportsLocaux([]);
      refetchExports();
    },
  });

  const handleExport = () => {
    const input: Record<string, string> = { format: 'CSV', dateDebut, dateFin };
    if (projetId) input.projetId = projetId;
    if (equipeId) input.equipeId = equipeId;
    requestExport({ variables: { input } });
  };

  const handleRegenerer = useCallback((exp: ExportJob) => {
    const filtres = exp.filtres ?? {};
    const input: Record<string, string> = {
      format: 'CSV',
      dateDebut: filtres.date_debut ?? dateDebut,
      dateFin: filtres.date_fin ?? dateFin,
    };
    if (filtres.project_id) input.projetId = filtres.project_id;
    if (filtres.team_id) input.equipeId = filtres.team_id;
    requestExport({ variables: { input } });
  }, [exporting, dateDebut, dateFin, requestExport]);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql').replace('/graphql', '');

  const estExpire = (exp: ExportJob) => {
    if (!exp.expireLe) return false;
    return new Date(exp.expireLe) < new Date();
  };

  const estTelechargeable = (exp: ExportJob) =>
    exp.statut === 'TERMINE' && !estExpire(exp);

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Export CSV</h1>
        <p className="text-gray-600 mt-1">
          Exporter les saisies au format CSV pour analyse externe
        </p>
      </div>

      {/* Formulaire filtres */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date-debut" className="block text-sm font-medium text-gray-700 mb-1">
              Date debut
            </label>
            <input
              id="date-debut"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="date-fin" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              id="date-fin"
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label htmlFor="projet-export" className="block text-sm font-medium text-gray-700 mb-1">
              Projet
            </label>
            <select
              id="projet-export"
              value={projetId}
              onChange={(e) => setProjetId(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Tous les projets</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="equipe-export" className="block text-sm font-medium text-gray-700 mb-1">
              Equipe
            </label>
            <select
              id="equipe-export"
              value={equipeId}
              onChange={(e) => setEquipeId(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Toutes les equipes</option>
              {equipes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} - {e.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {exporting ? 'Export en cours...' : 'Exporter en CSV'}
          </button>
        </div>
      </div>

      {/* Squelette historique (premier chargement) */}
      {loadingExports && !dataExports && (
        <SqueletteTableau titre="Historique des exports" lignes={3} />
      )}

      {/* Etat vide (chargement termine, aucun export) */}
      {dataExports && exports.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          <ArrowDownTrayIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucun export pour le moment</p>
        </div>
      )}

      {/* Liste des exports */}
      {exports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historique des exports</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demande le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {exports.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <FiltresCell filtres={exp.filtres} projets={projets} equipes={equipes} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formaterDateHeure(exp.creeLe)}
                  </td>
                  <td className="px-6 py-4">
                    <StatutBadge statut={exp.statut} expire={estExpire(exp)} expireLe={exp.expireLe} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Telecharger / Regenerer */}
                      {estTelechargeable(exp) ? (
                        <a
                          href={`${baseUrl}/exports/${exp.id}/download`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Telecharger
                        </a>
                      ) : (
                        ['ECHEC', 'DESACTIVE', 'TERMINE'].includes(exp.statut) && (
                          <button
                            onClick={() => handleRegenerer(exp)}
                            disabled={exporting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                            Regenerer
                          </button>
                        )
                      )}

                      {/* Desactiver (si fichier encore disponible) */}
                      {exp.statut === 'TERMINE' && (
                        <button
                          onClick={() => desactiverExport({ variables: { id: exp.id } })}
                          title="Supprimer le fichier (conserver la ligne)"
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <MinusCircleIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Supprimer la ligne */}
                      <button
                        onClick={() => supprimerExport({ variables: { id: exp.id } })}
                        title="Supprimer definitivement"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Comment ca marche ?</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Selectionnez les filtres souhaites puis cliquez sur "Exporter"</li>
              <li>L'export est genere en arriere-plan (actualisation automatique toutes les 10 s)</li>
              <li>Vous recevrez une notification quand le fichier sera pret</li>
              <li>Le lien de telechargement expire apres 24 heures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatutBadge({ statut, expire, expireLe }: { statut: string; expire: boolean; expireLe: string | null }) {
  if (statut === 'TERMINE' && expire) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-gray-600 bg-gray-100">
        <XCircleIcon className="w-3.5 h-3.5" />
        Expire
      </span>
    );
  }
  switch (statut) {
    case 'EN_ATTENTE':
    case 'EN_COURS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-yellow-700 bg-yellow-100">
          <ClockIcon className="w-3.5 h-3.5" />
          En cours
        </span>
      );
    case 'TERMINE':
      return (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-green-700 bg-green-100">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Disponible
          </span>
          {expireLe && (
            <p className="text-xs text-gray-400 pl-1">expire le {formaterDateHeure(expireLe)}</p>
          )}
        </div>
      );
    case 'ECHEC':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-red-700 bg-red-100">
          <ExclamationTriangleIcon className="w-3.5 h-3.5" />
          Echec
        </span>
      );
    case 'DESACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-orange-700 bg-orange-100">
          <MinusCircleIcon className="w-3.5 h-3.5" />
          Desactive
        </span>
      );
    default:
      return null;
  }
}

function FiltresCell({ filtres, projets, equipes }: {
  filtres: Record<string, string> | null;
  projets: Projet[];
  equipes: Equipe[];
}) {
  const f = filtres ?? {};
  const projet = f.project_id ? projets.find((p) => p.id === f.project_id) : null;
  const equipe = f.team_id ? equipes.find((e) => e.id === f.team_id) : null;

  return (
    <div className="space-y-1.5">
      {/* Période */}
      <div className="text-sm font-medium text-gray-900">
        {f.date_debut && f.date_fin
          ? `${formaterDate(f.date_debut)} → ${formaterDate(f.date_fin)}`
          : <span className="text-gray-400 font-normal italic">Toutes les dates</span>
        }
      </div>
      {/* Badges projet / équipe */}
      {(projet || equipe) && (
        <div className="flex flex-wrap gap-1">
          {projet && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium">
              {projet.code}
            </span>
          )}
          {equipe && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-violet-50 text-violet-700 font-medium">
              {equipe.nom}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function formaterDate(iso: string): string {
  const [a, m, j] = iso.split('-');
  return `${j}/${m}/${a}`;
}

function formaterDateHeure(iso: string): string {
  const d = new Date(iso);
  const j = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const a = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${j}/${m}/${a} ${hh}:${mm}`;
}
