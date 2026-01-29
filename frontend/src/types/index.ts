// Types metier

// Roles en majuscules comme retournes par l'API GraphQL
export type UserRole = 'UTILISATEUR' | 'MODERATEUR' | 'ADMIN';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  equipe?: Equipe;
}

export interface Equipe {
  id: string;
  nom: string;
  code: string;
}

export interface Projet {
  id: string;
  nom: string;
  code: string;
  description?: string;
  estActif: boolean;
}

export interface Activite {
  id: string;
  nom: string;
  code?: string;
  chemin: string;
  niveau: number;
  estFeuille: boolean;
  estSysteme: boolean;
  estActif: boolean;
  enfants?: Activite[];
}

export interface Saisie {
  id: string;
  date: string;
  duree: number;
  commentaire?: string;
  projet: Projet;
  activite: Activite;
}

// Types d'authentification

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  user: Utilisateur;
  token: string;
}
