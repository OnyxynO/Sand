import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MinusCircleIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Popover } from '@headlessui/react';
import { REQUEST_EXPORT, MES_EXPORTS, DESACTIVER_EXPORT, SUPPRIMER_EXPORT } from '../../../graphql/operations/export';
import { PROJETS_ACTIFS } from '../../../graphql/operations/saisie';
import { TEAMS_FULL_QUERY } from '../../../graphql/operations/teams';
import { useNotificationStore } from '../../../stores/notificationStore';
import { SqueletteTableau } from '../../../components/Squelette';

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

interface ProjetsQueryData {
  projets: Projet[];
}

interface EquipesQueryData {
  equipes: Equipe[];
}

interface MesExportsQueryData {
  mesExports: ExportJob[];
}

interface RequestExportMutationData {
  requestExport: ExportJob;
}

interface RequestExportMutationVariables {
  input: Record<string, string>;
}

interface DesactiverExportMutationData {
  desactiverExport: ExportJob;
}

interface DesactiverExportMutationVariables {
  id: string;
}

interface SupprimerExportMutationData {
  supprimerExport: boolean;
}

interface SupprimerExportMutationVariables {
  id: string;
}

function libStatut(statut: string): string {
  switch (statut) {
    case 'EN_ATTENTE': return 'En attente';
    case 'EN_COURS': return 'En cours';
    case 'TERMINE': return 'Disponible';
    case 'ECHEC': return 'Echec';
    case 'DESACTIVE': return 'Désactivé';
    default: return statut;
  }
}

function InfoPopover({ job, projets, equipes }: { job: ExportJob; projets: Projet[]; equipes: Equipe[] }) {
  const f = job.filtres ?? {};
  const projet = f.project_id ? projets.find((p) => p.id === f.project_id) : null;
  const equipe = f.team_id ? equipes.find((e) => e.id === f.team_id) : null;

  const lignes: { label: string; valeur: string }[] = [
    { label: 'Identifiant', valeur: job.id.slice(0, 8) },
    { label: 'Demandé le', valeur: formaterDateHeure(job.creeLe) },
    { label: 'Expire le', valeur: job.expireLe ? formaterDateHeure(job.expireLe) : '—' },
    { label: 'Statut', valeur: libStatut(job.statut) },
    { label: 'Format', valeur: 'CSV' },
    {
      label: 'Période',
      valeur: f.date_debut && f.date_fin
        ? `${formaterDate(f.date_debut)} → ${formaterDate(f.date_fin)}`
        : 'Toutes les dates',
    },
    { label: 'Projet', valeur: projet ? `${projet.code} - ${projet.nom}` : 'Tous les projets' },
    { label: 'Équipe', valeur: equipe ? equipe.nom : 'Toutes les équipes' },
  ];

  return (
    <Popover className="relative">
      <Popover.Button
        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
        title="Détails de l'export"
      >
        <InformationCircleIcon className="w-4 h-4" />
      </Popover.Button>

      <Popover.Panel className="absolute right-0 bottom-full mb-1 z-10 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-sm">
        <p className="font-semibold text-gray-800 mb-3">Détails de l'export</p>
        <dl className="space-y-1.5">
          {lignes.map(({ label, valeur }) => (
            <div key={label} className="grid grid-cols-2 gap-2">
              <dt className="text-gray-500">{label}</dt>
              <dd
                className="text-gray-900 font-medium truncate"
                title={label === 'Identifiant' ? job.id : undefined}
              >
                {valeur}
              </dd>
            </div>
          ))}
        </dl>
      </Popover.Panel>
    </Popover>
  );
}

