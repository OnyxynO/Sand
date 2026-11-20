/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Type d'anomalie detectee */
export type AnomalyType =
  /** Conflit entre absence et saisie sur la meme date */
  | 'CONFLIT_ABSENCE'
  /** Jour avec total ETP superieur a 1.0 */
  | 'JOUR_DEPASSE'
  /** Jour avec total ETP inferieur a 1.0 */
  | 'JOUR_INCOMPLET'
  /** Jour ouvre sans aucune saisie */
  | 'JOUR_MANQUANT'
  /** Saisie existante sur un jour d'absence */
  | 'SAISIE_SUR_ABSENCE'
  /** Semaine sans aucune saisie */
  | 'SEMAINE_VIDE';

/** Mise a jour en lot */
export type BulkUpdateEntry = {
  /** Nouveau commentaire (1000 caracteres max) */
  commentaire?: string | null | undefined;
  /** Nouvelle duree en ETP (0.01 a 1.00) */
  duree: number;
  /** Identifiant de la saisie a modifier */
  id: string | number;
};

/** Resolution d'un conflit d'absence */
export type ConflictResolution =
  /** Ajuster la duree de l'absence */
  | 'AJUSTER'
  /** Ecraser les saisies existantes par l'absence */
  | 'ECRASER'
  /** Ignorer l'absence et conserver les saisies */
  | 'IGNORER';

/** Creation d'une activite */
export type CreateActivityInput = {
  /** Code court (optionnel) */
  code?: string | null | undefined;
  /** Description de l'activite */
  description?: string | null | undefined;
  /** Activer ou desactiver l'activite */
  estActif?: boolean | null | undefined;
  /** Nom de l'activite */
  nom: string;
  /** Ordre d'affichage */
  ordre?: number | null | undefined;
  /** ID de l'activite parente (null = racine) */
  parentId?: string | number | null | undefined;
};

/** Creation d'un projet */
export type CreateProjectInput = {
  /** IDs des activites a activer */
  activiteIds?: Array<string | number> | null | undefined;
  /** Code court unique */
  code: string;
  /** Date de debut du projet */
  dateDebut?: unknown;
  /** Date de fin du projet */
  dateFin?: unknown;
  /** Description du projet */
  description?: string | null | undefined;
  /** Activer ou desactiver le projet */
  estActif?: boolean | null | undefined;
  /** IDs des moderateurs a assigner */
  moderateurIds?: Array<string | number> | null | undefined;
  /** Nom du projet */
  nom: string;
};

/** Creation d'un utilisateur */
export type CreateUserInput = {
  /** Adresse email (unique parmi les comptes non supprimes) */
  email: string;
  /** Identifiant de l'equipe */
  equipeId?: string | number | null | undefined;
  /** Matricule interne (unique, optionnel) */
  matricule?: string | null | undefined;
  /** Nom de famille */
  nom: string;
  /** Mot de passe (8 caracteres minimum) */
  password: string;
  /** Prenom */
  prenom: string;
  /** Role dans le systeme */
  role: UserRole;
};

/** Demande de reinitialisation de mot de passe */
export type DemanderReinitialisationMdpInput = {
  /** Adresse email du compte (max 80 caracteres) */
  email: string;
};

/** Format d'export */
export type ExportFormat =
  /** Export au format CSV */
  | 'CSV';

/** Parametres d'export */
export type ExportInput = {
  /** Date de debut de la periode */
  dateDebut: unknown;
  /** Date de fin de la periode */
  dateFin: unknown;
  /** Filtrer par equipe */
  equipeId?: string | number | null | undefined;
  /** Format de l'export */
  format: ExportFormat;
  /** Filtrer par projet */
  projetId?: string | number | null | undefined;
  /** Filtrer par utilisateur */
  userId?: string | number | null | undefined;
};

/** Statut d'un job d'export */
export type ExportStatus =
  /** Export desactive manuellement (fichier supprime) */
  | 'DESACTIVE'
  /** Export echoue */
  | 'ECHEC'
  /** Export en attente de traitement */
  | 'EN_ATTENTE'
  /** Export en cours de generation */
  | 'EN_COURS'
  /** Export termine et disponible */
  | 'TERMINE';

/** Type d'action dans l'historique */
export type LogAction =
  /** Creation d'un enregistrement */
  | 'CREATION'
  /** Modification d'un enregistrement */
  | 'MODIFICATION'
  /** Suppression d'un enregistrement */
  | 'SUPPRESSION';

/** Donnees de connexion */
export type LoginInput = {
  /** Adresse email de l'utilisateur (max 80 caracteres) */
  email: string;
  /** Mot de passe (6 caracteres minimum, 80 maximum) */
  password: string;
};

/** Reinitialisation du mot de passe avec token */
export type ReinitialisationMdpInput = {
  /** Adresse email du compte (max 80 caracteres) */
  email: string;
  /** Nouveau mot de passe (8 caracteres minimum, 80 maximum) */
  password: string;
  /** Confirmation du nouveau mot de passe (max 80 caracteres) */
  password_confirmation: string;
  /** Token recu par email */
  token: string;
};

/** Parametre systeme */
export type SettingInput = {
  /** Cle du parametre */
  cle: string;
  /** Nouvelle valeur (JSON) */
  valeur: unknown;
};

