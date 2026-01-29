// Composant ligne de saisie (projet + activite + cellules)

import { TrashIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatDuree } from '../../utils/semaineUtils';
import CelluleSaisie from './CelluleSaisie';
import type { LigneSaisie as LigneSaisieType, JourSemaine } from '../../types';

interface LigneSaisieProps {
  ligne: LigneSaisieType;
  jours: JourSemaine[];
  indexLigne: number;
  onNavigate?: (ligneIndex: number, jourIndex: number) => void;
}

export default function LigneSaisie({ ligne, jours, indexLigne, onNavigate }: LigneSaisieProps) {
  const { supprimerLigne, getTotalLigne } = useSaisieStore();

  const total = getTotalLigne(ligne.id);

  // Verifier si la ligne a des saisies existantes (avec id)
  const aSaisiesExistantes = Object.values(ligne.saisies).some((c) => c.id);

  // Navigation entre cellules
  const handleCellNavigate = (jourIndex: number, direction: 'up' | 'down' | 'left' | 'right') => {
    switch (direction) {
      case 'left':
        if (jourIndex > 0) {
          onNavigate?.(indexLigne, jourIndex - 1);
        }
        break;
      case 'right':
        if (jourIndex < jours.length - 1) {
          onNavigate?.(indexLigne, jourIndex + 1);
        }
        break;
      case 'up':
        onNavigate?.(indexLigne - 1, jourIndex);
        break;
      case 'down':
        onNavigate?.(indexLigne + 1, jourIndex);
        break;
    }
  };

  return (
    <tr className="group hover:bg-gray-50">
      {/* Colonne projet + activite */}
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
            {ligne.projetCode}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate" title={ligne.activiteChemin}>
              {ligne.activiteNom}
            </p>
            <p className="text-xs text-gray-500 truncate" title={ligne.projetNom}>
              {ligne.projetNom}
            </p>
          </div>
          {/* Bouton supprimer (masque si saisies existantes) */}
          {!aSaisiesExistantes && (
            <button
              onClick={() => supprimerLigne(ligne.id)}
              className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              title="Supprimer cette ligne"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>

      {/* Cellules par jour */}
      {jours.map((jour, jourIndex) => {
        const cellule = ligne.saisies[jour.dateStr] || {
          duree: null,
          estModifiee: false,
        };

        return (
          <CelluleSaisie
            key={jour.dateStr}
            ligneId={ligne.id}
            jour={jour}
            cellule={cellule}
            onNavigate={(direction) => handleCellNavigate(jourIndex, direction)}
          />
        );
      })}

      {/* Total ligne */}
      <td className="px-3 py-2 text-center">
        <span className="font-medium text-gray-900">{formatDuree(total) || '-'}</span>
      </td>
    </tr>
  );
}