export default function ExportPage() {
  const initial = useMemo(() => periodeInitiale(), []);
  const [dateDebut, setDateDebut] = useState(initial.debut);
  const [dateFin, setDateFin] = useState(initial.fin);
  const [projetId, setProjetId] = useState('');
  const [equipeId, setEquipeId] = useState('');

  const { data: dataProjets } = useQuery<ProjetsQueryData>(PROJETS_ACTIFS, { fetchPolicy: 'cache-and-network' });
  const { data: dataEquipes } = useQuery<EquipesQueryData>(TEAMS_FULL_QUERY, {
    variables: { actifSeulement: true },
    fetchPolicy: 'cache-and-network',
  });
  const { data: dataExports, loading: loadingExports, refetch: refetchExports } = useQuery<MesExportsQueryData>(MES_EXPORTS, {
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const projets: Projet[] = dataProjets?.projets ?? [];
  const equipes: Equipe[] = dataEquipes?.equipes ?? [];

  // Exports locaux créés dans cette session (affichés immédiatement, avant le refetch)
  const [exportsLocaux, setExportsLocaux] = useState<ExportJob[]>([]);

  // Délai minimum "En cours" : timestamp jusqu'auquel masquer TERMINE pour chaque export ID
  const [delaiFin, setDelaiFin] = useState<Record<string, number>>({});

  // Re-render automatique à l'expiration du délai
  useEffect(() => {
    const timestamps = Object.values(delaiFin);
    if (timestamps.length === 0) return;
    const now = Date.now();
    const prochains = timestamps.filter((t) => t > now);
    if (prochains.length === 0) return;
    const delai = Math.min(...prochains) - now;
    const timer = setTimeout(() => {
      setDelaiFin((prev) => {
        const now2 = Date.now();
        const next: Record<string, number> = {};
        for (const [id, t] of Object.entries(prev)) {
          if (t > now2) next[id] = t;
        }
        return next;
      });
    }, delai);
    return () => clearTimeout(timer);
  }, [delaiFin]);

  // Retourne le statut à afficher : masque TERMINE pendant 3 s après création
  const statutAffiche = useCallback(
    (exp: ExportJob): string => {
      if (exp.statut === 'TERMINE' && delaiFin[exp.id] && Date.now() < delaiFin[exp.id]) {
        return 'EN_COURS';
      }
      return exp.statut;
    },
    [delaiFin],
  );

  const exportsServeur = useMemo<ExportJob[]>(
    () => dataExports?.mesExports ?? [],
    [dataExports?.mesExports],
  );

  // Observer : détecte les transitions vers TERMINE et signale à NotificationBell
  // de refetch immédiatement, sans attendre le poll de 60 s.
  const signalRefreshCount = useNotificationStore((s) => s.signalRefreshCount);
  const statutsPrecedents = useRef<Record<string, string>>({});
  useEffect(() => {
    const precedents = statutsPrecedents.current;
    let nouveauTermine = false;
    for (const exp of exportsServeur) {
      const precedent = precedents[exp.id];
      // Signal si TERMINE et :
      // - transition depuis un statut connu (precedent !== undefined) : cas normal
      // - OU export créé dans cette session (dans exportsLocaux) : cas job très rapide
      //   (TERMINE direct au premier poll, precedent === undefined car jamais vu EN_ATTENTE)
      const estDeSession = exportsLocaux.some((e) => e.id === exp.id);
      if (
        exp.statut === 'TERMINE' &&
        precedent !== 'TERMINE' &&
        (precedent !== undefined || estDeSession)
      ) {
        nouveauTermine = true;
      }
      precedents[exp.id] = exp.statut;
    }
    if (nouveauTermine) {
      signalRefreshCount();
    }
  }, [exportsLocaux, exportsServeur, signalRefreshCount]);

  // Merge : les exports serveur ont la priorité, on ajoute les locaux pas encore en BDD
  const exports = useMemo(() => {
    const idsServeur = new Set(exportsServeur.map((e) => e.id));
    const pending = exportsLocaux.filter((e) => !idsServeur.has(e.id));
    return [...pending, ...exportsServeur];
  }, [exportsServeur, exportsLocaux]);

  const [requestExport, { loading: exporting }] = useMutation<
    RequestExportMutationData,
    RequestExportMutationVariables
  >(REQUEST_EXPORT, {
    onCompleted: (data) => {
      const id: string = data.requestExport.id;
      // Garantir 3 s minimum en état "En cours" pour que le badge soit visible
      setDelaiFin((prev) => ({ ...prev, [id]: Date.now() + 3000 }));
      // Apparition immédiate de la ligne avec EN_ATTENTE
      setExportsLocaux((prev) => [data.requestExport, ...prev]);
      // Puis refetch pour synchroniser avec le serveur
      refetchExports();
    },
  });

  const [desactiverExport] = useMutation<
    DesactiverExportMutationData,
    DesactiverExportMutationVariables
  >(DESACTIVER_EXPORT, {
    onCompleted: () => refetchExports(),
  });

  const [supprimerExport] = useMutation<
    SupprimerExportMutationData,
    SupprimerExportMutationVariables
  >(SUPPRIMER_EXPORT, {
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
  }, [dateDebut, dateFin, requestExport]);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql').replace('/graphql', '');

  const estExpire = (exp: ExportJob) => {
    if (!exp.expireLe) return false;
    return new Date(exp.expireLe) < new Date();
  };

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
              {exports.map((exp) => {
                const statut = statutAffiche(exp);
                return (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formaterDateHeure(exp.creeLe)}
                  </td>
                  <td className="px-6 py-4">
                    <StatutBadge statut={statut} expire={estExpire(exp)} expireLe={exp.expireLe} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Détails */}
                      <InfoPopover job={exp} projets={projets} equipes={equipes} />

                      {/* Telecharger / Regenerer */}
                      {statut === 'TERMINE' && !estExpire(exp) ? (
                        <a
                          href={`${baseUrl}/exports/${exp.id}/download`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Telecharger
                        </a>
                      ) : (
                        ['ECHEC', 'DESACTIVE', 'TERMINE'].includes(statut) && (
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
                      {statut === 'TERMINE' && (
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
                );
              })}
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
