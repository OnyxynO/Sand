/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date string with format `Y-m-d`, e.g. `2025-01-27`. */
  Date: { input: any; output: any; }
  /** A datetime string with format `Y-m-d H:i:s`, e.g. `2018-05-23 13:43:32`. */
  DateTime: { input: any; output: any; }
  /** Arbitrary JSON data. */
  JSON: { input: any; output: any; }
};

/** Absence d'un utilisateur */
export type Absence = {
  __typename?: 'Absence';
  /** Date de creation */
  createdAt: Scalars['DateTime']['output'];
  /** Date de debut de l'absence */
  dateDebut: Scalars['Date']['output'];
  /** Date de fin de l'absence */
  dateFin: Scalars['Date']['output'];
  /** Duree journaliere en ETP (0.5 ou 1.0) */
  dureeJournaliere: Scalars['Float']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Date d'import depuis l'API RH */
  importeLe?: Maybe<Scalars['DateTime']['output']>;
  /** Nombre de jours d'absence */
  nombreJours: Scalars['Int']['output'];
  /** Reference dans le systeme RH externe */
  referenceExterne?: Maybe<Scalars['String']['output']>;
  /** Statut de l'absence (validee, en_attente, etc.) */
  statut: Scalars['String']['output'];
  /** Total ETP de l'absence */
  totalEtp: Scalars['Float']['output'];
  /** Code du type d'absence */
  type: Scalars['String']['output'];
  /** Libelle du type d'absence */
  typeLibelle: Scalars['String']['output'];
  /** Date de derniere modification */
  updatedAt: Scalars['DateTime']['output'];
  /** Utilisateur concerne */
  utilisateur: User;
};

/** Donnees d'une absence */
export type AbsenceInput = {
  /** Date de debut de l'absence */
  dateDebut: Scalars['Date']['input'];
  /** Date de fin de l'absence */
  dateFin: Scalars['Date']['input'];
  /** Duree journaliere en ETP (0.5 a 1.0) */
  dureeJournaliere?: InputMaybe<Scalars['Float']['input']>;
  /** Code du type d'absence */
  type: Scalars['String']['input'];
  /** Identifiant de l'utilisateur concerne */
  userId: Scalars['ID']['input'];
};

/** Activite (arborescence) */
export type Activity = {
  __typename?: 'Activity';
  /** Chemin ltree dans l'arborescence */
  chemin: Scalars['String']['output'];
  /** Chemin complet avec noms */
  cheminComplet: Scalars['String']['output'];
  /** Code court (optionnel) */
  code?: Maybe<Scalars['String']['output']>;
  /** Date de creation */
  createdAt: Scalars['DateTime']['output'];
  /** Description de l'activite */
  description?: Maybe<Scalars['String']['output']>;
  /** Activites enfants */
  enfants: Array<Activity>;
  /** Indique si l'activite est active */
  estActif: Scalars['Boolean']['output'];
  /** Indique si c'est une feuille saisissable */
  estFeuille: Scalars['Boolean']['output'];
  /** Indique si c'est une activite systeme protegee */
  estSysteme: Scalars['Boolean']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Niveau de profondeur dans l'arborescence (0 = racine) */
  niveau: Scalars['Int']['output'];
  /** Nom de l'activite */
  nom: Scalars['String']['output'];
  /** Ordre d'affichage parmi les freres */
  ordre: Scalars['Int']['output'];
  /** Activite parente */
  parent?: Maybe<Activity>;
  /** Projets sur lesquels cette activite est activee */
  projets: Array<Project>;
  /** Date de derniere modification */
  updatedAt: Scalars['DateTime']['output'];
};

/** Statistiques par activite */
export type ActivityStat = {
  __typename?: 'ActivityStat';
  /** Activite concernee */
  activite: Activity;
  /** Pourcentage du temps total */
  pourcentage: Scalars['Float']['output'];
  /** Temps total en ETP */
  tempsTotal: Scalars['Float']['output'];
};

/** Restriction de visibilite d'une activite pour un utilisateur */
export type ActivityVisibility = {
  __typename?: 'ActivityVisibility';
  /** Activite concernee */
  activite: Activity;
  /** Date de creation de la restriction */
  createdAt: Scalars['DateTime']['output'];
  /** Indique si l'activite est visible pour cet utilisateur */
  estVisible: Scalars['Boolean']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Projet concerne */
  projet: Project;
  /** Utilisateur concerne */
  utilisateur: User;
};

/** Anomalie detectee dans les saisies */
export type Anomaly = {
  __typename?: 'Anomaly';
  /** Date de l'anomalie (si applicable) */
  date?: Maybe<Scalars['Date']['output']>;
  /** Description de l'anomalie */
  detail: Scalars['String']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Projet concerne (si applicable) */
  projet?: Maybe<Project>;
  /** Semaine de l'anomalie (format ISO, si applicable) */
  semaine?: Maybe<Scalars['String']['output']>;
  /** Type d'anomalie */
  type: AnomalyType;
  /** Utilisateur concerne */
  utilisateur: User;
};

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

/** Payload retourne apres authentification */
export type AuthPayload = {
  __typename?: 'AuthPayload';
  /** Utilisateur authentifie */
  user: User;
};

/** Mise a jour en lot */
export type BulkUpdateEntry = {
  /** Nouveau commentaire (1000 caracteres max) */
  commentaire?: InputMaybe<Scalars['String']['input']>;
  /** Nouvelle duree en ETP (0.01 a 1.00) */
  duree: Scalars['Float']['input'];
  /** Identifiant de la saisie a modifier */
  id: Scalars['ID']['input'];
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
  code?: InputMaybe<Scalars['String']['input']>;
  /** Description de l'activite */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Activer ou desactiver l'activite */
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  /** Nom de l'activite */
  nom: Scalars['String']['input'];
  /** Ordre d'affichage */
  ordre?: InputMaybe<Scalars['Int']['input']>;
  /** ID de l'activite parente (null = racine) */
  parentId?: InputMaybe<Scalars['ID']['input']>;
};

/** Creation d'un projet */
export type CreateProjectInput = {
  /** IDs des activites a activer */
  activiteIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Code court unique */
  code: Scalars['String']['input'];
  /** Date de debut du projet */
  dateDebut?: InputMaybe<Scalars['Date']['input']>;
  /** Date de fin du projet */
  dateFin?: InputMaybe<Scalars['Date']['input']>;
  /** Description du projet */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Activer ou desactiver le projet */
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  /** IDs des moderateurs a assigner */
  moderateurIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Nom du projet */
  nom: Scalars['String']['input'];
};

/** Creation d'un utilisateur */
export type CreateUserInput = {
  /** Adresse email (unique parmi les comptes non supprimes) */
  email: Scalars['String']['input'];
  /** Identifiant de l'equipe */
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  /** Matricule interne (unique, optionnel) */
  matricule?: InputMaybe<Scalars['String']['input']>;
  /** Nom de famille */
  nom: Scalars['String']['input'];
  /** Mot de passe (8 caracteres minimum) */
  password: Scalars['String']['input'];
  /** Prenom */
  prenom: Scalars['String']['input'];
  /** Role dans le systeme */
  role: UserRole;
};

