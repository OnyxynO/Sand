export interface Utilisateur {
  id: string;
  nomComplet: string;
  email: string;
  role: string;
}

export interface Projet {
  id: string;
  nom: string;
  code: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  estActif: boolean;
  moderateurs?: { id: string; nomComplet: string }[];
  activitesActives?: { id: string; nom: string; chemin: string }[];
}

export interface Activite {
  id: string;
  nom: string;
  chemin: string;
  niveau: number;
  estFeuille: boolean;
  estActif: boolean;
  enfants?: Activite[];
}

export interface RestrictionVisibilite {
  id: string;
  estVisible: boolean;
  activite: {
    id: string;
    nom: string;
    chemin: string;
  };
  utilisateur: {
    id: string;
    nomComplet: string;
    email: string;
  };
}
