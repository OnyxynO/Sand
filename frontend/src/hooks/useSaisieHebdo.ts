// Hook pour la logique de chargement et sauvegarde des saisies hebdomadaires

import { useEffect, useCallback, useMemo } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { useSaisieStore } from '../stores/saisieStore';
import {
  MES_SAISIES_SEMAINE,
  ABSENCES_SEMAINE,
  SYNC_ABSENCES,
  BULK_CREATE_TIME_ENTRIES,
  BULK_UPDATE_TIME_ENTRIES,
  DELETE_TIME_ENTRY,
} from '../graphql/operations/saisie';
import { parseSemaineISO } from '../utils/semaineUtils';
import { endOfWeek, format, eachDayOfInterval, isAfter, isBefore } from 'date-fns';
import type { SaisieAPI, TimeEntryInput, BulkUpdateEntry, AbsenceJour, AbsenceAPI } from '../types';

interface UseSaisieHebdoResult {
  // Etat
  chargement: boolean;
  sauvegarde: boolean;
  erreur: string | null;
  aDesModifications: boolean;
  absencesParJour: Record<string, AbsenceJour>;

  // Actions
  charger: () => void;
  sauvegarder: () => Promise<void>;
}

/**
 * Transforme les absences API (plages de dates) en map jour→absence
 * pour chaque jour de la semaine.
 */
export function transformerAbsences(
  absences: AbsenceAPI[],
  semaineISO: string
): Record<string, AbsenceJour> {
  const result: Record<string, AbsenceJour> = {};

  const lundi = parseSemaineISO(semaineISO);
  const dimanche = endOfWeek(lundi, { weekStartsOn: 1 });

  for (const absence of absences) {
    const absDebut = new Date(absence.dateDebut + 'T00:00:00');
    const absFin = new Date(absence.dateFin + 'T00:00:00');

    // Borner aux jours de la semaine
    const debut = isAfter(absDebut, lundi) ? absDebut : lundi;
    const fin = isBefore(absFin, dimanche) ? absFin : dimanche;

    if (isAfter(debut, fin)) continue;

    const jours = eachDayOfInterval({ start: debut, end: fin });
    for (const jour of jours) {
      const dateStr = format(jour, 'yyyy-MM-dd');
      result[dateStr] = {
        type: absence.type,
        typeLibelle: absence.typeLibelle,
        dureeJournaliere: absence.dureeJournaliere,
      };
    }
  }

  return result;
}

/**
 * Hook de saisie hebdomadaire.
 * @param userId - ID utilisateur cible (moderation). Null = soi-meme.
 */
