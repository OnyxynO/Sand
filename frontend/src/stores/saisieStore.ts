// Store Zustand pour la gestion de l'etat de la grille de saisie

import { create } from 'zustand';
import type { LigneSaisie, CelluleSaisieData, SaisieAPI } from '../types';
import { getSemaineActuelle, getJoursSemaine, type JourSemaine } from '../utils/semaineUtils';

interface SaisieState {
  // Semaine affichee
  semaineISO: string;
  jours: JourSemaine[];

  // Donnees de la grille
  lignes: LigneSaisie[];

  // Etat de chargement et sauvegarde
  chargement: boolean;
  sauvegarde: boolean;
  erreur: string | null;

  // Actions navigation
  setSemaine: (semaineISO: string) => void;
  allerSemainePrecedente: () => void;
  allerSemaineSuivante: () => void;
  allerSemaineActuelle: () => void;

  // Actions donnees
  chargerSaisies: (saisiesAPI: SaisieAPI[]) => void;
  ajouterLigne: (
    projetId: string,
    projetNom: string,
    projetCode: string,
    activiteId: string,
    activiteNom: string,
    activiteChemin: string
  ) => void;
  supprimerLigne: (ligneId: string) => void;
  modifierCellule: (ligneId: string, dateStr: string, duree: number | null, commentaire?: string) => void;
  reinitialiserModifications: () => void;

  // Etat loading/error
  setChargement: (chargement: boolean) => void;
  setSauvegarde: (sauvegarde: boolean) => void;
  setErreur: (erreur: string | null) => void;

  // Getters calcules
  aDifficultes: () => boolean;
  getTotalJour: (dateStr: string) => number;
  getTotalLigne: (ligneId: string) => number;
  getModifications: () => {
    nouvelles: { ligneId: string; dateStr: string; data: CelluleSaisieData }[];
    modifiees: { ligneId: string; dateStr: string; data: CelluleSaisieData }[];
    supprimees: { id: string }[];
  };
}

// Cree un ID unique pour une ligne (couple projet+activite)
function creerLigneId(projetId: string, activiteId: string): string {
  return `${projetId}_${activiteId}`;
}

// Initialise les cellules vides pour une ligne
function initialiserCellules(jours: JourSemaine[]): Record<string, CelluleSaisieData> {
  const cellules: Record<string, CelluleSaisieData> = {};
  for (const jour of jours) {
    cellules[jour.dateStr] = {
      duree: null,
      estModifiee: false,
    };
  }
  return cellules;
}

