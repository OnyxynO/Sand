// Bloc d'affichage et de saisie des absences — indépendant de la grille de saisie projet/activité

import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatJourEnTete, formatDuree } from '../../utils/semaineUtils';
import { DECLARER_ABSENCE } from '../../graphql/operations/saisie';
import type { AbsenceJour } from '../../types';

const TYPES_ABSENCE = [
  { valeur: 'conges_payes', libelle: 'Congés payés' },
  { valeur: 'rtt', libelle: 'RTT' },
  { valeur: 'maladie', libelle: 'Maladie' },
  { valeur: 'formation', libelle: 'Formation' },
  { valeur: 'autre', libelle: 'Autre' },
];

interface BlocAbsencesProps {
  absencesParJour: Record<string, AbsenceJour>;
  modeAbsence: string;
  onAbsenceModifiee: () => void;
  userId?: string | null;
}

export default function BlocAbsences({ absencesParJour, modeAbsence, onAbsenceModifiee, userId }: BlocAbsencesProps) {
  const { jours } = useSaisieStore();

  const [modaleDate, setModaleDate] = useState<string | null>(null);
  const [typeSelectionne, setTypeSelectionne] = useState('conges_payes');
  const [dureeSelectionnee, setDureeSelectionnee] = useState(1);

  const [declarerAbsence] = useMutation(DECLARER_ABSENCE, {
    onCompleted: () => onAbsenceModifiee(),
  });

  // Clic sur cellule vide → modale type+durée ; clic sur absence existante → cycle durée (1 → 0.5 → supprimer)
  const handleCellClick = useCallback(
    (dateStr: string, absence: AbsenceJour | undefined) => {
      if (absence) {
        const nouvelleDuree = absence.dureeJournaliere === 1 ? 0.5 : null;
        declarerAbsence({ variables: { date: dateStr, duree: nouvelleDuree, userId: userId ?? undefined } });
      } else {
        setTypeSelectionne('conges_payes');
        setDureeSelectionnee(1);
        setModaleDate(dateStr);
      }
    },
    [declarerAbsence, userId],
  );

  const handleConfirmer = useCallback(() => {
    if (!modaleDate) return;
    declarerAbsence({
      variables: { date: modaleDate, duree: dureeSelectionnee, type: typeSelectionne, userId: userId ?? undefined },
    });
    setModaleDate(null);
  }, [declarerAbsence, modaleDate, dureeSelectionnee, typeSelectionne, userId]);

  // En mode API : n'afficher que s'il y a des absences
  // En mode manuel : toujours afficher pour permettre la saisie
  const aDesAbsences = modeAbsence === 'manuel' || Object.keys(absencesParJour).length > 0;
  if (!aDesAbsences) return null;

  const totalSemaine = jours.reduce(
    (sum, j) => sum + (absencesParJour[j.dateStr]?.dureeJournaliere || 0),
    0,
  );

  return (
    <>
      {modaleDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModaleDate(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-5 w-72 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Déclarer une absence</h3>
              <button
                onClick={() => setModaleDate(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Type d'absence</p>
              <div className="space-y-1">
                {TYPES_ABSENCE.map(({ valeur, libelle }) => (
                  <button
                    key={valeur}
                    onClick={() => setTypeSelectionne(valeur)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      typeSelectionne === valeur
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {libelle}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 mb-2">Durée</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDureeSelectionnee(1)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    dureeSelectionnee === 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Journée
                </button>
                <button
                  onClick={() => setDureeSelectionnee(0.5)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    dureeSelectionnee === 0.5
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Demi-journée
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModaleDate(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmer}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

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
                            ? `Absence : ${formatDuree(absence.dureeJournaliere)} ETP — cliquer pour changer la durée`
                            : 'Cliquer pour déclarer une absence'
                        }
                        onClick={() => handleCellClick(jour.dateStr, absence)}
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
    </>
  );
}
