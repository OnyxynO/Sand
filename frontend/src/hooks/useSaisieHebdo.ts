// Hook pour la logique de chargement et sauvegarde des saisies hebdomadaires

import { useEffect, useCallback } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { useSaisieStore } from '../stores/saisieStore';
import {
  MES_SAISIES_SEMAINE,
  BULK_CREATE_TIME_ENTRIES,
  BULK_UPDATE_TIME_ENTRIES,
  DELETE_TIME_ENTRY,
} from '../graphql/operations/saisie';
import type { SaisieAPI, TimeEntryInput, BulkUpdateEntry } from '../types';

interface UseSaisieHebdoResult {
  // Etat
  chargement: boolean;
  sauvegarde: boolean;
  erreur: string | null;
  aDesModifications: boolean;

  // Actions
  charger: () => void;
  sauvegarder: () => Promise<void>;
}

export function useSaisieHebdo(): UseSaisieHebdoResult {
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

  // Query pour charger les saisies
  const [fetchSaisies, { loading: queryLoading, data, error: queryError }] = useLazyQuery<{
    mesSaisiesSemaine: SaisieAPI[];
  }>(MES_SAISIES_SEMAINE, {
    fetchPolicy: 'network-only', // Toujours recharger depuis le serveur
  });

  // Mutations pour la sauvegarde
  const [bulkCreate] = useMutation(BULK_CREATE_TIME_ENTRIES);
  const [bulkUpdate] = useMutation(BULK_UPDATE_TIME_ENTRIES);
  const [deleteEntry] = useMutation(DELETE_TIME_ENTRY);

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

  // Charger les saisies quand la semaine change
  useEffect(() => {
    fetchSaisies({ variables: { semaine: semaineISO } });
  }, [semaineISO, fetchSaisies]);

  // Fonction de chargement manuel
  const charger = useCallback(() => {
    fetchSaisies({ variables: { semaine: semaineISO } });
  }, [fetchSaisies, semaineISO]);

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
      await fetchSaisies({ variables: { semaine: semaineISO } });
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
    charger,
    sauvegarder,
  };
}