export const useSaisieStore = create<SaisieState>((set, get) => ({
  // Etat initial
  semaineISO: getSemaineActuelle(),
  jours: getJoursSemaine(getSemaineActuelle()),
  lignes: [],
  chargement: false,
  sauvegarde: false,
  erreur: null,

  // Navigation
  setSemaine: (semaineISO) => {
    set({
      semaineISO,
      jours: getJoursSemaine(semaineISO),
      lignes: [], // Reset les lignes, elles seront rechargees
      erreur: null,
    });
  },

  allerSemainePrecedente: () => {
    const { semaineISO } = get();
    const match = semaineISO.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return;

    const annee = parseInt(match[1], 10);
    let semaine = parseInt(match[2], 10);

    semaine -= 1;
    let nouvelleAnnee = annee;

    if (semaine < 1) {
      // Aller a la derniere semaine de l'annee precedente
      nouvelleAnnee = annee - 1;
      // Determiner le nombre de semaines de l'annee precedente (52 ou 53)
      const dernierDecembre = new Date(nouvelleAnnee, 11, 31);
      const jourSemaine = dernierDecembre.getDay();
      // Annee avec 53 semaines si le 31 dec est un jeudi, ou si c'est bissextile et le 31 dec est mercredi/jeudi
      semaine = jourSemaine === 4 || (jourSemaine === 3 && new Date(nouvelleAnnee, 1, 29).getDate() === 29) ? 53 : 52;
    }

    const nouvelleSemaine = `${nouvelleAnnee}-W${semaine.toString().padStart(2, '0')}`;
    get().setSemaine(nouvelleSemaine);
  },

  allerSemaineSuivante: () => {
    const { semaineISO } = get();
    const match = semaineISO.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return;

    let annee = parseInt(match[1], 10);
    let semaine = parseInt(match[2], 10);

    // Determiner le nombre de semaines de l'annee courante
    const dernierDecembre = new Date(annee, 11, 31);
    const jourSemaine = dernierDecembre.getDay();
    const maxSemaines = jourSemaine === 4 || (jourSemaine === 3 && new Date(annee, 1, 29).getDate() === 29) ? 53 : 52;

    semaine += 1;
    if (semaine > maxSemaines) {
      semaine = 1;
      annee += 1;
    }

    const nouvelleSemaine = `${annee}-W${semaine.toString().padStart(2, '0')}`;
    get().setSemaine(nouvelleSemaine);
  },

  allerSemaineActuelle: () => {
    get().setSemaine(getSemaineActuelle());
  },

  // Charger les saisies depuis l'API
  chargerSaisies: (saisiesAPI) => {
    const { jours } = get();

    // Grouper par projet+activite
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

      const ligne = lignesMap.get(ligneId)!;
      ligne.saisies[saisie.date] = {
        id: saisie.id,
        duree: saisie.duree,
        commentaire: saisie.commentaire,
        estModifiee: false,
      };
    }

    set({ lignes: Array.from(lignesMap.values()) });
  },

  // Ajouter une nouvelle ligne
  ajouterLigne: (projetId, projetNom, projetCode, activiteId, activiteNom, activiteChemin) => {
    const { lignes, jours } = get();
    const ligneId = creerLigneId(projetId, activiteId);

    // Verifier si la ligne existe deja
    if (lignes.some((l) => l.id === ligneId)) {
      return; // Ligne deja presente
    }

    const nouvelleLigne: LigneSaisie = {
      id: ligneId,
      projetId,
      projetNom,
      projetCode,
      activiteId,
      activiteNom,
      activiteChemin,
      saisies: initialiserCellules(jours),
    };

    set({ lignes: [...lignes, nouvelleLigne] });
  },

  // Supprimer une ligne
  supprimerLigne: (ligneId) => {
    const { lignes } = get();
    set({ lignes: lignes.filter((l) => l.id !== ligneId) });
  },

  // Modifier une cellule
  modifierCellule: (ligneId, dateStr, duree, commentaire) => {
    const { lignes } = get();

    set({
      lignes: lignes.map((ligne) => {
        if (ligne.id !== ligneId) return ligne;

        const celluleActuelle = ligne.saisies[dateStr];
        const nouvelleCellule: CelluleSaisieData = {
          ...celluleActuelle,
          duree,
          commentaire: commentaire !== undefined ? commentaire : celluleActuelle?.commentaire,
          estModifiee: true,
        };

        return {
          ...ligne,
          saisies: {
            ...ligne.saisies,
            [dateStr]: nouvelleCellule,
          },
        };
      }),
    });
  },

  // Reinitialiser les flags de modification apres sauvegarde
  reinitialiserModifications: () => {
    const { lignes } = get();

    set({
      lignes: lignes.map((ligne) => ({
        ...ligne,
        saisies: Object.fromEntries(
          Object.entries(ligne.saisies).map(([date, cellule]) => [
            date,
            { ...cellule, estModifiee: false },
          ])
        ),
      })),
    });
  },

  // Etat
  setChargement: (chargement) => set({ chargement }),
  setSauvegarde: (sauvegarde) => set({ sauvegarde }),
  setErreur: (erreur) => set({ erreur }),

  // Getters
  aDifficultes: () => {
    const { lignes } = get();
    return lignes.some((ligne) =>
      Object.values(ligne.saisies).some((cellule) => cellule.estModifiee)
    );
  },

  getTotalJour: (dateStr) => {
    const { lignes } = get();
    return lignes.reduce((total, ligne) => {
      const cellule = ligne.saisies[dateStr];
      return total + (cellule?.duree || 0);
    }, 0);
  },

  getTotalLigne: (ligneId) => {
    const { lignes } = get();
    const ligne = lignes.find((l) => l.id === ligneId);
    if (!ligne) return 0;

    return Object.values(ligne.saisies).reduce(
      (total, cellule) => total + (cellule?.duree || 0),
      0
    );
  },

  getModifications: () => {
    const { lignes, jours } = get();
    const nouvelles: { ligneId: string; dateStr: string; data: CelluleSaisieData }[] = [];
    const modifiees: { ligneId: string; dateStr: string; data: CelluleSaisieData }[] = [];
    const supprimees: { id: string }[] = [];

    for (const ligne of lignes) {
      for (const jour of jours) {
        const cellule = ligne.saisies[jour.dateStr];
        if (!cellule || !cellule.estModifiee) continue;

        if (cellule.id) {
          // Saisie existante
          if (cellule.duree === null || cellule.duree === 0) {
            // Suppression
            supprimees.push({ id: cellule.id });
          } else {
            // Modification
            modifiees.push({ ligneId: ligne.id, dateStr: jour.dateStr, data: cellule });
          }
        } else if (cellule.duree !== null && cellule.duree > 0) {
          // Nouvelle saisie
          nouvelles.push({ ligneId: ligne.id, dateStr: jour.dateStr, data: cellule });
        }
      }
    }

    return { nouvelles, modifiees, supprimees };
  },
}));
