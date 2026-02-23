// Bloc d'affichage et de saisie des absences — indépendant de la grille de saisie projet/activité

import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatJourEnTete, formatDuree } from '../../utils/semaineUtils';
import { DECLARER_ABSENCE } from '../../graphql/operations/saisie';
import type { AbsenceJour } from '../../types';

interface BlocAbsencesProps {
  absencesParJour: Record<string, AbsenceJour>;
  modeAbsence: string;
  onAbsenceModifiee: () => void;
  userId?: string | null;
}

export default function BlocAbsences({ absencesParJour, modeAbsence, onAbsenceModifiee, userId }: BlocAbsencesProps) {
  const { jours } = useSaisieStore();

  const [declarerAbsence] = useMutation(DECLARER_ABSENCE, {
    onCompleted: () => onAbsenceModifiee(),
  });

  // Cycle de durée pour les absences manuelles : vide → 1 → 0.5 → vide
  const handleCycleAbsence = useCallback(
    (dateStr: string, dureeActuelle: number | undefined) => {
      let nouvelleDuree: number | null;
      if (!dureeActuelle) {
        nouvelleDuree = 1;
      } else if (dureeActuelle === 1) {
        nouvelleDuree = 0.5;
      } else {
        nouvelleDuree = null;
      }
      declarerAbsence({ variables: { date: dateStr, duree: nouvelleDuree, userId: userId ?? undefined } });
    },
    [declarerAbsence, userId]
  );

  // En mode API : n'afficher que s'il y a des absences
  // En mode manuel : toujours afficher pour permettre la saisie
  const aDesAbsences = modeAbsence === 'manuel' || Object.keys(absencesParJour).length > 0;
  if (!aDesAbsences) return null;

  const totalSemaine = jours.reduce(
    (sum, j) => sum + (absencesParJour[j.dateStr]?.dureeJournaliere || 0),
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-indigo-400">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-indigo-50 border-b border-indigo-100">
            <tr>
              <th className="px-3 py-2 text-left w-64">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Absences
                  </span>
                  {modeAbsence === 'manuel' && (
                    <span className="text-xs text-indigo-400 font-normal normal-case tracking-normal">
                      (cliquer pour saisir)
                    </span>
                  )}
                </div>
              </th>
              {jours.map((jour) => (
                <th
                  key={jour.dateStr}
                  className={`px-1 py-2 text-center text-xs font-semibold uppercase tracking-wider w-16 ${
                    jour.estAujourdhui
                      ? 'text-blue-600 bg-blue-50'
                      : jour.estFutur
                      ? 'text-gray-400'
                      : 'text-indigo-600'
                  }`}
                >
                  {formatJourEnTete(jour)}
                </th>
              ))}
              <th className="px-3 py-2 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wider w-16">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="bg-indigo-50/40">
              <td className="px-3 py-2">
                <span className="text-sm text-indigo-600">
                  {modeAbsence === 'api' ? 'Importées depuis le système RH' : 'Déclaration manuelle'}
                </span>
              </td>
              {jours.map((jour) => {
                const absence = absencesParJour[jour.dateStr];

                if (modeAbsence === 'manuel') {
                  return (
                    <td
                      key={jour.dateStr}
                      className="px-1 py-2 text-center cursor-pointer hover:bg-indigo-100/60 transition-colors"
                      title={
                        absence
                          ? `Absence : ${formatDuree(absence.dureeJournaliere)} ETP — cliquer pour changer`
                          : 'Cliquer pour declarer une absence'
                      }
                      onClick={() => handleCycleAbsence(jour.dateStr, absence?.dureeJournaliere)}
                    >
                      {absence ? (
                        <div className="text-xs">
                          <div className="font-medium text-indigo-700">{absence.typeLibelle}</div>
                          <div className="text-indigo-500">{formatDuree(absence.dureeJournaliere)}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-indigo-300">—</span>
                      )}
                    </td>
                  );
                }

                // Mode API : lecture seule
                return (
                  <td key={jour.dateStr} className="px-1 py-2 text-center">
                    {absence ? (
                      <div className="text-xs">
                        <div className="font-medium text-indigo-700">{absence.typeLibelle}</div>
                        <div className="text-indigo-500">{formatDuree(absence.dureeJournaliere)}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-indigo-200">—</span>
                    )}
                  </td>
                );
              })}
              <td className="px-3 py-2 text-center">
                <span className="text-xs font-semibold text-indigo-700">
                  {totalSemaine > 0 ? formatDuree(totalSemaine) : '—'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
