import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { REQUEST_EXPORT } from '../graphql/operations/export';
import { PROJETS_ACTIFS } from '../graphql/operations/saisie';
import { TEAMS_FULL_QUERY } from '../graphql/operations/teams';

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

interface ExportResult {
  id: string;
  statut: string;
  demandeLe: string;
}

export default function ExportPage() {
  const initial = useMemo(() => periodeInitiale(), []);
  const [dateDebut, setDateDebut] = useState(initial.debut);
  const [dateFin, setDateFin] = useState(initial.fin);
  const [projetId, setProjetId] = useState('');
  const [equipeId, setEquipeId] = useState('');
  const [exports, setExports] = useState<ExportResult[]>([]);

  const { data: dataProjets } = useQuery(PROJETS_ACTIFS, { fetchPolicy: 'cache-and-network' });
  const { data: dataEquipes } = useQuery(TEAMS_FULL_QUERY, {
    variables: { actifSeulement: true },
    fetchPolicy: 'cache-and-network',
  });

  const projets = dataProjets?.projets ?? [];
  const equipes = dataEquipes?.equipes ?? [];

  const [requestExport, { loading: exporting }] = useMutation(REQUEST_EXPORT, {
    onCompleted: (data) => {
      const result = data.requestExport;
      setExports((prev) => [
        {
          id: result.id,
          statut: result.statut,
          demandeLe: new Date().toLocaleString('fr-FR'),
        },
        ...prev,
      ]);
    },
  });

  const handleExport = () => {
    const input: Record<string, string> = {
      format: 'CSV',
      dateDebut,
      dateFin,
    };
    if (projetId) input.projetId = projetId;
    if (equipeId) input.equipeId = equipeId;

    requestExport({ variables: { input } });
  };

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
          {/* Periode */}
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

          {/* Projet */}
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
              {projets.map((p: { id: string; nom: string; code: string }) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Equipe */}
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
              {equipes.map((e: { id: string; nom: string; code: string }) => (
                <option key={e.id} value={e.id}>
                  {e.code} - {e.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bouton exporter */}
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

      {/* Historique des exports */}
      {exports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Exports demandes</h2>
          <div className="space-y-3">
            {exports.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <StatutBadge statut={exp.statut} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Export CSV</p>
                    <p className="text-xs text-gray-500">Demande le {exp.demandeLe}</p>
                  </div>
                </div>
                {(exp.statut === 'EN_ATTENTE' || exp.statut === 'EN_COURS') && (
                  <p className="text-xs text-gray-500">
                    Vous recevrez une notification quand l'export sera pret.
                  </p>
                )}
                {exp.statut === 'TERMINE' && (
                  <a
                    href={`${baseUrl}/exports/${exp.id}/download`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Telecharger
                  </a>
                )}
              </div>
            ))}
          </div>
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
              <li>L'export est genere en arriere-plan</li>
              <li>Vous recevrez une notification quand le fichier sera pret</li>
              <li>Le lien de telechargement expire apres 24 heures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
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
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-green-700 bg-green-100">
          <CheckCircleIcon className="w-3.5 h-3.5" />
          Pret
        </span>
      );
    case 'ECHEC':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-red-700 bg-red-100">
          <ExclamationTriangleIcon className="w-3.5 h-3.5" />
          Echec
        </span>
      );
    default:
      return null;
  }
}
