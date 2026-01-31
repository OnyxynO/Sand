// Reexport des types utilitaires
export type { JourSemaine } from '../utils/semaineUtils';

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

// Types pour la saisie hebdomadaire

export interface SaisieAPI {
  id: string;
  date: string;
  duree: number;
  commentaire?: string;
  projet: {
    id: string;
    nom: string;
    code: string;
  };
  activite: {
    id: string;
    nom: string;
    chemin: string;
    cheminComplet: string;
  };
}

// Ligne de la grille : un couple projet+activite
export interface LigneSaisie {
  id: string; // Identifiant unique de la ligne (projet_activite)
  projetId: string;
  projetNom: string;
  projetCode: string;
  activiteId: string;
  activiteNom: string;
  activiteChemin: string;
  // Map des saisies par date (YYYY-MM-DD)
  saisies: Record<string, CelluleSaisieData>;
}

export interface CelluleSaisieData {
  id?: string; // ID de la saisie existante (undefined si nouvelle)
  duree: number | null;
  commentaire?: string;
  estModifiee: boolean; // True si modifiee localement
}

// Pour les mutations GraphQL
export interface TimeEntryInput {
  projetId: string;
  activiteId: string;
  date: string;
  duree: number;
  commentaire?: string;
}

export interface BulkUpdateEntry {
  id: string;
  duree: number;
  commentaire?: string;
}

// Types pour les projets et activites
export interface ProjetDisponible {
  id: string;
  nom: string;
  code: string;
  estActif: boolean;
}

export interface ActiviteDisponible {
  id: string;
  nom: string;
  chemin: string;
  cheminComplet: string;
  estFeuille: boolean;
  estActif: boolean;
}

// Types pour les notifications

export type NotificationType =
  | 'saisie_incomplete'
  | 'absence_importee'
  | 'conflit_absence'
  | 'export_pret'
  | 'systeme';

export type ConflictResolution = 'ECRASER' | 'IGNORER';

export interface Notification {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  donnees?: ConflitAbsenceDonnees | Record<string, unknown>;
  estLu: boolean;
  luLe?: string;
  createdAt: string;
}

export interface ConflitAbsenceDonnees {
  absence_id: number;
  saisie_ids: number[];
}

export interface AbsenceDetails {
  id: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  dureeJournaliere: number;
}
