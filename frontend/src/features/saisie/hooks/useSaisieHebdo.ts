import { useEffect, useCallback, useMemo } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { endOfWeek, format } from 'date-fns';
import {
  ABSENCES_SEMAINE,
  BULK_CREATE_TIME_ENTRIES,
  BULK_UPDATE_TIME_ENTRIES,
  DELETE_TIME_ENTRY,
  MES_SAISIES_SEMAINE,
  SYNC_ABSENCES,
} from '../../../graphql/operations/saisie';
import { PARAMETRE_ABSENCE_MODE } from '../../../graphql/operations/settings';
import { useSaisieStore } from '../../../stores/saisieStore';
import { parseSemaineISO } from '../../../utils/semaineUtils';
import type { AbsenceAPI, SaisieAPI } from '../../../types';
import { transformerAbsencesParJour } from '../lib/absences';
import { construirePayloadSauvegarde } from '../lib/saisieMapping';

interface UseSaisieHebdoResult {
  chargement: boolean;
  sauvegarde: boolean;
  erreur: string | null;
  aDesModifications: boolean;
  absencesParJour: ReturnType<typeof transformerAbsencesParJour>;
  modeAbsence: string;
  charger: () => void;
  sauvegarder: () => Promise<void>;
  refetcherAbsences: () => void;
}

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

  const datesSemaine = useMemo(() => {
    const lundi = parseSemaineISO(semaineISO);
    const dimanche = endOfWeek(lundi, { weekStartsOn: 1 });

    return {
      dateDebut: format(lundi, 'yyyy-MM-dd'),
      dateFin: format(dimanche, 'yyyy-MM-dd'),
    };
  }, [semaineISO]);

  const [fetchSaisies, { loading: queryLoading, data, error: queryError }] = useLazyQuery<{
    mesSaisiesSemaine: SaisieAPI[];
  }>(MES_SAISIES_SEMAINE, {
    fetchPolicy: 'network-only',
  });

  const [fetchAbsences, { data: absencesData }] = useLazyQuery<{
    absences: AbsenceAPI[];
  }>(ABSENCES_SEMAINE, {
    fetchPolicy: 'network-only',
  });

  const { data: modeData } = useQuery<{ parametre: { id: string; valeur: string } | null }>(
    PARAMETRE_ABSENCE_MODE,
    { fetchPolicy: 'cache-first' }
  );
  const modeAbsence = (modeData?.parametre?.valeur as string) ?? 'manuel';

  const [syncAbsences] = useMutation(SYNC_ABSENCES);
  const [bulkCreate] = useMutation(BULK_CREATE_TIME_ENTRIES);
  const [bulkUpdate] = useMutation(BULK_UPDATE_TIME_ENTRIES);
  const [deleteEntry] = useMutation(DELETE_TIME_ENTRY);

  const variablesSaisies = useMemo(
    () => ({
      semaine: semaineISO,
      ...(userId ? { userId } : {}),
    }),
    [semaineISO, userId]
  );

  const variablesAbsences = useMemo(
    () => ({
      dateDebut: datesSemaine.dateDebut,
      dateFin: datesSemaine.dateFin,
      ...(userId ? { userId } : {}),
    }),
    [datesSemaine.dateDebut, datesSemaine.dateFin, userId]
  );

  const absencesParJour = useMemo(() => {
    return transformerAbsencesParJour(absencesData?.absences ?? [], semaineISO);
  }, [absencesData?.absences, semaineISO]);

  useEffect(() => {
    setChargement(queryLoading);
  }, [queryLoading, setChargement]);

  useEffect(() => {
    if (!data?.mesSaisiesSemaine) {
      return;
    }

    chargerSaisies(data.mesSaisiesSemaine);
    setErreur(null);
  }, [data, chargerSaisies, setErreur]);

  useEffect(() => {
    if (!queryError) {
      return;
    }

    setErreur(`Erreur de chargement : ${queryError.message}`);
  }, [queryError, setErreur]);

  useEffect(() => {
    fetchSaisies({ variables: variablesSaisies });

    if (modeAbsence === 'api') {
      syncAbsences({ variables: variablesAbsences })
        .catch((err: unknown) => {
          // Best effort: la synchronisation RH n'est pas bloquante pour l'affichage.
          console.error('[useSaisieHebdo] Erreur syncAbsences (non bloquante):', err);
        })
        .finally(() => {
          fetchAbsences({ variables: variablesAbsences });
        });

      return;
    }

    fetchAbsences({ variables: variablesAbsences });
  }, [
    modeAbsence,
    fetchAbsences,
    fetchSaisies,
    syncAbsences,
    variablesAbsences,
    variablesSaisies,
  ]);

  const refetcherAbsences = useCallback(() => {
    fetchAbsences({ variables: variablesAbsences });
  }, [fetchAbsences, variablesAbsences]);

  const charger = useCallback(() => {
    fetchSaisies({ variables: variablesSaisies });
    refetcherAbsences();
  }, [fetchSaisies, refetcherAbsences, variablesSaisies]);

  const sauvegarder = useCallback(async () => {
    const payload = construirePayloadSauvegarde(getModifications(), lignes, userId);

    if (
      payload.creations.length === 0 &&
      payload.misesAJour.length === 0 &&
      payload.suppressions.length === 0
    ) {
      return;
    }

    setSauvegarde(true);
    setErreur(null);

    try {
      const operations: Promise<unknown>[] = [];

      if (payload.creations.length > 0) {
        operations.push(bulkCreate({ variables: { inputs: payload.creations } }));
      }

      if (payload.misesAJour.length > 0) {
        operations.push(bulkUpdate({ variables: { entries: payload.misesAJour } }));
      }

      for (const suppression of payload.suppressions) {
        operations.push(deleteEntry({ variables: suppression }));
      }

      await Promise.all(operations);
      await fetchSaisies({ variables: variablesSaisies });
      reinitialiserModifications();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setErreur(`Erreur de sauvegarde : ${message}`);
      throw err;
    } finally {
      setSauvegarde(false);
    }
  }, [
    bulkCreate,
    bulkUpdate,
    deleteEntry,
    fetchSaisies,
    getModifications,
    lignes,
    reinitialiserModifications,
    setErreur,
    setSauvegarde,
    userId,
    variablesSaisies,
  ]);

  return {
    chargement,
    sauvegarde,
    erreur,
    aDesModifications: aDifficultes(),
    absencesParJour,
    modeAbsence,
    charger,
    sauvegarder,
    refetcherAbsences,
  };
}