/** Donnees d'une equipe */
export type TeamInput = {
  /** Code court unique */
  code: string;
  /** Description de l'equipe */
  description?: string | null | undefined;
  /** Activer ou desactiver l'equipe */
  estActif?: boolean | null | undefined;
  /** Nom de l'equipe */
  nom: string;
};

/** Donnees d'une saisie de temps */
export type TimeEntryInput = {
  /** Identifiant de l'activite */
  activiteId: string | number;
  /** Commentaire optionnel (1000 caracteres max) */
  commentaire?: string | null | undefined;
  /** Date de la saisie */
  date: unknown;
  /** Duree en ETP (0.01 a 1.00) */
  duree: number;
  /** Identifiant du projet */
  projetId: string | number;
  /** Utilisateur cible (moderateurs/admins uniquement) */
  userId?: string | number | null | undefined;
};

/** Modification d'une activite */
export type UpdateActivityInput = {
  /** Code court */
  code?: string | null | undefined;
  /** Description de l'activite */
  description?: string | null | undefined;
  /** Activer ou desactiver l'activite */
  estActif?: boolean | null | undefined;
  /** Nom de l'activite */
  nom?: string | null | undefined;
  /** Ordre d'affichage */
  ordre?: number | null | undefined;
  /** ID de l'activite parente (null = racine) */
  parentId?: string | number | null | undefined;
};

/** Modification d'un projet */
export type UpdateProjectInput = {
  /** Code court */
  code?: string | null | undefined;
  /** Date de debut du projet */
  dateDebut?: unknown;
  /** Date de fin du projet */
  dateFin?: unknown;
  /** Description du projet */
  description?: string | null | undefined;
  /** Activer ou desactiver le projet */
  estActif?: boolean | null | undefined;
  /** Nom du projet */
  nom?: string | null | undefined;
};

/** Modification d'un utilisateur */
export type UpdateUserInput = {
  /** Adresse email */
  email?: string | null | undefined;
  /** Identifiant de l'equipe */
  equipeId?: string | number | null | undefined;
  /** Activer ou desactiver le compte */
  estActif?: boolean | null | undefined;
  /** Matricule interne */
  matricule?: string | null | undefined;
  /** Nom de famille */
  nom?: string | null | undefined;
  /** Nouveau mot de passe (8 caracteres minimum) */
  password?: string | null | undefined;
  /** Prenom */
  prenom?: string | null | undefined;
  /** Role dans le systeme */
  role?: UserRole | null | undefined;
};

/** Role d'un utilisateur dans le systeme */
export type UserRole =
  /** Administrateur (configuration globale du systeme) */
  | 'ADMIN'
  /** Moderateur (gestion des equipes et projets assignes) */
  | 'MODERATEUR'
  /** Utilisateur standard (saisie personnelle uniquement) */
  | 'UTILISATEUR';

export type ActivityFieldsFragment = { id: string, nom: string, code: string | null, description: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean };

export type ActivityTreeFieldsFragment = { id: string, nom: string, code: string | null, description: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ id: string, nom: string, code: string | null, description: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ id: string, nom: string, code: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ id: string, nom: string, code: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean }> }> }> };

export type ArbreActivitesQueryVariables = Exact<{ [key: string]: never; }>;


export type ArbreActivitesQuery = { arbreActivites: Array<{ id: string, nom: string, code: string | null, description: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ id: string, nom: string, code: string | null, description: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ id: string, nom: string, code: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ id: string, nom: string, code: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean }> }> }> }> };

export type CreateActivityMutationVariables = Exact<{
  input: CreateActivityInput;
}>;


export type CreateActivityMutation = { createActivity: { id: string, nom: string, code: string | null, description: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean } };

export type UpdateActivityMutationVariables = Exact<{
  id: string | number;
  input: UpdateActivityInput;
}>;


export type UpdateActivityMutation = { updateActivity: { id: string, nom: string, code: string | null, description: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean } };

export type DeleteActivityMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteActivityMutation = { deleteActivity: boolean };

export type MoveActivityMutationVariables = Exact<{
  id: string | number;
  parentId?: string | number | null | undefined;
  ordre: number;
}>;