/** Statistiques par jour */
export type DayStat = {
  __typename?: 'DayStat';
  /** Date du jour */
  date: Scalars['Date']['output'];
  /** Indique si le jour est complet (total ~= 1.0 ETP) */
  estComplet: Scalars['Boolean']['output'];
  /** Temps total en ETP */
  tempsTotal: Scalars['Float']['output'];
};

/** Demande de reinitialisation de mot de passe */
export type DemanderReinitialisationMdpInput = {
  /** Adresse email du compte (max 80 caracteres) */
  email: Scalars['String']['input'];
};

/** Format d'export */
export type ExportFormat =
  /** Export au format CSV */
  | 'CSV';

/** Parametres d'export */
export type ExportInput = {
  /** Date de debut de la periode */
  dateDebut: Scalars['Date']['input'];
  /** Date de fin de la periode */
  dateFin: Scalars['Date']['input'];
  /** Filtrer par equipe */
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  /** Format de l'export */
  format: ExportFormat;
  /** Filtrer par projet */
  projetId?: InputMaybe<Scalars['ID']['input']>;
  /** Filtrer par utilisateur */
  userId?: InputMaybe<Scalars['ID']['input']>;
};

/** Job d'export asynchrone */
export type ExportJob = {
  __typename?: 'ExportJob';
  /** Date de creation de la demande */
  creeLe: Scalars['DateTime']['output'];
  /** Date d'expiration du fichier */
  expireLe?: Maybe<Scalars['DateTime']['output']>;
  /** Filtres utilises pour generer l'export */
  filtres?: Maybe<Scalars['JSON']['output']>;
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Statut du job */
  statut: ExportStatus;
  /** URL de telechargement (disponible quand termine) */
  urlTelechargement?: Maybe<Scalars['String']['output']>;
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
  email: Scalars['String']['input'];
  /** Mot de passe (6 caracteres minimum, 80 maximum) */
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Ajouter un moderateur au projet */
  addProjectModerator: Project;
  /** Affecter un utilisateur au projet */
  addProjectUser: Project;
  /** Creer plusieurs saisies d'un coup */
  bulkCreateTimeEntries: Array<TimeEntry>;
  /** Mettre a jour plusieurs saisies d'un coup */
  bulkUpdateTimeEntries: Array<TimeEntry>;
  /** Creer une absence manuellement */
  createAbsence: Absence;
  /** Creer une activite (Admin) */
  createActivity: Activity;
  /** Creer un projet (Admin) */
  createProject: Project;
  /** Creer une equipe (Admin) */
  createTeam: Team;
  /** Creer une saisie de temps */
  createTimeEntry: TimeEntry;
  /** Creer un utilisateur (Admin) */
  createUser: User;
  /** Mode manuel : declarer une absence pour une journee (duree null = supprimer). userId optionnel pour admin/moderateur. */
  declarerAbsence: Scalars['Boolean']['output'];
  /** Supprimer une absence */
  deleteAbsence: Scalars['Boolean']['output'];
  /** Supprimer une activite (Admin, soft delete) */
  deleteActivity: Scalars['Boolean']['output'];
  /** Supprimer toutes les notifications */
  deleteAllNotifications: Scalars['Boolean']['output'];
  /** Supprimer une notification */
  deleteNotification: Scalars['Boolean']['output'];
  /** Supprimer un projet (Admin, soft delete) */
  deleteProject: Scalars['Boolean']['output'];
  /** Supprimer une equipe (Admin) */
  deleteTeam: Scalars['Boolean']['output'];
  /** Supprimer une saisie de temps */
  deleteTimeEntry: Scalars['Boolean']['output'];
  /** Supprimer un utilisateur (Admin, soft delete) */
  deleteUser: Scalars['Boolean']['output'];
  /** Demande de reinitialisation de mot de passe (envoi d'un email avec lien) */
  demanderReinitialisationMdp: Scalars['Boolean']['output'];
  /** Desactiver un export (supprime le fichier, conserve la ligne) */
  desactiverExport: ExportJob;
  /** Masquer une activite pour un utilisateur sur un projet */
  hideActivityForUser: Scalars['Boolean']['output'];
  /** Connexion */
  login: AuthPayload;
  /** Deconnexion */
  logout: Scalars['Boolean']['output'];
  /** Marquer toutes les notifications comme lues */
  markAllNotificationsRead: Scalars['Boolean']['output'];
  /** Marquer une notification comme lue */
  markNotificationRead: Notification;
  /** Deplacer/reordonner une activite dans l'arborescence */
  moveActivity: Activity;
  /** Purger toutes les donnees transactionnelles (Admin) */
  purgerToutesDonnees: ResultatPurge;
  /** Reinitialisation du mot de passe via le token recu par email */
  reinitialiserMdp: Scalars['Boolean']['output'];
  /** Retirer un moderateur du projet */
  removeProjectModerator: Project;
  /** Retirer un utilisateur du projet */
  removeProjectUser: Project;
  /** Reordonner des activites */
  reorderActivities: Array<Activity>;
  /** Demander un export */
  requestExport: ExportJob;
  /** Reinitialiser tous les parametres a leurs valeurs par defaut (Admin) */
  resetSettings: Array<Setting>;
  /** Resoudre un conflit d'absence */
  resolveAbsenceConflict: Scalars['Boolean']['output'];
  /** Restaurer une activite supprimee (Admin) */
  restoreActivity: Activity;
  /** Restaurer un projet supprime (Admin) */
  restoreProject: Project;
  /** Restaurer un utilisateur supprime (Admin) */
  restoreUser: User;
  /** Definir les activites actives sur un projet */
  setProjectActivities: Project;
  /** Rendre visible une activite pour un utilisateur sur un projet */
  showActivityForUser: Scalars['Boolean']['output'];
  /** Supprimer les donnees d'un utilisateur (RGPD droit a l'oubli, Admin) */
  supprimerDonneesUtilisateur: ResultatSuppressionRgpd;
  /** Supprimer definitivement un export (supprime la ligne en base) */
  supprimerExport: Scalars['Boolean']['output'];
  /** Synchroniser les absences depuis l'API RH */
  syncAbsences: SyncResult;
  /** Tester la connexion a l'API RH avec les settings actuels (null = OK, sinon message erreur) */
  testerConnexionRhApi?: Maybe<Scalars['String']['output']>;
  /** Modifier une activite (Admin) */
  updateActivity: Activity;
  /** Modifier un projet (Admin) */
  updateProject: Project;
  /** Modifier un parametre systeme (Admin) */
  updateSetting: Setting;
  /** Modifier plusieurs parametres (Admin) */
  updateSettings: Array<Setting>;
  /** Modifier une equipe (Admin) */
  updateTeam: Team;
  /** Modifier une saisie de temps */
  updateTimeEntry: TimeEntry;
  /** Modifier un utilisateur (Admin) */
  updateUser: User;
};


