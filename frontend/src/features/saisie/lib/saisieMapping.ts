import type {
  BulkUpdateEntry,
  CelluleSaisieData,
  LigneSaisie,
  SaisieAPI,
  TimeEntryInput,
} from '../../../types';
import type { JourSemaine } from '../../../utils/semaineUtils';

export interface ModificationsSaisie {
  nouvelles: { ligneId: string; dateStr: string; data: CelluleSaisieData }[];
  modifiees: { ligneId: string; dateStr: string; data: CelluleSaisieData }[];
  supprimees: { id: string }[];
}

export function creerLigneId(projetId: string, activiteId: string): string {
  return `${projetId}_${activiteId}`;
}

export function initialiserCellules(jours: JourSemaine[]): Record<string, CelluleSaisieData> {
  const cellules: Record<string, CelluleSaisieData> = {};

  for (const jour of jours) {
    cellules[jour.dateStr] = {
      duree: null,
      estModifiee: false,
    };
  }

  return cellules;
}

export function construireLignesDepuisApi(
  saisiesAPI: SaisieAPI[],
  jours: JourSemaine[]
): LigneSaisie[] {
  const lignesMap = new Map<string, LigneSaisie>();

  for (const saisie of saisiesAPI) {
    const ligneId = creerLigneId(saisie.projet.id, saisie.activite.id);

    if (!lignesMap.has(ligneId)) {
      lignesMap.set(ligneId, {
        id: ligneId,
        projetId: saisie.projet.id,
        projetNom: saisie.projet.nom,
        projetCode: saisie.projet.code,
        activiteId: saisie.activite.id,
        activiteNom: saisie.activite.nom,
        activiteChemin: saisie.activite.cheminComplet || saisie.activite.chemin,
        saisies: initialiserCellules(jours),
      });
    }

    const ligne = lignesMap.get(ligneId);
    if (!ligne) {
      continue;
    }

    ligne.saisies[saisie.date] = {
      id: saisie.id,
      duree: saisie.duree,
      commentaire: saisie.commentaire,
      estModifiee: false,
    };
  }

  return Array.from(lignesMap.values());
}

export function construirePayloadSauvegarde(
  modifications: ModificationsSaisie,
  lignes: LigneSaisie[],
  userId?: string | null
): {
  creations: TimeEntryInput[];
  misesAJour: BulkUpdateEntry[];
  suppressions: { id: string }[];
} {
  const creations = modifications.nouvelles.map(({ ligneId, dateStr, data }) => {
    const ligne = lignes.find((entry) => entry.id === ligneId);

    if (!ligne) {
      throw new Error(`Ligne introuvable: ${ligneId}`);
    }

    return {
      projetId: ligne.projetId,
      activiteId: ligne.activiteId,
      date: dateStr,
      duree: data.duree!,
      commentaire: data.commentaire,
      ...(userId ? { userId } : {}),
    };
  });

  const misesAJour = modifications.modifiees.map(({ data }) => ({
    id: data.id!,
    duree: data.duree!,
    commentaire: data.commentaire,
  }));

  return {
    creations,
    misesAJour,
    suppressions: modifications.supprimees,
  };
}
