import { eachDayOfInterval, endOfWeek, format, isAfter, isBefore } from 'date-fns';
import { parseSemaineISO } from '../../../utils/semaineUtils';
import type { AbsenceAPI, AbsenceJour } from '../../../types';

/**
 * Transforme les absences API (plages de dates) en map jour -> absence
 * pour chaque jour visible dans la semaine courante.
 */
export function transformerAbsencesParJour(
  absences: AbsenceAPI[],
  semaineISO: string
): Record<string, AbsenceJour> {
  const result: Record<string, AbsenceJour> = {};

  const lundi = parseSemaineISO(semaineISO);
  const dimanche = endOfWeek(lundi, { weekStartsOn: 1 });

  for (const absence of absences) {
    const absDebut = new Date(`${absence.dateDebut}T00:00:00`);
    const absFin = new Date(`${absence.dateFin}T00:00:00`);

    const debut = isAfter(absDebut, lundi) ? absDebut : lundi;
    const fin = isBefore(absFin, dimanche) ? absFin : dimanche;

    if (isAfter(debut, fin)) {
      continue;
    }

    for (const jour of eachDayOfInterval({ start: debut, end: fin })) {
      result[format(jour, 'yyyy-MM-dd')] = {
        type: absence.type,
        typeLibelle: absence.typeLibelle,
        dureeJournaliere: absence.dureeJournaliere,
      };
    }
  }

  return result;
}
