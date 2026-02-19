// Composant ligne des totaux journaliers avec indicateurs de warning

import { useSaisieStore } from '../../stores/saisieStore';
import { formatDuree, calculerTotal } from '../../utils/semaineUtils';
import type { JourSemaine, AbsenceJour } from '../../types';

interface TotauxJournaliersProps {
  jours: JourSemaine[];
  absencesParJour: Record<string, AbsenceJour>;
}

export default function TotauxJournaliers({ jours, absencesParJour }: TotauxJournaliersProps) {
  const { getTotalJour } = useSaisieStore();

  // Calculer les totaux pour chaque jour (saisies + absences)
  const totauxJours = jours.map((jour) => ({
    jour,
    total: getTotalJour(jour.dateStr) + (absencesParJour[jour.dateStr]?.dureeJournaliere || 0),
  }));

  // Total general de la semaine
  const totalSemaine = calculerTotal(totauxJours.map((t) => t.total));

  return (
    <tr className="bg-gray-50 border-t-2 border-gray-200">
      {/* Label */}
      <td className="px-3 py-3">
        <span className="font-semibold text-gray-700">Total</span>
      </td>

      {/* Totaux par jour */}
      {totauxJours.map(({ jour, total }) => {
        let cellClasses = 'text-center font-medium text-sm';
        let bgClasses = '';

        if (jour.estFutur) {
          cellClasses += ' text-gray-400';
          bgClasses = 'bg-gray-100';
        } else if (total === 0) {
          cellClasses += ' text-gray-500';
        } else if (Math.abs(total - 1.0) < 0.001) {
          cellClasses += ' text-green-700';
          bgClasses = 'bg-green-50';
        } else {
          cellClasses += ' text-orange-700';
          bgClasses = 'bg-orange-50';
        }

        return (
          <td key={jour.dateStr} className={`px-1 py-3 ${bgClasses}`}>
            <div className={cellClasses}>
              {total > 0 ? formatDuree(total) : '-'}
            </div>
          </td>
        );
      })}

      {/* Total semaine */}
      <td className="px-3 py-3 text-center">
        <span className="font-bold text-gray-900">{formatDuree(totalSemaine) || '0'}</span>
      </td>
    </tr>
  );
}
