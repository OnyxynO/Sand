// Grille de saisie hebdomadaire (version desktop)

import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatJourEnTete } from '../../utils/semaineUtils';
import { HISTORIQUE_SAISIE } from '../../graphql/operations/saisie';
import LigneSaisie from './LigneSaisie';
import TotauxJournaliers from './TotauxJournaliers';
import SelecteurProjetActivite from './SelecteurProjetActivite';
import HistoriqueModal from './HistoriqueModal';

interface HistoriqueState {
  ouvert: boolean;
  ligneId: string;
  dateStr: string;
}

export default function GrilleSemaine() {
  const { lignes, jours, chargement, semaineISO } = useSaisieStore();
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [historique, setHistorique] = useState<HistoriqueState>({
    ouvert: false,
    ligneId: '',
    dateStr: '',
  });
  const tableRef = useRef<HTMLTableElement>(null);

  // Charger l'historique des saisies de la semaine
  const { data: historiqueData } = useQuery(HISTORIQUE_SAISIE, {
    variables: { semaineISO },
    skip: !historique.ouvert,
    fetchPolicy: 'cache-and-network',
  });

  // Ouvrir la modale d'historique pour une cellule
  const handleHistorique = useCallback((ligneId: string, dateStr: string) => {
    setHistorique({ ouvert: true, ligneId, dateStr });
  }, []);

  // Trouver l'historique de la saisie selectionnee
  const historiqueEntries = (() => {
    if (!historique.ouvert || !historiqueData?.mesSaisiesSemaine) return [];
    const ligne = lignes.find((l) => l.id === historique.ligneId);
    if (!ligne) return [];

    const saisie = historiqueData.mesSaisiesSemaine.find(
      (s: { date: string; projet: { id: string }; activite: { id: string }; historique: unknown[] }) =>
        s.date === historique.dateStr &&
        s.projet.id === ligne.projetId &&
        s.activite.id === ligne.activiteId
    );
    return saisie?.historique || [];
  })();

  const historiqueInfo = (() => {
    if (!historique.ouvert) return { activiteNom: '', projetCode: '' };
    const ligne = lignes.find((l) => l.id === historique.ligneId);
    return {
      activiteNom: ligne?.activiteNom || '',
      projetCode: ligne?.projetCode || '',
    };
  })();

  // Navigation entre cellules avec les fleches / Tab
  const handleCellNavigate = useCallback(
    (ligneIndex: number, jourIndex: number) => {
      // Trouver la cellule cible et la focus
      // Cette implementation basique pourrait etre amelioree avec des refs
      const table = tableRef.current;
      if (!table) return;

      const rows = table.querySelectorAll('tbody tr');
      const targetRow = rows[ligneIndex];
      if (!targetRow) return;

      // +1 pour la colonne projet/activite
      const cells = targetRow.querySelectorAll('td');
      const targetCell = cells[jourIndex + 1];
      if (!targetCell) return;

      const focusable = targetCell.querySelector('[tabindex], input, button');
      if (focusable instanceof HTMLElement) {
        focusable.focus();
        focusable.click(); // Pour les cellules en mode lecture
      }
    },
    []
  );

  if (chargement) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Chargement des saisies...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full">
            {/* En-tete */}
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">
                  Projet / Activite
                </th>
                {jours.map((jour) => (
                  <th
                    key={jour.dateStr}
                    className={`px-1 py-3 text-center text-xs font-semibold uppercase tracking-wider w-16 ${
                      jour.estAujourdhui
                        ? 'text-blue-600 bg-blue-50'
                        : jour.estFutur
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatJourEnTete(jour)}
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Lignes de saisie */}
              {lignes.map((ligne, index) => (
                <LigneSaisie
                  key={ligne.id}
                  ligne={ligne}
                  jours={jours}
                  indexLigne={index}
                  onNavigate={handleCellNavigate}
                  onHistorique={handleHistorique}
                />
              ))}

              {/* Bouton ajouter une ligne */}
              <tr>
                <td colSpan={jours.length + 2} className="px-3 py-2">
                  <button
                    onClick={() => setModaleOuverte(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Ajouter une ligne</span>
                  </button>
                </td>
              </tr>

              {/* Ligne des totaux */}
              <TotauxJournaliers jours={jours} />
            </tbody>
          </table>
        </div>

        {/* Message si aucune ligne */}
        {lignes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune saisie pour cette semaine.</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter une ligne" pour commencer.</p>
          </div>
        )}
      </div>

      {/* Modale de selection */}
      <SelecteurProjetActivite
        ouvert={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />

      {/* Modale d'historique */}
      <HistoriqueModal
        ouvert={historique.ouvert}
        onFermer={() => setHistorique({ ouvert: false, ligneId: '', dateStr: '' })}
        historique={historiqueEntries}
        activiteNom={historiqueInfo.activiteNom}
        projetCode={historiqueInfo.projetCode}
        date={historique.dateStr || new Date().toISOString().slice(0, 10)}
      />
    </>
  );
}