export function useSaisieHebdo(userId?: string | null): UseSaisieHebdoResult {
  const {
    semaineISO,
    lignes,
    chargement,
    sauvegarde,
    erreur,
    chargerSaisies,
    reinitialiserModifications,
    setChargement,
    setSauvegarde,
    setErreur,
    aDifficultes,
    getModifications,
  } = useSaisieStore();

  // Calculer les dates de la semaine pour la query absences
  const datesSemaine = useMemo(() => {
    const lundi = parseSemaineISO(semaineISO);
    const dimanche = endOfWeek(lundi, { weekStartsOn: 1 });
    return {
      dateDebut: format(lundi, 'yyyy-MM-dd'),
      dateFin: format(dimanche, 'yyyy-MM-dd'),
    };
  }, [semaineISO]);

  // Query pour charger les saisies
  const [fetchSaisies, { loading: queryLoading, data, error: queryError }] = useLazyQuery<{
    mesSaisiesSemaine: SaisieAPI[];
  }>(MES_SAISIES_SEMAINE, {
    fetchPolicy: 'network-only', // Toujours recharger depuis le serveur
  });

  // Query pour charger les absences
  const [fetchAbsences, { data: absencesData }] = useLazyQuery<{
    absences: AbsenceAPI[];
  }>(ABSENCES_SEMAINE, {
    fetchPolicy: 'network-only',
  });

  // Mutation de synchronisation (best effort, ignore les erreurs d'autorisation)
  const [syncAbsences] = useMutation(SYNC_ABSENCES);

  // Mutations pour la sauvegarde
  const [bulkCreate] = useMutation(BULK_CREATE_TIME_ENTRIES);
  const [bulkUpdate] = useMutation(BULK_UPDATE_TIME_ENTRIES);
  const [deleteEntry] = useMutation(DELETE_TIME_ENTRY);

  // Transformer les absences en map jour→absence
  const absencesParJour = useMemo(() => {
    if (!absencesData?.absences) return {};
    return transformerAbsences(absencesData.absences, semaineISO);
  }, [absencesData, semaineISO]);

  // Synchroniser l'etat de chargement
  useEffect(() => {
    setChargement(queryLoading);
  }, [queryLoading, setChargement]);

  // Gerer les donnees chargees
  useEffect(() => {
    if (data?.mesSaisiesSemaine) {
      chargerSaisies(data.mesSaisiesSemaine);
      setErreur(null);
    }
  }, [data, chargerSaisies, setErreur]);

  // Gerer les erreurs
  useEffect(() => {
    if (queryError) {
      setErreur(`Erreur de chargement : ${queryError.message}`);
    }
  }, [queryError, setErreur]);

  // Charger les saisies et absences quand la semaine ou l'utilisateur cible change
  useEffect(() => {
    const variables = {
      semaine: semaineISO,
      ...(userId ? { userId } : {}),
    };

    fetchSaisies({ variables });

    // Synchro absences (best effort, ignore les erreurs d'autorisation)
    const absVariables = {
      dateDebut: datesSemaine.dateDebut,
      dateFin: datesSemaine.dateFin,
      ...(userId ? { userId } : {}),
    };

    syncAbsences({ variables: absVariables }).catch(() => {
      // Ignorer les erreurs (permission refusee pour les utilisateurs simples)
    }).finally(() => {
      fetchAbsences({ variables: absVariables });
    });
  }, [semaineISO, userId, fetchSaisies, fetchAbsences, syncAbsences, datesSemaine]);

  // Fonction de chargement manuel
  const charger = useCallback(() => {
    fetchSaisies({
      variables: {
        semaine: semaineISO,
        ...(userId ? { userId } : {}),
      },
    });
    fetchAbsences({
      variables: {
        dateDebut: datesSemaine.dateDebut,
        dateFin: datesSemaine.dateFin,
        ...(userId ? { userId } : {}),
      },
    });
  }, [fetchSaisies, fetchAbsences, semaineISO, userId, datesSemaine]);

  // Fonction de sauvegarde
  const sauvegarder = useCallback(async () => {
    const { nouvelles, modifiees, supprimees } = getModifications();

    // Rien a sauvegarder
    if (nouvelles.length === 0 && modifiees.length === 0 && supprimees.length === 0) {
      return;
    }

    setSauvegarde(true);
    setErreur(null);

    try {
      // Preparer les donnees pour les nouvelles saisies
      const inputsNouvelles: TimeEntryInput[] = nouvelles.map(({ ligneId, dateStr, data: celluleData }) => {
        const ligne = lignes.find((l) => l.id === ligneId);
        if (!ligne) throw new Error(`Ligne introuvable: ${ligneId}`);

        return {
          projetId: ligne.projetId,
          activiteId: ligne.activiteId,
          date: dateStr,
          duree: celluleData.duree!,
          commentaire: celluleData.commentaire,
          ...(userId ? { userId } : {}),
        };
      });

      // Preparer les donnees pour les modifications
      const entriesModifiees: BulkUpdateEntry[] = modifiees.map(({ data: celluleData }) => ({
        id: celluleData.id!,
        duree: celluleData.duree!,
        commentaire: celluleData.commentaire,
      }));

      // Executer les operations en parallele
      const operations: Promise<unknown>[] = [];

      if (inputsNouvelles.length > 0) {
        operations.push(
          bulkCreate({
            variables: { inputs: inputsNouvelles },
          })
        );
      }

      if (entriesModifiees.length > 0) {
        operations.push(
          bulkUpdate({
            variables: { entries: entriesModifiees },
          })
        );
      }

      // Supprimer une par une (pas de mutation bulk delete)
      for (const { id } of supprimees) {
        operations.push(deleteEntry({ variables: { id } }));
      }

      await Promise.all(operations);

      // Recharger les donnees apres sauvegarde
      await fetchSaisies({
        variables: {
          semaine: semaineISO,
          ...(userId ? { userId } : {}),
        },
      });
      reinitialiserModifications();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setErreur(`Erreur de sauvegarde : ${message}`);
      throw err;
    } finally {
      setSauvegarde(false);
    }
  }, [
    getModifications,
    lignes,
    userId,
    bulkCreate,
    bulkUpdate,
    deleteEntry,
    fetchSaisies,
    semaineISO,
    reinitialiserModifications,
    setSauvegarde,
    setErreur,
  ]);

  return {
    chargement,
    sauvegarde,
    erreur,
    aDesModifications: aDifficultes(),
    absencesParJour,
    charger,
    sauvegarder,
  };
}