export type MoveActivityMutation = { moveActivity: { id: string, nom: string, code: string | null, description: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { user: { id: string, nom: string, prenom: string, email: string, role: UserRole, equipe: { id: string, nom: string, code: string } | null } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type DemanderReinitialisationMdpMutationVariables = Exact<{
  input: DemanderReinitialisationMdpInput;
}>;


export type DemanderReinitialisationMdpMutation = { demanderReinitialisationMdp: boolean };

export type ReinitialiserMdpMutationVariables = Exact<{
  input: ReinitialisationMdpInput;
}>;


export type ReinitialiserMdpMutation = { reinitialiserMdp: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, nom: string, prenom: string, email: string, role: UserRole, equipe: { id: string, nom: string, code: string } | null } | null };

export type RequestExportMutationVariables = Exact<{
  input: ExportInput;
}>;


export type RequestExportMutation = { requestExport: { id: string, statut: ExportStatus, filtres: unknown, expireLe: unknown, creeLe: unknown } };

export type MesExportsQueryVariables = Exact<{ [key: string]: never; }>;


export type MesExportsQuery = { mesExports: Array<{ id: string, statut: ExportStatus, filtres: unknown, expireLe: unknown, creeLe: unknown }> };

export type DesactiverExportMutationVariables = Exact<{
  id: string | number;
}>;


export type DesactiverExportMutation = { desactiverExport: { id: string, statut: ExportStatus, filtres: unknown, expireLe: unknown, creeLe: unknown } };

export type SupprimerExportMutationVariables = Exact<{
  id: string | number;
}>;


export type SupprimerExportMutation = { supprimerExport: boolean };

export type NotificationFieldsFragment = { id: string, type: string, titre: string, message: string, donnees: unknown, estLu: boolean, luLe: unknown, createdAt: unknown };

export type MesNotificationsQueryVariables = Exact<{
  nonLuSeulement?: boolean | null | undefined;
  limite?: number | null | undefined;
}>;


export type MesNotificationsQuery = { mesNotifications: Array<{ id: string, type: string, titre: string, message: string, donnees: unknown, estLu: boolean, luLe: unknown, createdAt: unknown }> };

export type NombreNotificationsNonLuesQueryVariables = Exact<{ [key: string]: never; }>;


export type NombreNotificationsNonLuesQuery = { nombreNotificationsNonLues: number };

export type MarkNotificationReadMutationVariables = Exact<{
  id: string | number;
}>;


export type MarkNotificationReadMutation = { markNotificationRead: { id: string, type: string, titre: string, message: string, donnees: unknown, estLu: boolean, luLe: unknown, createdAt: unknown } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: boolean };

export type DeleteNotificationMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteNotificationMutation = { deleteNotification: boolean };

export type DeleteAllNotificationsMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAllNotificationsMutation = { deleteAllNotifications: boolean };

export type ResolveAbsenceConflictMutationVariables = Exact<{
  absenceId: string | number;
  resolution: ConflictResolution;
}>;


export type ResolveAbsenceConflictMutation = { resolveAbsenceConflict: boolean };

export type ProjectFieldsFragment = { id: string, nom: string, code: string, description: string | null, dateDebut: unknown, dateFin: unknown, estActif: boolean, createdAt: unknown };

export type ProjectFullFieldsFragment = { id: string, nom: string, code: string, description: string | null, dateDebut: unknown, dateFin: unknown, estActif: boolean, createdAt: unknown, moderateurs: Array<{ id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ id: string, nomComplet: string, email: string }>, activitesActives: Array<{ id: string, nom: string, chemin: string }> };

export type ProjetsQueryVariables = Exact<{
  actif?: boolean | null | undefined;
  moderateurId?: string | number | null | undefined;
}>;


export type ProjetsQuery = { projets: Array<{ id: string, nom: string, code: string, description: string | null, dateDebut: unknown, dateFin: unknown, estActif: boolean, createdAt: unknown, moderateurs: Array<{ id: string, nomComplet: string }> }> };

export type ProjetQueryVariables = Exact<{
  id: string | number;
}>;


export type ProjetQuery = { projet: { id: string, nom: string, code: string, description: string | null, dateDebut: unknown, dateFin: unknown, estActif: boolean, createdAt: unknown, moderateurs: Array<{ id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ id: string, nomComplet: string, email: string }>, activitesActives: Array<{ id: string, nom: string, chemin: string }> } | null };

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { createProject: { id: string, nom: string, code: string, description: string | null, dateDebut: unknown, dateFin: unknown, estActif: boolean, createdAt: unknown, moderateurs: Array<{ id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ id: string, nomComplet: string, email: string }>, activitesActives: Array<{ id: string, nom: string, chemin: string }> } };

export type UpdateProjectMutationVariables = Exact<{
  id: string | number;
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { updateProject: { id: string, nom: string, code: string, description: string | null, dateDebut: unknown, dateFin: unknown, estActif: boolean, createdAt: unknown, moderateurs: Array<{ id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ id: string, nomComplet: string, email: string }>, activitesActives: Array<{ id: string, nom: string, chemin: string }> } };

export type DeleteProjectMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteProjectMutation = { deleteProject: boolean };

export type SetProjectActivitiesMutationVariables = Exact<{
  projetId: string | number;
  activiteIds: Array<string | number> | string | number;
}>;


export type SetProjectActivitiesMutation = { setProjectActivities: { id: string, nom: string, code: string, description: string | null, dateDebut: unknown, dateFin: unknown, estActif: boolean, createdAt: unknown, moderateurs: Array<{ id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ id: string, nomComplet: string, email: string }>, activitesActives: Array<{ id: string, nom: string, chemin: string }> } };

export type AddProjectModeratorMutationVariables = Exact<{
  projetId: string | number;
  userId: string | number;
}>;


export type AddProjectModeratorMutation = { addProjectModerator: { id: string, moderateurs: Array<{ id: string, nomComplet: string }> } };

export type RemoveProjectModeratorMutationVariables = Exact<{
  projetId: string | number;
  userId: string | number;
}>;


export type RemoveProjectModeratorMutation = { removeProjectModerator: { id: string, moderateurs: Array<{ id: string, nomComplet: string }> } };

export type SupprimerDonneesUtilisateurMutationVariables = Exact<{
  userId: string | number;
  confirmationNom: string;
}>;


export type SupprimerDonneesUtilisateurMutation = { supprimerDonneesUtilisateur: { saisiesSupprimees: number, absencesSupprimees: number, notificationsSupprimees: number, exportsSupprimees: number, logsAnonymises: number } };

export type PurgerToutesDonneesMutationVariables = Exact<{
  confirmationPhrase: string;
}>;


export type PurgerToutesDonneesMutation = { purgerToutesDonnees: { saisiesSupprimees: number, logsSupprimees: number, absencesSupprimees: number, notificationsSupprimees: number, exportsSupprimees: number } };

export type SaisieFieldsFragment = { id: string, date: unknown, duree: number, commentaire: string | null, projet: { id: string, nom: string, code: string }, activite: { id: string, nom: string, chemin: string, cheminComplet: string } };

export type ProjetFieldsFragment = { id: string, nom: string, code: string, estActif: boolean };

export type ActiviteFieldsFragment = { id: string, nom: string, chemin: string, cheminComplet: string, estFeuille: boolean, estActif: boolean };

export type MesSaisiesSemaineQueryVariables = Exact<{
  semaine: string;
  userId?: string | number | null | undefined;
}>;


export type MesSaisiesSemaineQuery = { mesSaisiesSemaine: Array<{ id: string, date: unknown, duree: number, commentaire: string | null, projet: { id: string, nom: string, code: string }, activite: { id: string, nom: string, chemin: string, cheminComplet: string } }> };

export type UtilisateursModerablesQueryVariables = Exact<{ [key: string]: never; }>;


export type UtilisateursModerablesQuery = { utilisateursModerables: Array<{ id: string, nom: string, prenom: string, nomComplet: string }> };

export type ProjetsActifsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProjetsActifsQuery = { projets: Array<{ id: string, nom: string, code: string, estActif: boolean }> };

export type ActivitesDisponiblesQueryVariables = Exact<{
  projetId: string | number;
}>;


export type ActivitesDisponiblesQuery = { activitesDisponibles: Array<{ id: string, nom: string, chemin: string, cheminComplet: string, estFeuille: boolean, estActif: boolean }> };

export type AbsencesSemaineQueryVariables = Exact<{
  dateDebut: unknown;
  dateFin: unknown;
  userId?: string | number | null | undefined;
}>;


export type AbsencesSemaineQuery = { absences: Array<{ id: string, type: string, typeLibelle: string, dateDebut: unknown, dateFin: unknown, dureeJournaliere: number }> };

export type SyncAbsencesMutationVariables = Exact<{
  dateDebut: unknown;
  dateFin: unknown;
  userId?: string | number | null | undefined;
}>;


export type SyncAbsencesMutation = { syncAbsences: { importes: number, conflits: number, erreurs: Array<string> } };

export type HistoriqueSaisieQueryVariables = Exact<{
  semaineISO: string;
  userId?: string | number | null | undefined;
}>;


export type HistoriqueSaisieQuery = { mesSaisiesSemaine: Array<{ id: string, date: unknown, duree: number, projet: { id: string, code: string }, activite: { id: string, nom: string }, historique: Array<{ id: string, action: LogAction, ancienneDuree: number | null, nouvelleDuree: number | null, ancienCommentaire: string | null, nouveauCommentaire: string | null, createdAt: unknown, auteur: { nomComplet: string } }> }> };

export type CreateTimeEntryMutationVariables = Exact<{
  input: TimeEntryInput;
}>;


export type CreateTimeEntryMutation = { createTimeEntry: { id: string, date: unknown, duree: number, commentaire: string | null, projet: { id: string, nom: string, code: string }, activite: { id: string, nom: string, chemin: string, cheminComplet: string } } };

export type UpdateTimeEntryMutationVariables = Exact<{
  id: string | number;
  input: TimeEntryInput;
}>;


export type UpdateTimeEntryMutation = { updateTimeEntry: { id: string, date: unknown, duree: number, commentaire: string | null, projet: { id: string, nom: string, code: string }, activite: { id: string, nom: string, chemin: string, cheminComplet: string } } };

export type DeleteTimeEntryMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteTimeEntryMutation = { deleteTimeEntry: boolean };

export type BulkCreateTimeEntriesMutationVariables = Exact<{
  inputs: Array<TimeEntryInput> | TimeEntryInput;
}>;


export type BulkCreateTimeEntriesMutation = { bulkCreateTimeEntries: Array<{ id: string, date: unknown, duree: number, commentaire: string | null, projet: { id: string, nom: string, code: string }, activite: { id: string, nom: string, chemin: string, cheminComplet: string } }> };

export type BulkUpdateTimeEntriesMutationVariables = Exact<{
  entries: Array<BulkUpdateEntry> | BulkUpdateEntry;
}>;


export type BulkUpdateTimeEntriesMutation = { bulkUpdateTimeEntries: Array<{ id: string, date: unknown, duree: number, commentaire: string | null, projet: { id: string, nom: string, code: string }, activite: { id: string, nom: string, chemin: string, cheminComplet: string } }> };

export type DeclarerAbsenceMutationVariables = Exact<{
  date: unknown;
  duree?: number | null | undefined;
  type?: string | null | undefined;
  userId?: string | number | null | undefined;
}>;


export type DeclarerAbsenceMutation = { declarerAbsence: boolean };

export type ParametresQueryVariables = Exact<{ [key: string]: never; }>;


export type ParametresQuery = { parametres: Array<{ id: string, cle: string, valeur: unknown, description: string | null }> };

export type UpdateSettingsMutationVariables = Exact<{
  settings: Array<SettingInput> | SettingInput;
}>;


export type UpdateSettingsMutation = { updateSettings: Array<{ id: string, cle: string, valeur: unknown, description: string | null }> };

export type ResetSettingsMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetSettingsMutation = { resetSettings: Array<{ id: string, cle: string, valeur: unknown, description: string | null }> };

export type ParametreAbsenceModeQueryVariables = Exact<{ [key: string]: never; }>;


export type ParametreAbsenceModeQuery = { parametre: { id: string, valeur: unknown } | null };

export type TesterConnexionRhApiMutationVariables = Exact<{ [key: string]: never; }>;


export type TesterConnexionRhApiMutation = { testerConnexionRhApi: string | null };

export type MesStatistiquesQueryVariables = Exact<{
  dateDebut: unknown;
  dateFin: unknown;
}>;


export type MesStatistiquesQuery = { statistiques: { tempsTotal: number, parProjet: Array<{ tempsTotal: number, pourcentage: number, projet: { id: string, nom: string, code: string } }>, parActivite: Array<{ tempsTotal: number, pourcentage: number, activite: { id: string, nom: string } }>, parJour: Array<{ date: unknown, tempsTotal: number, estComplet: boolean }> } };

export type StatsGlobalesQueryVariables = Exact<{
  dateDebut: unknown;
  dateFin: unknown;
  equipeId?: string | number | null | undefined;
}>;


export type StatsGlobalesQuery = { statistiques: { tempsTotal: number, parProjet: Array<{ tempsTotal: number, pourcentage: number, projet: { id: string, nom: string, code: string } }>, parActivite: Array<{ tempsTotal: number, pourcentage: number, activite: { id: string, nom: string } }>, parUtilisateur: Array<{ tempsTotal: number, tauxCompletion: number, utilisateur: { id: string, nomComplet: string } }>, parJour: Array<{ date: unknown, tempsTotal: number, estComplet: boolean }> } };

export type StatsPeriodePrecedenteQueryVariables = Exact<{
  dateDebut: unknown;
  dateFin: unknown;
  equipeId?: string | number | null | undefined;
}>;


export type StatsPeriodePrecedenteQuery = { statistiques: { tempsTotal: number, parUtilisateur: Array<{ tempsTotal: number, tauxCompletion: number, utilisateur: { id: string, nomComplet: string } }> } };

export type StatsProjetQueryVariables = Exact<{
  dateDebut: unknown;
  dateFin: unknown;
  projetId: string | number;
}>;


export type StatsProjetQuery = { statistiques: { tempsTotal: number, parActivite: Array<{ tempsTotal: number, pourcentage: number, activite: { id: string, nom: string } }>, parUtilisateur: Array<{ tempsTotal: number, tauxCompletion: number, utilisateur: { id: string, nomComplet: string } }>, parJour: Array<{ date: unknown, tempsTotal: number, estComplet: boolean }> } };

export type AnomaliesQueryVariables = Exact<{
  projetId?: string | number | null | undefined;
  equipeId?: string | number | null | undefined;
  userId?: string | number | null | undefined;
  dateDebut: unknown;
  dateFin: unknown;
  types?: Array<AnomalyType> | AnomalyType | null | undefined;
}>;


export type AnomaliesQuery = { anomalies: Array<{ id: string, type: AnomalyType, date: unknown, semaine: string | null, detail: string, utilisateur: { id: string, nomComplet: string, email: string, equipe: { id: string, nom: string } | null }, projet: { id: string, nom: string, code: string } | null }> };

export type TeamFullFieldsFragment = { id: string, nom: string, code: string, description: string | null, estActif: boolean, createdAt: unknown, membres: Array<{ id: string, nomComplet: string }> };

export type EquipesFullQueryVariables = Exact<{
  actifSeulement?: boolean | null | undefined;
}>;


export type EquipesFullQuery = { equipes: Array<{ id: string, nom: string, code: string, description: string | null, estActif: boolean, createdAt: unknown, membres: Array<{ id: string, nomComplet: string }> }> };

export type EquipeQueryVariables = Exact<{
  id: string | number;
}>;


export type EquipeQuery = { equipe: { id: string, nom: string, code: string, description: string | null, estActif: boolean, createdAt: unknown, membres: Array<{ id: string, nomComplet: string }> } | null };

export type CreateTeamMutationVariables = Exact<{
  input: TeamInput;
}>;


export type CreateTeamMutation = { createTeam: { id: string, nom: string, code: string, description: string | null, estActif: boolean, createdAt: unknown, membres: Array<{ id: string, nomComplet: string }> } };

export type UpdateTeamMutationVariables = Exact<{
  id: string | number;
  input: TeamInput;
}>;


export type UpdateTeamMutation = { updateTeam: { id: string, nom: string, code: string, description: string | null, estActif: boolean, createdAt: unknown, membres: Array<{ id: string, nomComplet: string }> } };

export type DeleteTeamMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteTeamMutation = { deleteTeam: boolean };

export type UserFieldsFragment = { id: string, matricule: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: unknown, equipe: { id: string, nom: string, code: string } | null };

export type TeamFieldsFragment = { id: string, nom: string, code: string, estActif: boolean };

export type UsersQueryVariables = Exact<{
  equipeId?: string | number | null | undefined;
  role?: UserRole | null | undefined;
  search?: string | null | undefined;
  actifSeulement?: boolean | null | undefined;
  page?: number | null | undefined;
  first?: number | null | undefined;
}>;


export type UsersQuery = { users: { data: Array<{ id: string, matricule: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: unknown, equipe: { id: string, nom: string, code: string } | null }>, paginatorInfo: { currentPage: number, lastPage: number, total: number, hasMorePages: boolean } } };

export type UserQueryVariables = Exact<{
  id: string | number;
}>;


export type UserQuery = { user: { id: string, matricule: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: unknown, equipe: { id: string, nom: string, code: string } | null } | null };

export type EquipesQueryVariables = Exact<{
  actifSeulement?: boolean | null | undefined;
}>;


export type EquipesQuery = { equipes: Array<{ id: string, nom: string, code: string, estActif: boolean }> };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { createUser: { id: string, matricule: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: unknown, equipe: { id: string, nom: string, code: string } | null } };

export type UpdateUserMutationVariables = Exact<{
  id: string | number;
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string, matricule: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: unknown, equipe: { id: string, nom: string, code: string } | null } };

export type DeleteUserMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteUserMutation = { deleteUser: boolean };

export type RestoreUserMutationVariables = Exact<{
  id: string | number;
}>;


export type RestoreUserMutation = { restoreUser: { id: string, matricule: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: unknown, equipe: { id: string, nom: string, code: string } | null } };

export type RestrictionsVisibiliteQueryVariables = Exact<{
  projetId: string | number;
}>;


export type RestrictionsVisibiliteQuery = { restrictionsVisibilite: Array<{ id: string, estVisible: boolean, activite: { id: string, nom: string, chemin: string }, utilisateur: { id: string, nomComplet: string, email: string } }> };

export type HideActivityForUserMutationVariables = Exact<{
  projetId: string | number;
  activiteId: string | number;
  userId: string | number;
}>;


export type HideActivityForUserMutation = { hideActivityForUser: boolean };

export type ShowActivityForUserMutationVariables = Exact<{
  projetId: string | number;
  activiteId: string | number;
  userId: string | number;
}>;


export type ShowActivityForUserMutation = { showActivityForUser: boolean };

export const ActivityFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<ActivityFieldsFragment, unknown>;
export const ActivityTreeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityTreeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"enfants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"enfants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"enfants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ActivityTreeFieldsFragment, unknown>;
export const NotificationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"titre"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"donnees"}},{"kind":"Field","name":{"kind":"Name","value":"estLu"}},{"kind":"Field","name":{"kind":"Name","value":"luLe"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<NotificationFieldsFragment, unknown>;
export const ProjectFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjectFieldsFragment, unknown>;
export const ProjectFullFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<ProjectFullFieldsFragment, unknown>;
export const SaisieFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<SaisieFieldsFragment, unknown>;
export const ProjetFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<ProjetFieldsFragment, unknown>;
export const ActiviteFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActiviteFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<ActiviteFieldsFragment, unknown>;
export const TeamFullFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<TeamFullFieldsFragment, unknown>;
export const UserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const TeamFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<TeamFieldsFragment, unknown>;
export const ArbreActivitesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArbreActivites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arbreActivites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityTreeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityTreeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"enfants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"enfants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"enfants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ArbreActivitesQuery, ArbreActivitesQueryVariables>;
export const CreateActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateActivityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<CreateActivityMutation, CreateActivityMutationVariables>;
export const UpdateActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateActivityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<UpdateActivityMutation, UpdateActivityMutationVariables>;
export const DeleteActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteActivityMutation, DeleteActivityMutationVariables>;
export const MoveActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ordre"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"parentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordre"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ordre"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}},{"kind":"Field","name":{"kind":"Name","value":"niveau"}},{"kind":"Field","name":{"kind":"Name","value":"ordre"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estSysteme"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<MoveActivityMutation, MoveActivityMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const DemanderReinitialisationMdpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DemanderReinitialisationMdp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DemanderReinitialisationMdpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"demanderReinitialisationMdp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DemanderReinitialisationMdpMutation, DemanderReinitialisationMdpMutationVariables>;
export const ReinitialiserMdpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReinitialiserMdp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReinitialisationMdpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reinitialiserMdp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ReinitialiserMdpMutation, ReinitialiserMdpMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const RequestExportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestExport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExportInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestExport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"statut"}},{"kind":"Field","name":{"kind":"Name","value":"filtres"}},{"kind":"Field","name":{"kind":"Name","value":"expireLe"}},{"kind":"Field","name":{"kind":"Name","value":"creeLe"}}]}}]}}]} as unknown as DocumentNode<RequestExportMutation, RequestExportMutationVariables>;
export const MesExportsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MesExports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mesExports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"statut"}},{"kind":"Field","name":{"kind":"Name","value":"filtres"}},{"kind":"Field","name":{"kind":"Name","value":"expireLe"}},{"kind":"Field","name":{"kind":"Name","value":"creeLe"}}]}}]}}]} as unknown as DocumentNode<MesExportsQuery, MesExportsQueryVariables>;
export const DesactiverExportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DesactiverExport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"desactiverExport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"statut"}},{"kind":"Field","name":{"kind":"Name","value":"filtres"}},{"kind":"Field","name":{"kind":"Name","value":"expireLe"}},{"kind":"Field","name":{"kind":"Name","value":"creeLe"}}]}}]}}]} as unknown as DocumentNode<DesactiverExportMutation, DesactiverExportMutationVariables>;
export const SupprimerExportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SupprimerExport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supprimerExport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<SupprimerExportMutation, SupprimerExportMutationVariables>;
export const MesNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MesNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonLuSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limite"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mesNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nonLuSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonLuSeulement"}}},{"kind":"Argument","name":{"kind":"Name","value":"limite"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limite"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"titre"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"donnees"}},{"kind":"Field","name":{"kind":"Name","value":"estLu"}},{"kind":"Field","name":{"kind":"Name","value":"luLe"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<MesNotificationsQuery, MesNotificationsQueryVariables>;
export const NombreNotificationsNonLuesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NombreNotificationsNonLues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nombreNotificationsNonLues"}}]}}]} as unknown as DocumentNode<NombreNotificationsNonLuesQuery, NombreNotificationsNonLuesQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"titre"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"donnees"}},{"kind":"Field","name":{"kind":"Name","value":"estLu"}},{"kind":"Field","name":{"kind":"Name","value":"luLe"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const DeleteNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteNotificationMutation, DeleteNotificationMutationVariables>;
export const DeleteAllNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAllNotifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAllNotifications"}}]}}]} as unknown as DocumentNode<DeleteAllNotificationsMutation, DeleteAllNotificationsMutationVariables>;
export const ResolveAbsenceConflictDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResolveAbsenceConflict"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"absenceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resolution"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConflictResolution"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveAbsenceConflict"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"absenceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"absenceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"resolution"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resolution"}}}]}]}}]} as unknown as DocumentNode<ResolveAbsenceConflictMutation, ResolveAbsenceConflictMutationVariables>;
export const ProjetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Projets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actif"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moderateurId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actif"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actif"}}},{"kind":"Argument","name":{"kind":"Name","value":"moderateurId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moderateurId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFields"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjetsQuery, ProjetsQueryVariables>;
export const ProjetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Projet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<ProjetQuery, ProjetQueryVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const DeleteProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const SetProjectActivitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetProjectActivities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activiteIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setProjectActivities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"activiteIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activiteIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<SetProjectActivitiesMutation, SetProjectActivitiesMutationVariables>;
export const AddProjectModeratorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddProjectModerator"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addProjectModerator"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]}}]} as unknown as DocumentNode<AddProjectModeratorMutation, AddProjectModeratorMutationVariables>;
export const RemoveProjectModeratorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveProjectModerator"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeProjectModerator"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveProjectModeratorMutation, RemoveProjectModeratorMutationVariables>;
export const SupprimerDonneesUtilisateurDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SupprimerDonneesUtilisateur"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"confirmationNom"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supprimerDonneesUtilisateur"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"confirmationNom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"confirmationNom"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saisiesSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"absencesSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"notificationsSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"exportsSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"logsAnonymises"}}]}}]}}]} as unknown as DocumentNode<SupprimerDonneesUtilisateurMutation, SupprimerDonneesUtilisateurMutationVariables>;
export const PurgerToutesDonneesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PurgerToutesDonnees"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"confirmationPhrase"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purgerToutesDonnees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"confirmationPhrase"},"value":{"kind":"Variable","name":{"kind":"Name","value":"confirmationPhrase"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saisiesSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"logsSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"absencesSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"notificationsSupprimees"}},{"kind":"Field","name":{"kind":"Name","value":"exportsSupprimees"}}]}}]}}]} as unknown as DocumentNode<PurgerToutesDonneesMutation, PurgerToutesDonneesMutationVariables>;
export const MesSaisiesSemaineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MesSaisiesSemaine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"semaine"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mesSaisiesSemaine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"semaine"},"value":{"kind":"Variable","name":{"kind":"Name","value":"semaine"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<MesSaisiesSemaineQuery, MesSaisiesSemaineQueryVariables>;
export const UtilisateursModerablesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UtilisateursModerables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"utilisateursModerables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<UtilisateursModerablesQuery, UtilisateursModerablesQueryVariables>;
export const ProjetsActifsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjetsActifs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actif"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<ProjetsActifsQuery, ProjetsActifsQueryVariables>;
export const ActivitesDisponiblesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActivitesDisponibles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activitesDisponibles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActiviteFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActiviteFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<ActivitesDisponiblesQuery, ActivitesDisponiblesQueryVariables>;
export const AbsencesSemaineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AbsencesSemaine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"absences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLibelle"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"dureeJournaliere"}}]}}]}}]} as unknown as DocumentNode<AbsencesSemaineQuery, AbsencesSemaineQueryVariables>;
export const SyncAbsencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncAbsences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncAbsences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importes"}},{"kind":"Field","name":{"kind":"Name","value":"conflits"}},{"kind":"Field","name":{"kind":"Name","value":"erreurs"}}]}}]}}]} as unknown as DocumentNode<SyncAbsencesMutation, SyncAbsencesMutationVariables>;
export const HistoriqueSaisieDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HistoriqueSaisie"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"semaineISO"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mesSaisiesSemaine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"semaine"},"value":{"kind":"Variable","name":{"kind":"Name","value":"semaineISO"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}}]}},{"kind":"Field","name":{"kind":"Name","value":"historique"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"ancienneDuree"}},{"kind":"Field","name":{"kind":"Name","value":"nouvelleDuree"}},{"kind":"Field","name":{"kind":"Name","value":"ancienCommentaire"}},{"kind":"Field","name":{"kind":"Name","value":"nouveauCommentaire"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"auteur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]}}]}}]} as unknown as DocumentNode<HistoriqueSaisieQuery, HistoriqueSaisieQueryVariables>;
export const CreateTimeEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTimeEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTimeEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<CreateTimeEntryMutation, CreateTimeEntryMutationVariables>;
export const UpdateTimeEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTimeEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTimeEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<UpdateTimeEntryMutation, UpdateTimeEntryMutationVariables>;
export const DeleteTimeEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTimeEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTimeEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTimeEntryMutation, DeleteTimeEntryMutationVariables>;
export const BulkCreateTimeEntriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BulkCreateTimeEntries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inputs"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntryInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkCreateTimeEntries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inputs"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inputs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<BulkCreateTimeEntriesMutation, BulkCreateTimeEntriesMutationVariables>;
export const BulkUpdateTimeEntriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BulkUpdateTimeEntries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entries"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkUpdateEntry"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkUpdateTimeEntries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entries"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entries"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<BulkUpdateTimeEntriesMutation, BulkUpdateTimeEntriesMutationVariables>;
export const DeclarerAbsenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeclarerAbsence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"duree"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declarerAbsence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"duree"},"value":{"kind":"Variable","name":{"kind":"Name","value":"duree"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<DeclarerAbsenceMutation, DeclarerAbsenceMutationVariables>;
export const ParametresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Parametres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parametres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cle"}},{"kind":"Field","name":{"kind":"Name","value":"valeur"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<ParametresQuery, ParametresQueryVariables>;
export const UpdateSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settings"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SettingInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"settings"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settings"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cle"}},{"kind":"Field","name":{"kind":"Name","value":"valeur"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<UpdateSettingsMutation, UpdateSettingsMutationVariables>;
export const ResetSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cle"}},{"kind":"Field","name":{"kind":"Name","value":"valeur"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<ResetSettingsMutation, ResetSettingsMutationVariables>;
export const ParametreAbsenceModeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ParametreAbsenceMode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parametre"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cle"},"value":{"kind":"StringValue","value":"absence_mode","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"valeur"}}]}}]}}]} as unknown as DocumentNode<ParametreAbsenceModeQuery, ParametreAbsenceModeQueryVariables>;
export const TesterConnexionRhApiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TesterConnexionRhApi"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testerConnexionRhApi"}}]}}]} as unknown as DocumentNode<TesterConnexionRhApiMutation, TesterConnexionRhApiMutationVariables>;
export const MesStatistiquesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MesStatistiques"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistiques"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"parProjet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"pourcentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parActivite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"pourcentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parJour"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"estComplet"}}]}}]}}]}}]} as unknown as DocumentNode<MesStatistiquesQuery, MesStatistiquesQueryVariables>;
export const StatsGlobalesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StatsGlobales"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistiques"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}},{"kind":"Argument","name":{"kind":"Name","value":"equipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"parProjet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"pourcentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parActivite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"pourcentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parUtilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"utilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"tauxCompletion"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parJour"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"estComplet"}}]}}]}}]}}]} as unknown as DocumentNode<StatsGlobalesQuery, StatsGlobalesQueryVariables>;
export const StatsPeriodePrecedenteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StatsPeriodePrecedente"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistiques"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}},{"kind":"Argument","name":{"kind":"Name","value":"equipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"parUtilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"utilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"tauxCompletion"}}]}}]}}]}}]} as unknown as DocumentNode<StatsPeriodePrecedenteQuery, StatsPeriodePrecedenteQueryVariables>;
export const StatsProjetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StatsProjet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistiques"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}},{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"parActivite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"pourcentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parUtilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"utilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"tauxCompletion"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parJour"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"tempsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"estComplet"}}]}}]}}]}}]} as unknown as DocumentNode<StatsProjetQuery, StatsProjetQueryVariables>;
export const AnomaliesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Anomalies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"types"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AnomalyType"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"anomalies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"equipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}},{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"Variable","name":{"kind":"Name","value":"types"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"semaine"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"utilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AnomaliesQuery, AnomaliesQueryVariables>;
export const EquipesFullDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EquipesFull"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actifSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<EquipesFullQuery, EquipesFullQueryVariables>;
export const EquipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Equipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<EquipeQuery, EquipeQueryVariables>;
export const CreateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<CreateTeamMutation, CreateTeamMutationVariables>;
export const UpdateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const DeleteTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTeamMutation, DeleteTeamMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"equipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"actifSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const UserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"User"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const EquipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Equipes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actifSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<EquipesQuery, EquipesQueryVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const RestoreUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RestoreUserMutation, RestoreUserMutationVariables>;
export const RestrictionsVisibiliteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RestrictionsVisibilite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restrictionsVisibilite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estVisible"}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<RestrictionsVisibiliteQuery, RestrictionsVisibiliteQueryVariables>;
export const HideActivityForUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"HideActivityForUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hideActivityForUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"activiteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<HideActivityForUserMutation, HideActivityForUserMutationVariables>;
export const ShowActivityForUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ShowActivityForUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"showActivityForUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"activiteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<ShowActivityForUserMutation, ShowActivityForUserMutationVariables>;