export type MutationaddProjectModeratorArgs = {
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationaddProjectUserArgs = {
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationbulkCreateTimeEntriesArgs = {
  inputs: Array<TimeEntryInput>;
};


export type MutationbulkUpdateTimeEntriesArgs = {
  entries: Array<BulkUpdateEntry>;
};


export type MutationcreateAbsenceArgs = {
  input: AbsenceInput;
};


export type MutationcreateActivityArgs = {
  input: CreateActivityInput;
};


export type MutationcreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationcreateTeamArgs = {
  input: TeamInput;
};


export type MutationcreateTimeEntryArgs = {
  input: TimeEntryInput;
};


export type MutationcreateUserArgs = {
  input: CreateUserInput;
};


export type MutationdeclarerAbsenceArgs = {
  date: Scalars['Date']['input'];
  duree?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationdeleteAbsenceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteActivityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteTeamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteTimeEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdemanderReinitialisationMdpArgs = {
  input: DemanderReinitialisationMdpInput;
};


export type MutationdesactiverExportArgs = {
  id: Scalars['ID']['input'];
};


export type MutationhideActivityForUserArgs = {
  activiteId: Scalars['ID']['input'];
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationloginArgs = {
  input: LoginInput;
};


export type MutationmarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationmoveActivityArgs = {
  id: Scalars['ID']['input'];
  ordre: Scalars['Int']['input'];
  parentId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationpurgerToutesDonneesArgs = {
  confirmationPhrase: Scalars['String']['input'];
};


export type MutationreinitialiserMdpArgs = {
  input: ReinitialisationMdpInput;
};


export type MutationremoveProjectModeratorArgs = {
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationremoveProjectUserArgs = {
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationreorderActivitiesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationrequestExportArgs = {
  input: ExportInput;
};


export type MutationresolveAbsenceConflictArgs = {
  absenceId: Scalars['ID']['input'];
  resolution: ConflictResolution;
};


export type MutationrestoreActivityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationrestoreProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationrestoreUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsetProjectActivitiesArgs = {
  activiteIds: Array<Scalars['ID']['input']>;
  projetId: Scalars['ID']['input'];
};


export type MutationshowActivityForUserArgs = {
  activiteId: Scalars['ID']['input'];
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationsupprimerDonneesUtilisateurArgs = {
  confirmationNom: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationsupprimerExportArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsyncAbsencesArgs = {
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationupdateActivityArgs = {
  id: Scalars['ID']['input'];
  input: UpdateActivityInput;
};


export type MutationupdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
};


export type MutationupdateSettingArgs = {
  cle: Scalars['String']['input'];
  valeur: Scalars['JSON']['input'];
};


export type MutationupdateSettingsArgs = {
  settings: Array<SettingInput>;
};


export type MutationupdateTeamArgs = {
  id: Scalars['ID']['input'];
  input: TeamInput;
};


export type MutationupdateTimeEntryArgs = {
  id: Scalars['ID']['input'];
  input: TimeEntryInput;
};


export type MutationupdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

/** Notification utilisateur */
export type Notification = {
  __typename?: 'Notification';
  /** Date d'envoi */
  createdAt: Scalars['DateTime']['output'];
  /** Donnees supplementaires (JSON) */
  donnees?: Maybe<Scalars['JSON']['output']>;
  /** Indique si la notification a ete lue */
  estLu: Scalars['Boolean']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Date de lecture */
  luLe?: Maybe<Scalars['DateTime']['output']>;
  /** Contenu de la notification */
  message: Scalars['String']['output'];
  /** Titre de la notification */
  titre: Scalars['String']['output'];
  /** Type de notification */
  type: Scalars['String']['output'];
  /** Utilisateur destinataire */
  utilisateur: User;
};

/** Type de notification */
export type NotificationType =
  /** Absence importee depuis l'API RH */
  | 'ABSENCE_IMPORTEE'
  /** Conflit entre une absence et des saisies existantes */
  | 'CONFLIT_ABSENCE'
  /** Export CSV pret a telecharger */
  | 'EXPORT_PRET'
  /** Saisie incomplete sur un ou plusieurs jours */
  | 'SAISIE_INCOMPLETE'
  /** Notification systeme generale */
  | 'SYSTEME';

/** Allows ordering a list of records. */
export type OrderByClause = {
  /** The column that is used for ordering. */
  column: Scalars['String']['input'];
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Aggregate functions when ordering by a relation without specifying a column. */
export type OrderByRelationAggregateFunction =
  /** Amount of items. */
  | 'COUNT';

/** Aggregate functions when ordering by a relation that may specify a column. */
export type OrderByRelationWithColumnAggregateFunction =
  /** Average. */
  | 'AVG'
  /** Amount of items. */
  | 'COUNT'
  /** Maximum. */
  | 'MAX'
  /** Minimum. */
  | 'MIN'
  /** Sum. */
  | 'SUM';

/** Information about pagination using a fully featured paginator. */
export type PaginatorInfo = {
  __typename?: 'PaginatorInfo';
  /** Number of items in the current page. */
  count: Scalars['Int']['output'];
  /** Index of the current page. */
  currentPage: Scalars['Int']['output'];
  /** Index of the first item in the current page. */
  firstItem?: Maybe<Scalars['Int']['output']>;
  /** Are there more pages after this one? */
  hasMorePages: Scalars['Boolean']['output'];
  /** Index of the last item in the current page. */
  lastItem?: Maybe<Scalars['Int']['output']>;
  /** Index of the last available page. */
  lastPage: Scalars['Int']['output'];
  /** Number of items per page. */
  perPage: Scalars['Int']['output'];
  /** Number of total available items. */
  total: Scalars['Int']['output'];
};

/** Projet */
export type Project = {
  __typename?: 'Project';
  /** Activites explicitement activees sur ce projet */
  activitesActives: Array<Activity>;
  /** Code court unique */
  code: Scalars['String']['output'];
  /** Date de creation */
  createdAt: Scalars['DateTime']['output'];
  /** Date de debut du projet */
  dateDebut?: Maybe<Scalars['Date']['output']>;
  /** Date de fin du projet */
  dateFin?: Maybe<Scalars['Date']['output']>;
  /** Description du projet */
  description?: Maybe<Scalars['String']['output']>;
  /** Indique si le projet est actif */
  estActif: Scalars['Boolean']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Moderateurs du projet */
  moderateurs: Array<User>;
  /** Nom du projet */
  nom: Scalars['String']['output'];
  /** Saisies sur ce projet */
  saisies: Array<TimeEntry>;
  /** Temps total sur une periode */
  tempsTotal: Scalars['Float']['output'];
  /** Date de derniere modification */
  updatedAt: Scalars['DateTime']['output'];
  /** Utilisateurs affectes au projet */
  utilisateurs: Array<User>;
};


/** Projet */
export type ProjectsaisiesArgs = {
  dateDebut?: InputMaybe<Scalars['Date']['input']>;
  dateFin?: InputMaybe<Scalars['Date']['input']>;
};


/** Projet */
export type ProjecttempsTotalArgs = {
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
};

/** Statistiques par projet */
export type ProjectStat = {
  __typename?: 'ProjectStat';
  /** Pourcentage du temps total */
  pourcentage: Scalars['Float']['output'];
  /** Projet concerne */
  projet: Project;
  /** Temps total en ETP */
  tempsTotal: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Absences (avec detection des chevauchements) */
  absences: Array<Absence>;
  /** Une activite par ID */
  activite?: Maybe<Activity>;
  /** Activites disponibles pour un projet */
  activitesDisponibles: Array<Activity>;
  /** Anomalies detectees dans les saisies */
  anomalies: Array<Anomaly>;
  /** Arborescence complete des activites (hors activites systeme) */
  arbreActivites: Array<Activity>;
  /** Une equipe par ID */
  equipe?: Maybe<Team>;
  /** Liste des equipes */
  equipes: Array<Team>;
  /** Utilisateur connecte */
  me?: Maybe<User>;
  /** Mes exports CSV (du plus recent au plus ancien) */
  mesExports: Array<ExportJob>;
  /** Mes notifications */
  mesNotifications: Array<Notification>;
  /** Saisies de la semaine (pour soi-meme ou un utilisateur modere) */
  mesSaisiesSemaine: Array<TimeEntry>;
  /** Nombre de notifications non lues */
  nombreNotificationsNonLues: Scalars['Int']['output'];
  /** Un parametre par cle */
  parametre?: Maybe<Setting>;
  /** Liste des parametres systeme */
  parametres: Array<Setting>;
  /** Un projet par ID */
  projet?: Maybe<Project>;
  /** Liste des projets */
  projets: Array<Project>;
  /** Restrictions de visibilite d'un projet */
  restrictionsVisibilite: Array<ActivityVisibility>;
  /** Saisies de temps (filtrees par droits d'acces) */
  saisies: Array<TimeEntry>;
  /** Statistiques agregees sur une periode */
  statistiques: Statistics;
  /** Un utilisateur par ID */
  user?: Maybe<User>;
  /** Liste des utilisateurs */
  users: UserPaginator;
  /** Utilisateurs dont le moderateur peut gerer les saisies */
  utilisateursModerables: Array<User>;
};


export type QueryabsencesArgs = {
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryactiviteArgs = {
  id: Scalars['ID']['input'];
};


export type QueryactivitesDisponiblesArgs = {
  projetId: Scalars['ID']['input'];
};


export type QueryanomaliesArgs = {
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  projetId?: InputMaybe<Scalars['ID']['input']>;
  types?: InputMaybe<Array<AnomalyType>>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryequipeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryequipesArgs = {
  actifSeulement?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerymesNotificationsArgs = {
  limite?: InputMaybe<Scalars['Int']['input']>;
  nonLuSeulement?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerymesSaisiesSemaineArgs = {
  semaine: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryparametreArgs = {
  cle: Scalars['String']['input'];
};


export type QueryprojetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryprojetsArgs = {
  actif?: InputMaybe<Scalars['Boolean']['input']>;
  moderateurId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryrestrictionsVisibiliteArgs = {
  projetId: Scalars['ID']['input'];
};


export type QuerysaisiesArgs = {
  activiteId?: InputMaybe<Scalars['ID']['input']>;
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  projetId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerystatistiquesArgs = {
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  projetId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryuserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryusersArgs = {
  actifSeulement?: InputMaybe<Scalars['Boolean']['input']>;
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
};

/** Reinitialisation du mot de passe avec token */
export type ReinitialisationMdpInput = {
  /** Adresse email du compte (max 80 caracteres) */
  email: Scalars['String']['input'];
  /** Nouveau mot de passe (8 caracteres minimum, 80 maximum) */
  password: Scalars['String']['input'];
  /** Confirmation du nouveau mot de passe (max 80 caracteres) */
  password_confirmation: Scalars['String']['input'];
  /** Token recu par email */
  token: Scalars['String']['input'];
};

export type ResultatPurge = {
  __typename?: 'ResultatPurge';
  absencesSupprimees: Scalars['Int']['output'];
  exportsSupprimees: Scalars['Int']['output'];
  logsSupprimees: Scalars['Int']['output'];
  notificationsSupprimees: Scalars['Int']['output'];
  saisiesSupprimees: Scalars['Int']['output'];
};

export type ResultatSuppressionRgpd = {
  __typename?: 'ResultatSuppressionRgpd';
  absencesSupprimees: Scalars['Int']['output'];
  exportsSupprimees: Scalars['Int']['output'];
  logsAnonymises: Scalars['Int']['output'];
  notificationsSupprimees: Scalars['Int']['output'];
  saisiesSupprimees: Scalars['Int']['output'];
};

/** Parametre systeme */
export type Setting = {
  __typename?: 'Setting';
  /** Cle unique du parametre */
  cle: Scalars['String']['output'];
  /** Date de creation */
  createdAt: Scalars['DateTime']['output'];
  /** Description du parametre */
  description?: Maybe<Scalars['String']['output']>;
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Date de derniere modification */
  updatedAt: Scalars['DateTime']['output'];
  /** Valeur du parametre (JSON) */
  valeur: Scalars['JSON']['output'];
};

/** Parametre systeme */
export type SettingInput = {
  /** Cle du parametre */
  cle: Scalars['String']['input'];
  /** Nouvelle valeur (JSON) */
  valeur: Scalars['JSON']['input'];
};

/** Directions for ordering a list of records. */
export type SortOrder =
  /** Sort records in ascending order. */
  | 'ASC'
  /** Sort records in descending order. */
  | 'DESC';

/** Statistiques agregees sur une periode */
export type Statistics = {
  __typename?: 'Statistics';
  /** Repartition du temps par activite */
  parActivite: Array<ActivityStat>;
  /** Detail jour par jour */
  parJour: Array<DayStat>;
  /** Repartition du temps par projet */
  parProjet: Array<ProjectStat>;
  /** Repartition du temps par utilisateur (moderateurs/admins) */
  parUtilisateur: Array<UserStat>;
  /** Temps total en ETP sur la periode */
  tempsTotal: Scalars['Float']['output'];
};

/** Resultat d'une synchronisation d'absences */
export type SyncResult = {
  __typename?: 'SyncResult';
  /** Nombre de conflits detectes */
  conflits: Scalars['Int']['output'];
  /** Liste des messages d'erreur */
  erreurs: Array<Scalars['String']['output']>;
  /** Nombre d'absences importees */
  importes: Scalars['Int']['output'];
};

/** Equipe ou service */
export type Team = {
  __typename?: 'Team';
  /** Code court unique */
  code: Scalars['String']['output'];
  /** Date de creation */
  createdAt: Scalars['DateTime']['output'];
  /** Description de l'equipe */
  description?: Maybe<Scalars['String']['output']>;
  /** Indique si l'equipe est active */
  estActif: Scalars['Boolean']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Membres de l'equipe */
  membres: Array<User>;
  /** Nom de l'equipe */
  nom: Scalars['String']['output'];
  /** Date de derniere modification */
  updatedAt: Scalars['DateTime']['output'];
};

/** Donnees d'une equipe */
export type TeamInput = {
  /** Code court unique */
  code: Scalars['String']['input'];
  /** Description de l'equipe */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Activer ou desactiver l'equipe */
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  /** Nom de l'equipe */
  nom: Scalars['String']['input'];
};

/** Saisie de temps */
export type TimeEntry = {
  __typename?: 'TimeEntry';
  /** Activite concernee */
  activite: Activity;
  /** Commentaire optionnel */
  commentaire?: Maybe<Scalars['String']['output']>;
  /** Date de creation */
  createdAt: Scalars['DateTime']['output'];
  /** Date de la saisie */
  date: Scalars['Date']['output'];
  /** Duree en ETP (0.01 a 1.00) */
  duree: Scalars['Float']['output'];
  /** Historique des modifications */
  historique: Array<TimeEntryLog>;
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Projet concerne */
  projet: Project;
  /** Date de derniere modification */
  updatedAt: Scalars['DateTime']['output'];
  /** Utilisateur qui a fait la saisie */
  utilisateur: User;
};

/** Donnees d'une saisie de temps */
export type TimeEntryInput = {
  /** Identifiant de l'activite */
  activiteId: Scalars['ID']['input'];
  /** Commentaire optionnel (1000 caracteres max) */
  commentaire?: InputMaybe<Scalars['String']['input']>;
  /** Date de la saisie */
  date: Scalars['Date']['input'];
  /** Duree en ETP (0.01 a 1.00) */
  duree: Scalars['Float']['input'];
  /** Identifiant du projet */
  projetId: Scalars['ID']['input'];
  /** Utilisateur cible (moderateurs/admins uniquement) */
  userId?: InputMaybe<Scalars['ID']['input']>;
};

/** Historique d'une saisie */
export type TimeEntryLog = {
  __typename?: 'TimeEntryLog';
  /** Type d'action effectuee */
  action: LogAction;
  /** Commentaire avant modification */
  ancienCommentaire?: Maybe<Scalars['String']['output']>;
  /** Duree avant modification */
  ancienneDuree?: Maybe<Scalars['Float']['output']>;
  /** Utilisateur ayant fait la modification */
  auteur: User;
  /** Date de la modification */
  createdAt: Scalars['DateTime']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Commentaire apres modification */
  nouveauCommentaire?: Maybe<Scalars['String']['output']>;
  /** Duree apres modification */
  nouvelleDuree?: Maybe<Scalars['Float']['output']>;
  /** Saisie concernee */
  saisie: TimeEntry;
};

/** Specify if you want to include or exclude trashed results from a query. */
export type Trashed =
  /** Only return trashed results. */
  | 'ONLY'
  /** Return both trashed and non-trashed results. */
  | 'WITH'
  /** Only return non-trashed results. */
  | 'WITHOUT';

/** Modification d'une activite */
export type UpdateActivityInput = {
  /** Code court */
  code?: InputMaybe<Scalars['String']['input']>;
  /** Description de l'activite */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Activer ou desactiver l'activite */
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  /** Nom de l'activite */
  nom?: InputMaybe<Scalars['String']['input']>;
  /** Ordre d'affichage */
  ordre?: InputMaybe<Scalars['Int']['input']>;
  /** ID de l'activite parente (null = racine) */
  parentId?: InputMaybe<Scalars['ID']['input']>;
};

/** Modification d'un projet */
export type UpdateProjectInput = {
  /** Code court */
  code?: InputMaybe<Scalars['String']['input']>;
  /** Date de debut du projet */
  dateDebut?: InputMaybe<Scalars['Date']['input']>;
  /** Date de fin du projet */
  dateFin?: InputMaybe<Scalars['Date']['input']>;
  /** Description du projet */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Activer ou desactiver le projet */
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  /** Nom du projet */
  nom?: InputMaybe<Scalars['String']['input']>;
};

/** Modification d'un utilisateur */
export type UpdateUserInput = {
  /** Adresse email */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Identifiant de l'equipe */
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  /** Activer ou desactiver le compte */
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  /** Matricule interne */
  matricule?: InputMaybe<Scalars['String']['input']>;
  /** Nom de famille */
  nom?: InputMaybe<Scalars['String']['input']>;
  /** Nouveau mot de passe (8 caracteres minimum) */
  password?: InputMaybe<Scalars['String']['input']>;
  /** Prenom */
  prenom?: InputMaybe<Scalars['String']['input']>;
  /** Role dans le systeme */
  role?: InputMaybe<UserRole>;
};

/** Utilisateur du systeme */
export type User = {
  __typename?: 'User';
  /** Absences de l'utilisateur */
  absences: Array<Absence>;
  /** Date de creation du compte */
  createdAt: Scalars['DateTime']['output'];
  /** Adresse email */
  email: Scalars['String']['output'];
  /** Equipe de l'utilisateur */
  equipe?: Maybe<Team>;
  /** Indique si le compte est actif */
  estActif: Scalars['Boolean']['output'];
  /** Identifiant unique */
  id: Scalars['ID']['output'];
  /** Matricule interne (optionnel) */
  matricule?: Maybe<Scalars['String']['output']>;
  /** Nom de famille */
  nom: Scalars['String']['output'];
  /** Nom complet (prenom + nom) */
  nomComplet: Scalars['String']['output'];
  /** Notifications de l'utilisateur */
  notifications: Array<Notification>;
  /** Prenom */
  prenom: Scalars['String']['output'];
  /** Projets auxquels l'utilisateur est affecte */
  projets: Array<Project>;
  /** Projets que l'utilisateur modere */
  projetsModeres: Array<Project>;
  /** Role dans le systeme */
  role: UserRole;
  /** Saisies de l'utilisateur */
  saisies: Array<TimeEntry>;
  /** Date de derniere modification */
  updatedAt: Scalars['DateTime']['output'];
};


/** Utilisateur du systeme */
export type UserabsencesArgs = {
  dateDebut?: InputMaybe<Scalars['Date']['input']>;
  dateFin?: InputMaybe<Scalars['Date']['input']>;
};


/** Utilisateur du systeme */
export type UsernotificationsArgs = {
  nonLuSeulement?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Utilisateur du systeme */
export type UsersaisiesArgs = {
  dateDebut?: InputMaybe<Scalars['Date']['input']>;
  dateFin?: InputMaybe<Scalars['Date']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
};

/** A paginated list of User items. */
export type UserPaginator = {
  __typename?: 'UserPaginator';
  /** A list of User items. */
  data: Array<User>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

/** Role d'un utilisateur dans le systeme */
export type UserRole =
  /** Administrateur (configuration globale du systeme) */
  | 'ADMIN'
  /** Moderateur (gestion des equipes et projets assignes) */
  | 'MODERATEUR'
  /** Utilisateur standard (saisie personnelle uniquement) */
  | 'UTILISATEUR';

/** Statistiques par utilisateur */
export type UserStat = {
  __typename?: 'UserStat';
  /** Taux de completion par rapport aux jours ouvres (%) */
  tauxCompletion: Scalars['Float']['output'];
  /** Temps total en ETP */
  tempsTotal: Scalars['Float']['output'];
  /** Utilisateur concerne */
  utilisateur: User;
};

export type ActivityFieldsFragment = { __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean };

export type ActivityTreeFieldsFragment = { __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ __typename?: 'Activity', id: string, nom: string, code?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ __typename?: 'Activity', id: string, nom: string, code?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean }> }> }> };

export type ArbreActivitesQueryVariables = Exact<{ [key: string]: never; }>;


export type ArbreActivitesQuery = { __typename?: 'Query', arbreActivites: Array<{ __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ __typename?: 'Activity', id: string, nom: string, code?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean, enfants: Array<{ __typename?: 'Activity', id: string, nom: string, code?: string | null, chemin: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean }> }> }> }> };

export type CreateActivityMutationVariables = Exact<{
  input: CreateActivityInput;
}>;


export type CreateActivityMutation = { __typename?: 'Mutation', createActivity: { __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean } };

export type UpdateActivityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateActivityInput;
}>;


export type UpdateActivityMutation = { __typename?: 'Mutation', updateActivity: { __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean } };

export type DeleteActivityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteActivityMutation = { __typename?: 'Mutation', deleteActivity: boolean };

export type MoveActivityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  parentId?: InputMaybe<Scalars['ID']['input']>;
  ordre: Scalars['Int']['input'];
}>;


export type MoveActivityMutation = { __typename?: 'Mutation', moveActivity: { __typename?: 'Activity', id: string, nom: string, code?: string | null, description?: string | null, chemin: string, cheminComplet: string, niveau: number, ordre: number, estFeuille: boolean, estSysteme: boolean, estActif: boolean } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: string, nom: string, prenom: string, email: string, role: UserRole, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type DemanderReinitialisationMdpMutationVariables = Exact<{
  input: DemanderReinitialisationMdpInput;
}>;


export type DemanderReinitialisationMdpMutation = { __typename?: 'Mutation', demanderReinitialisationMdp: boolean };

export type ReinitialiserMdpMutationVariables = Exact<{
  input: ReinitialisationMdpInput;
}>;


export type ReinitialiserMdpMutation = { __typename?: 'Mutation', reinitialiserMdp: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, nom: string, prenom: string, email: string, role: UserRole, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } | null };

export type RequestExportMutationVariables = Exact<{
  input: ExportInput;
}>;


export type RequestExportMutation = { __typename?: 'Mutation', requestExport: { __typename?: 'ExportJob', id: string, statut: ExportStatus, filtres?: any | null, expireLe?: any | null, creeLe: any } };

export type MesExportsQueryVariables = Exact<{ [key: string]: never; }>;


export type MesExportsQuery = { __typename?: 'Query', mesExports: Array<{ __typename?: 'ExportJob', id: string, statut: ExportStatus, filtres?: any | null, expireLe?: any | null, creeLe: any }> };

export type DesactiverExportMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DesactiverExportMutation = { __typename?: 'Mutation', desactiverExport: { __typename?: 'ExportJob', id: string, statut: ExportStatus, filtres?: any | null, expireLe?: any | null, creeLe: any } };

export type SupprimerExportMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SupprimerExportMutation = { __typename?: 'Mutation', supprimerExport: boolean };

export type NotificationFieldsFragment = { __typename?: 'Notification', id: string, type: string, titre: string, message: string, donnees?: any | null, estLu: boolean, luLe?: any | null, createdAt: any };

export type MesNotificationsQueryVariables = Exact<{
  nonLuSeulement?: InputMaybe<Scalars['Boolean']['input']>;
  limite?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MesNotificationsQuery = { __typename?: 'Query', mesNotifications: Array<{ __typename?: 'Notification', id: string, type: string, titre: string, message: string, donnees?: any | null, estLu: boolean, luLe?: any | null, createdAt: any }> };

export type NombreNotificationsNonLuesQueryVariables = Exact<{ [key: string]: never; }>;


export type NombreNotificationsNonLuesQuery = { __typename?: 'Query', nombreNotificationsNonLues: number };

export type MarkNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: { __typename?: 'Notification', id: string, type: string, titre: string, message: string, donnees?: any | null, estLu: boolean, luLe?: any | null, createdAt: any } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: boolean };

export type DeleteNotificationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteNotificationMutation = { __typename?: 'Mutation', deleteNotification: boolean };

export type DeleteAllNotificationsMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAllNotificationsMutation = { __typename?: 'Mutation', deleteAllNotifications: boolean };

export type ResolveAbsenceConflictMutationVariables = Exact<{
  absenceId: Scalars['ID']['input'];
  resolution: ConflictResolution;
}>;


export type ResolveAbsenceConflictMutation = { __typename?: 'Mutation', resolveAbsenceConflict: boolean };

export type ProjectFieldsFragment = { __typename?: 'Project', id: string, nom: string, code: string, description?: string | null, dateDebut?: any | null, dateFin?: any | null, estActif: boolean, createdAt: any };

export type ProjectFullFieldsFragment = { __typename?: 'Project', id: string, nom: string, code: string, description?: string | null, dateDebut?: any | null, dateFin?: any | null, estActif: boolean, createdAt: any, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, activitesActives: Array<{ __typename?: 'Activity', id: string, nom: string, chemin: string }> };

export type ProjetsQueryVariables = Exact<{
  actif?: InputMaybe<Scalars['Boolean']['input']>;
  moderateurId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type ProjetsQuery = { __typename?: 'Query', projets: Array<{ __typename?: 'Project', id: string, nom: string, code: string, description?: string | null, dateDebut?: any | null, dateFin?: any | null, estActif: boolean, createdAt: any, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string }> }> };

export type ProjetQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProjetQuery = { __typename?: 'Query', projet?: { __typename?: 'Project', id: string, nom: string, code: string, description?: string | null, dateDebut?: any | null, dateFin?: any | null, estActif: boolean, createdAt: any, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, activitesActives: Array<{ __typename?: 'Activity', id: string, nom: string, chemin: string }> } | null };

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', id: string, nom: string, code: string, description?: string | null, dateDebut?: any | null, dateFin?: any | null, estActif: boolean, createdAt: any, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, activitesActives: Array<{ __typename?: 'Activity', id: string, nom: string, chemin: string }> } };

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', id: string, nom: string, code: string, description?: string | null, dateDebut?: any | null, dateFin?: any | null, estActif: boolean, createdAt: any, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, activitesActives: Array<{ __typename?: 'Activity', id: string, nom: string, chemin: string }> } };

export type DeleteProjectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', deleteProject: boolean };

export type SetProjectActivitiesMutationVariables = Exact<{
  projetId: Scalars['ID']['input'];
  activiteIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type SetProjectActivitiesMutation = { __typename?: 'Mutation', setProjectActivities: { __typename?: 'Project', id: string, nom: string, code: string, description?: string | null, dateDebut?: any | null, dateFin?: any | null, estActif: boolean, createdAt: any, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, utilisateurs: Array<{ __typename?: 'User', id: string, nomComplet: string, email: string }>, activitesActives: Array<{ __typename?: 'Activity', id: string, nom: string, chemin: string }> } };

export type AddProjectModeratorMutationVariables = Exact<{
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type AddProjectModeratorMutation = { __typename?: 'Mutation', addProjectModerator: { __typename?: 'Project', id: string, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string }> } };

export type RemoveProjectModeratorMutationVariables = Exact<{
  projetId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type RemoveProjectModeratorMutation = { __typename?: 'Mutation', removeProjectModerator: { __typename?: 'Project', id: string, moderateurs: Array<{ __typename?: 'User', id: string, nomComplet: string }> } };

export type SupprimerDonneesUtilisateurMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  confirmationNom: Scalars['String']['input'];
}>;


export type SupprimerDonneesUtilisateurMutation = { __typename?: 'Mutation', supprimerDonneesUtilisateur: { __typename?: 'ResultatSuppressionRgpd', saisiesSupprimees: number, absencesSupprimees: number, notificationsSupprimees: number, exportsSupprimees: number, logsAnonymises: number } };

export type PurgerToutesDonneesMutationVariables = Exact<{
  confirmationPhrase: Scalars['String']['input'];
}>;


export type PurgerToutesDonneesMutation = { __typename?: 'Mutation', purgerToutesDonnees: { __typename?: 'ResultatPurge', saisiesSupprimees: number, logsSupprimees: number, absencesSupprimees: number, notificationsSupprimees: number, exportsSupprimees: number } };

export type SaisieFieldsFragment = { __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } };

export type ProjetFieldsFragment = { __typename?: 'Project', id: string, nom: string, code: string, estActif: boolean };

export type ActiviteFieldsFragment = { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string, estFeuille: boolean, estActif: boolean };

export type MesSaisiesSemaineQueryVariables = Exact<{
  semaine: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MesSaisiesSemaineQuery = { __typename?: 'Query', mesSaisiesSemaine: Array<{ __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } }> };

export type UtilisateursModerablesQueryVariables = Exact<{ [key: string]: never; }>;


export type UtilisateursModerablesQuery = { __typename?: 'Query', utilisateursModerables: Array<{ __typename?: 'User', id: string, nom: string, prenom: string, nomComplet: string }> };

export type ProjetsActifsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProjetsActifsQuery = { __typename?: 'Query', projets: Array<{ __typename?: 'Project', id: string, nom: string, code: string, estActif: boolean }> };

export type ActivitesDisponiblesQueryVariables = Exact<{
  projetId: Scalars['ID']['input'];
}>;


export type ActivitesDisponiblesQuery = { __typename?: 'Query', activitesDisponibles: Array<{ __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string, estFeuille: boolean, estActif: boolean }> };

export type AbsencesSemaineQueryVariables = Exact<{
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type AbsencesSemaineQuery = { __typename?: 'Query', absences: Array<{ __typename?: 'Absence', id: string, type: string, typeLibelle: string, dateDebut: any, dateFin: any, dureeJournaliere: number }> };

export type SyncAbsencesMutationVariables = Exact<{
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SyncAbsencesMutation = { __typename?: 'Mutation', syncAbsences: { __typename?: 'SyncResult', importes: number, conflits: number, erreurs: Array<string> } };

export type HistoriqueSaisieQueryVariables = Exact<{
  semaineISO: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type HistoriqueSaisieQuery = { __typename?: 'Query', mesSaisiesSemaine: Array<{ __typename?: 'TimeEntry', id: string, date: any, duree: number, projet: { __typename?: 'Project', id: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string }, historique: Array<{ __typename?: 'TimeEntryLog', id: string, action: LogAction, ancienneDuree?: number | null, nouvelleDuree?: number | null, ancienCommentaire?: string | null, nouveauCommentaire?: string | null, createdAt: any, auteur: { __typename?: 'User', nomComplet: string } }> }> };

export type CreateTimeEntryMutationVariables = Exact<{
  input: TimeEntryInput;
}>;


export type CreateTimeEntryMutation = { __typename?: 'Mutation', createTimeEntry: { __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } } };

export type UpdateTimeEntryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: TimeEntryInput;
}>;


export type UpdateTimeEntryMutation = { __typename?: 'Mutation', updateTimeEntry: { __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } } };

export type DeleteTimeEntryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTimeEntryMutation = { __typename?: 'Mutation', deleteTimeEntry: boolean };

export type BulkCreateTimeEntriesMutationVariables = Exact<{
  inputs: Array<TimeEntryInput> | TimeEntryInput;
}>;


export type BulkCreateTimeEntriesMutation = { __typename?: 'Mutation', bulkCreateTimeEntries: Array<{ __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } }> };

export type BulkUpdateTimeEntriesMutationVariables = Exact<{
  entries: Array<BulkUpdateEntry> | BulkUpdateEntry;
}>;


export type BulkUpdateTimeEntriesMutation = { __typename?: 'Mutation', bulkUpdateTimeEntries: Array<{ __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } }> };

export type DeclarerAbsenceMutationVariables = Exact<{
  date: Scalars['Date']['input'];
  duree?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeclarerAbsenceMutation = { __typename?: 'Mutation', declarerAbsence: boolean };

export type ParametresQueryVariables = Exact<{ [key: string]: never; }>;


export type ParametresQuery = { __typename?: 'Query', parametres: Array<{ __typename?: 'Setting', id: string, cle: string, valeur: any, description?: string | null }> };

export type UpdateSettingsMutationVariables = Exact<{
  settings: Array<SettingInput> | SettingInput;
}>;


export type UpdateSettingsMutation = { __typename?: 'Mutation', updateSettings: Array<{ __typename?: 'Setting', id: string, cle: string, valeur: any, description?: string | null }> };

export type ResetSettingsMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetSettingsMutation = { __typename?: 'Mutation', resetSettings: Array<{ __typename?: 'Setting', id: string, cle: string, valeur: any, description?: string | null }> };

export type ParametreAbsenceModeQueryVariables = Exact<{ [key: string]: never; }>;


export type ParametreAbsenceModeQuery = { __typename?: 'Query', parametre?: { __typename?: 'Setting', id: string, valeur: any } | null };

export type TesterConnexionRhApiMutationVariables = Exact<{ [key: string]: never; }>;


export type TesterConnexionRhApiMutation = { __typename?: 'Mutation', testerConnexionRhApi?: string | null };

export type MesStatistiquesQueryVariables = Exact<{
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
}>;


export type MesStatistiquesQuery = { __typename?: 'Query', statistiques: { __typename?: 'Statistics', tempsTotal: number, parProjet: Array<{ __typename?: 'ProjectStat', tempsTotal: number, pourcentage: number, projet: { __typename?: 'Project', id: string, nom: string, code: string } }>, parActivite: Array<{ __typename?: 'ActivityStat', tempsTotal: number, pourcentage: number, activite: { __typename?: 'Activity', id: string, nom: string } }>, parJour: Array<{ __typename?: 'DayStat', date: any, tempsTotal: number, estComplet: boolean }> } };

export type StatsGlobalesQueryVariables = Exact<{
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  equipeId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type StatsGlobalesQuery = { __typename?: 'Query', statistiques: { __typename?: 'Statistics', tempsTotal: number, parProjet: Array<{ __typename?: 'ProjectStat', tempsTotal: number, pourcentage: number, projet: { __typename?: 'Project', id: string, nom: string, code: string } }>, parActivite: Array<{ __typename?: 'ActivityStat', tempsTotal: number, pourcentage: number, activite: { __typename?: 'Activity', id: string, nom: string } }>, parUtilisateur: Array<{ __typename?: 'UserStat', tempsTotal: number, tauxCompletion: number, utilisateur: { __typename?: 'User', id: string, nomComplet: string } }>, parJour: Array<{ __typename?: 'DayStat', date: any, tempsTotal: number, estComplet: boolean }> } };

export type StatsPeriodePrecedenteQueryVariables = Exact<{
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  equipeId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type StatsPeriodePrecedenteQuery = { __typename?: 'Query', statistiques: { __typename?: 'Statistics', tempsTotal: number, parUtilisateur: Array<{ __typename?: 'UserStat', tempsTotal: number, tauxCompletion: number, utilisateur: { __typename?: 'User', id: string, nomComplet: string } }> } };

export type StatsProjetQueryVariables = Exact<{
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  projetId: Scalars['ID']['input'];
}>;


export type StatsProjetQuery = { __typename?: 'Query', statistiques: { __typename?: 'Statistics', tempsTotal: number, parActivite: Array<{ __typename?: 'ActivityStat', tempsTotal: number, pourcentage: number, activite: { __typename?: 'Activity', id: string, nom: string } }>, parUtilisateur: Array<{ __typename?: 'UserStat', tempsTotal: number, tauxCompletion: number, utilisateur: { __typename?: 'User', id: string, nomComplet: string } }>, parJour: Array<{ __typename?: 'DayStat', date: any, tempsTotal: number, estComplet: boolean }> } };

export type AnomaliesQueryVariables = Exact<{
  projetId?: InputMaybe<Scalars['ID']['input']>;
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  types?: InputMaybe<Array<AnomalyType> | AnomalyType>;
}>;


export type AnomaliesQuery = { __typename?: 'Query', anomalies: Array<{ __typename?: 'Anomaly', id: string, type: AnomalyType, date?: any | null, semaine?: string | null, detail: string, utilisateur: { __typename?: 'User', id: string, nomComplet: string, email: string, equipe?: { __typename?: 'Team', id: string, nom: string } | null }, projet?: { __typename?: 'Project', id: string, nom: string, code: string } | null }> };

export type TeamFullFieldsFragment = { __typename?: 'Team', id: string, nom: string, code: string, description?: string | null, estActif: boolean, createdAt: any, membres: Array<{ __typename?: 'User', id: string, nomComplet: string }> };

export type EquipesFullQueryVariables = Exact<{
  actifSeulement?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type EquipesFullQuery = { __typename?: 'Query', equipes: Array<{ __typename?: 'Team', id: string, nom: string, code: string, description?: string | null, estActif: boolean, createdAt: any, membres: Array<{ __typename?: 'User', id: string, nomComplet: string }> }> };

export type EquipeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type EquipeQuery = { __typename?: 'Query', equipe?: { __typename?: 'Team', id: string, nom: string, code: string, description?: string | null, estActif: boolean, createdAt: any, membres: Array<{ __typename?: 'User', id: string, nomComplet: string }> } | null };

export type CreateTeamMutationVariables = Exact<{
  input: TeamInput;
}>;


export type CreateTeamMutation = { __typename?: 'Mutation', createTeam: { __typename?: 'Team', id: string, nom: string, code: string, description?: string | null, estActif: boolean, createdAt: any, membres: Array<{ __typename?: 'User', id: string, nomComplet: string }> } };

export type UpdateTeamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: TeamInput;
}>;


export type UpdateTeamMutation = { __typename?: 'Mutation', updateTeam: { __typename?: 'Team', id: string, nom: string, code: string, description?: string | null, estActif: boolean, createdAt: any, membres: Array<{ __typename?: 'User', id: string, nomComplet: string }> } };

export type DeleteTeamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTeamMutation = { __typename?: 'Mutation', deleteTeam: boolean };

export type UserFieldsFragment = { __typename?: 'User', id: string, matricule?: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: any, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null };

export type TeamFieldsFragment = { __typename?: 'Team', id: string, nom: string, code: string, estActif: boolean };

export type UsersQueryVariables = Exact<{
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
  actifSeulement?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserPaginator', data: Array<{ __typename?: 'User', id: string, matricule?: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: any, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null }>, paginatorInfo: { __typename?: 'PaginatorInfo', currentPage: number, lastPage: number, total: number, hasMorePages: boolean } } };

export type UserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, matricule?: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: any, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } | null };

export type EquipesQueryVariables = Exact<{
  actifSeulement?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type EquipesQuery = { __typename?: 'Query', equipes: Array<{ __typename?: 'Team', id: string, nom: string, code: string, estActif: boolean }> };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, matricule?: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: any, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, matricule?: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: any, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: boolean };

export type RestoreUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RestoreUserMutation = { __typename?: 'Mutation', restoreUser: { __typename?: 'User', id: string, matricule?: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: any, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } };

export type RestrictionsVisibiliteQueryVariables = Exact<{
  projetId: Scalars['ID']['input'];
}>;


export type RestrictionsVisibiliteQuery = { __typename?: 'Query', restrictionsVisibilite: Array<{ __typename?: 'ActivityVisibility', id: string, estVisible: boolean, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string }, utilisateur: { __typename?: 'User', id: string, nomComplet: string, email: string } }> };

export type HideActivityForUserMutationVariables = Exact<{
  projetId: Scalars['ID']['input'];
  activiteId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type HideActivityForUserMutation = { __typename?: 'Mutation', hideActivityForUser: boolean };

export type ShowActivityForUserMutationVariables = Exact<{
  projetId: Scalars['ID']['input'];
  activiteId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type ShowActivityForUserMutation = { __typename?: 'Mutation', showActivityForUser: boolean };

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