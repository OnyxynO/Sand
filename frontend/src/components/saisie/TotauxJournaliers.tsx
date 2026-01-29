// Composant ligne des totaux journaliers avec indicateurs de warning

import { useSaisieStore } from '../../stores/saisieStore';
import { formatDuree, calculerTotal } from '../../utils/semaineUtils';
import type { JourSemaine } from '../../types';

interface TotauxJournaliersProps {
  jours: JourSemaine[];
}

export default function TotauxJournaliers({ jours }: TotauxJournaliersProps) {
  const { getTotalJour } = useSaisieStore();

  // Calculer les totaux pour chaque jour
  const totauxJours = jours.map((jour) => ({
    jour,
    total: getTotalJour(jour.dateStr),
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
        // Determiner le style selon le total
        // - Jours passes non saisis sans valeur : warning leger
        // - Total != 1.0 pour jours travailles : warning orange
        // - Total == 1.0 : ok vert
        // - Jours futurs : gris

        let cellClasses = 'text-center font-medium text-sm';
        let bgClasses = '';

        if (jour.estFutur) {
          // Jour futur
          cellClasses += ' text-gray-400';
          bgClasses = 'bg-gray-100';
        } else if (total === 0) {
          // Pas de saisie (pas forcement un probleme pour weekend)
          cellClasses += ' text-gray-500';
        } else if (Math.abs(total - 1.0) < 0.001) {
          // Total = 1.0 (avec tolerance pour erreurs flottants)
          cellClasses += ' text-green-700';
          bgClasses = 'bg-green-50';
        } else {
          // Total != 1.0 (warning)
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
