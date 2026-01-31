/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
  createdAt: Scalars['DateTime']['output'];
  dateDebut: Scalars['Date']['output'];
  dateFin: Scalars['Date']['output'];
  dureeJournaliere: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  importeLe?: Maybe<Scalars['DateTime']['output']>;
  /** Nombre de jours d'absence */
  nombreJours: Scalars['Int']['output'];
  referenceExterne?: Maybe<Scalars['String']['output']>;
  statut: Scalars['String']['output'];
  /** Total ETP de l'absence */
  totalEtp: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  typeLibelle: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Utilisateur concerne */
  utilisateur: User;
};

/** Donnees d'une absence */
export type AbsenceInput = {
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  dureeJournaliere?: InputMaybe<Scalars['Float']['input']>;
  type: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

/** Activite (arborescence) */
export type Activity = {
  __typename?: 'Activity';
  chemin: Scalars['String']['output'];
  /** Chemin complet avec noms */
  cheminComplet: Scalars['String']['output'];
  code?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  /** Activites enfants */
  enfants: Array<Activity>;
  estActif: Scalars['Boolean']['output'];
  estFeuille: Scalars['Boolean']['output'];
  estSysteme: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  niveau: Scalars['Int']['output'];
  nom: Scalars['String']['output'];
  ordre: Scalars['Int']['output'];
  /** Activite parente */
  parent?: Maybe<Activity>;
  /** Projets sur lesquels cette activite est activee */
  projets: Array<Project>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Statistiques par activite */
export type ActivityStat = {
  __typename?: 'ActivityStat';
  activite: Activity;
  pourcentage: Scalars['Float']['output'];
  tempsTotal: Scalars['Float']['output'];
};

/** Restriction de visibilite d'une activite pour un utilisateur */
export type ActivityVisibility = {
  __typename?: 'ActivityVisibility';
  activite: Activity;
  createdAt: Scalars['DateTime']['output'];
  estVisible: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  projet: Project;
  utilisateur: User;
};

/** Anomalie detectee */
export type Anomaly = {
  __typename?: 'Anomaly';
  date?: Maybe<Scalars['Date']['output']>;
  detail: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  projet?: Maybe<Project>;
  semaine?: Maybe<Scalars['String']['output']>;
  type: AnomalyType;
  utilisateur: User;
};

/** Type d'anomalie detectee */
export type AnomalyType =
  | 'CONFLIT_ABSENCE'
  | 'JOUR_DEPASSE'
  | 'JOUR_INCOMPLET'
  | 'SEMAINE_VIDE';

/** Payload d'authentification */
export type AuthPayload = {
  __typename?: 'AuthPayload';
  token?: Maybe<Scalars['String']['output']>;
  user: User;
};

/** Mise a jour en lot */
export type BulkUpdateEntry = {
  commentaire?: InputMaybe<Scalars['String']['input']>;
  duree: Scalars['Float']['input'];
  id: Scalars['ID']['input'];
};

/** Resolution d'un conflit d'absence */
export type ConflictResolution =
  | 'AJUSTER'
  | 'ECRASER'
  | 'IGNORER';

/** Creation d'une activite */
export type CreateActivityInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  nom: Scalars['String']['input'];
  ordre?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
};

/** Creation d'un projet */
export type CreateProjectInput = {
  activiteIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  code: Scalars['String']['input'];
  dateDebut?: InputMaybe<Scalars['Date']['input']>;
  dateFin?: InputMaybe<Scalars['Date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  moderateurIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  nom: Scalars['String']['input'];
};

/** Creation d'un utilisateur */
export type CreateUserInput = {
  email: Scalars['String']['input'];
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  matricule?: InputMaybe<Scalars['String']['input']>;
  nom: Scalars['String']['input'];
  password: Scalars['String']['input'];
  prenom: Scalars['String']['input'];
  role: UserRole;
};

/** Statistiques par jour */
export type DayStat = {
  __typename?: 'DayStat';
  date: Scalars['Date']['output'];
  estComplet: Scalars['Boolean']['output'];
  tempsTotal: Scalars['Float']['output'];
};

/** Format d'export */
export type ExportFormat =
  | 'CSV';

/** Parametres d'export */
export type ExportInput = {
  dateDebut: Scalars['Date']['input'];
  dateFin: Scalars['Date']['input'];
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  format: ExportFormat;
  projetId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

/** Job d'export */
export type ExportJob = {
  __typename?: 'ExportJob';
  expireLe?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  statut: ExportStatus;
  urlTelechargement?: Maybe<Scalars['String']['output']>;
};

/** Statut d'un job d'export */
export type ExportStatus =
  | 'ECHEC'
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'TERMINE';

/** Type d'action dans l'historique */
export type LogAction =
  | 'CREATION'
  | 'MODIFICATION'
  | 'SUPPRESSION';

/** Donnees de connexion */
export type LoginInput = {
  email: Scalars['String']['input'];
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
  /** Supprimer une absence */
  deleteAbsence: Scalars['Boolean']['output'];
  /** Supprimer une activite (Admin, soft delete) */
  deleteActivity: Scalars['Boolean']['output'];
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
  /** Deplacer une activite dans l'arborescence */
  moveActivity: Activity;
  /** Retirer un moderateur du projet */
  removeProjectModerator: Project;
  /** Retirer un utilisateur du projet */
  removeProjectUser: Project;
  /** Reordonner des activites */
  reorderActivities: Array<Activity>;
  /** Demander un export */
  requestExport: ExportJob;
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
  /** Synchroniser les absences depuis l'API RH */
  syncAbsences: SyncResult;
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
  createdAt: Scalars['DateTime']['output'];
  donnees?: Maybe<Scalars['JSON']['output']>;
  estLu: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  luLe?: Maybe<Scalars['DateTime']['output']>;
  message: Scalars['String']['output'];
  titre: Scalars['String']['output'];
  type: Scalars['String']['output'];
  /** Utilisateur destinataire */
  utilisateur: User;
};

/** Type de notification */
export type NotificationType =
  | 'ABSENCE_IMPORTEE'
  | 'CONFLIT_ABSENCE'
  | 'EXPORT_PRET'
  | 'SAISIE_INCOMPLETE'
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
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  dateDebut?: Maybe<Scalars['Date']['output']>;
  dateFin?: Maybe<Scalars['Date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  estActif: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  /** Moderateurs du projet */
  moderateurs: Array<User>;
  nom: Scalars['String']['output'];
  /** Saisies sur ce projet */
  saisies: Array<TimeEntry>;
  /** Temps total sur une periode */
  tempsTotal: Scalars['Float']['output'];
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
  pourcentage: Scalars['Float']['output'];
  projet: Project;
  tempsTotal: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Absences */
  absences: Array<Absence>;
  /** Une activite par ID */
  activite?: Maybe<Activity>;
  /** Activites disponibles pour un projet */
  activitesDisponibles: Array<Activity>;
  /** Anomalies detectees */
  anomalies: Array<Anomaly>;
  /** Arborescence complete des activites */
  arbreActivites: Array<Activity>;
  /** Une equipe par ID */
  equipe?: Maybe<Team>;
  /** Liste des equipes */
  equipes: Array<Team>;
  /** Utilisateur connecte */
  me?: Maybe<User>;
  /** Mes notifications */
  mesNotifications: Array<Notification>;
  /** Mes saisies de la semaine */
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
  /** Saisies de temps */
  saisies: Array<TimeEntry>;
  /** Statistiques */
  statistiques: Statistics;
  /** Un utilisateur par ID */
  user?: Maybe<User>;
  /** Liste des utilisateurs */
  users: UserPaginator;
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

/** Parametre systeme */
export type Setting = {
  __typename?: 'Setting';
  cle: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  valeur: Scalars['JSON']['output'];
};

/** Parametre systeme */
export type SettingInput = {
  cle: Scalars['String']['input'];
  valeur: Scalars['JSON']['input'];
};

/** Directions for ordering a list of records. */
export type SortOrder =
  /** Sort records in ascending order. */
  | 'ASC'
  /** Sort records in descending order. */
  | 'DESC';

/** Statistiques agregees */
export type Statistics = {
  __typename?: 'Statistics';
  parActivite: Array<ActivityStat>;
  parJour: Array<DayStat>;
  parProjet: Array<ProjectStat>;
  parUtilisateur: Array<UserStat>;
  tempsTotal: Scalars['Float']['output'];
};

/** Resultat d'une synchronisation d'absences */
export type SyncResult = {
  __typename?: 'SyncResult';
  conflits: Scalars['Int']['output'];
  erreurs: Array<Scalars['String']['output']>;
  importes: Scalars['Int']['output'];
};

/** Equipe ou service */
export type Team = {
  __typename?: 'Team';
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estActif: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  /** Membres de l'equipe */
  membres: Array<User>;
  nom: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Donnees d'une equipe */
export type TeamInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  nom: Scalars['String']['input'];
};

/** Saisie de temps */
export type TimeEntry = {
  __typename?: 'TimeEntry';
  /** Activite concernee */
  activite: Activity;
  commentaire?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['Date']['output'];
  duree: Scalars['Float']['output'];
  /** Historique des modifications */
  historique: Array<TimeEntryLog>;
  id: Scalars['ID']['output'];
  /** Projet concerne */
  projet: Project;
  updatedAt: Scalars['DateTime']['output'];
  /** Utilisateur qui a fait la saisie */
  utilisateur: User;
};

/** Donnees d'une saisie de temps */
export type TimeEntryInput = {
  activiteId: Scalars['ID']['input'];
  commentaire?: InputMaybe<Scalars['String']['input']>;
  date: Scalars['Date']['input'];
  duree: Scalars['Float']['input'];
  projetId: Scalars['ID']['input'];
};

/** Historique d'une saisie */
export type TimeEntryLog = {
  __typename?: 'TimeEntryLog';
  action: LogAction;
  ancienCommentaire?: Maybe<Scalars['String']['output']>;
  ancienneDuree?: Maybe<Scalars['Float']['output']>;
  /** Utilisateur ayant fait la modification */
  auteur: User;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  nouveauCommentaire?: Maybe<Scalars['String']['output']>;
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
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  nom?: InputMaybe<Scalars['String']['input']>;
  ordre?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
};

/** Modification d'un projet */
export type UpdateProjectInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  dateDebut?: InputMaybe<Scalars['Date']['input']>;
  dateFin?: InputMaybe<Scalars['Date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  nom?: InputMaybe<Scalars['String']['input']>;
};

/** Modification d'un utilisateur */
export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  equipeId?: InputMaybe<Scalars['ID']['input']>;
  estActif?: InputMaybe<Scalars['Boolean']['input']>;
  matricule?: InputMaybe<Scalars['String']['input']>;
  nom?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  prenom?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
};

/** Utilisateur du systeme */
export type User = {
  __typename?: 'User';
  /** Absences de l'utilisateur */
  absences: Array<Absence>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  /** Equipe de l'utilisateur */
  equipe?: Maybe<Team>;
  estActif: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  matricule?: Maybe<Scalars['String']['output']>;
  nom: Scalars['String']['output'];
  /** Nom complet (prenom + nom) */
  nomComplet: Scalars['String']['output'];
  /** Notifications de l'utilisateur */
  notifications: Array<Notification>;
  prenom: Scalars['String']['output'];
  /** Projets auxquels l'utilisateur est affecte */
  projets: Array<Project>;
  /** Projets que l'utilisateur modere */
  projetsModeres: Array<Project>;
  role: UserRole;
  /** Saisies de l'utilisateur */
  saisies: Array<TimeEntry>;
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
  | 'ADMIN'
  | 'MODERATEUR'
  | 'UTILISATEUR';

/** Statistiques par utilisateur */
export type UserStat = {
  __typename?: 'UserStat';
  tauxCompletion: Scalars['Float']['output'];
  tempsTotal: Scalars['Float']['output'];
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


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', token?: string | null, user: { __typename?: 'User', id: string, nom: string, prenom: string, email: string, role: UserRole, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, nom: string, prenom: string, email: string, role: UserRole, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null } | null };

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

export type SaisieFieldsFragment = { __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } };

export type ProjetFieldsFragment = { __typename?: 'Project', id: string, nom: string, code: string, estActif: boolean };

export type ActiviteFieldsFragment = { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string, estFeuille: boolean, estActif: boolean };

export type MesSaisiesSemaineQueryVariables = Exact<{
  semaine: Scalars['String']['input'];
}>;


export type MesSaisiesSemaineQuery = { __typename?: 'Query', mesSaisiesSemaine: Array<{ __typename?: 'TimeEntry', id: string, date: any, duree: number, commentaire?: string | null, projet: { __typename?: 'Project', id: string, nom: string, code: string }, activite: { __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string } }> };

export type ProjetsActifsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProjetsActifsQuery = { __typename?: 'Query', projets: Array<{ __typename?: 'Project', id: string, nom: string, code: string, estActif: boolean }> };

export type ActivitesDisponiblesQueryVariables = Exact<{
  projetId: Scalars['ID']['input'];
}>;


export type ActivitesDisponiblesQuery = { __typename?: 'Query', activitesDisponibles: Array<{ __typename?: 'Activity', id: string, nom: string, chemin: string, cheminComplet: string, estFeuille: boolean, estActif: boolean }> };

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
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserPaginator', data: Array<{ __typename?: 'User', id: string, matricule?: string | null, nom: string, prenom: string, email: string, nomComplet: string, role: UserRole, estActif: boolean, createdAt: any, equipe?: { __typename?: 'Team', id: string, nom: string, code: string } | null }>, paginatorInfo: { __typename?: 'PaginatorInfo', currentPage: number, lastPage: number, total: number } } };

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
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const MesNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MesNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonLuSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limite"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mesNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nonLuSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonLuSeulement"}}},{"kind":"Argument","name":{"kind":"Name","value":"limite"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limite"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"titre"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"donnees"}},{"kind":"Field","name":{"kind":"Name","value":"estLu"}},{"kind":"Field","name":{"kind":"Name","value":"luLe"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<MesNotificationsQuery, MesNotificationsQueryVariables>;
export const NombreNotificationsNonLuesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NombreNotificationsNonLues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nombreNotificationsNonLues"}}]}}]} as unknown as DocumentNode<NombreNotificationsNonLuesQuery, NombreNotificationsNonLuesQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"titre"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"donnees"}},{"kind":"Field","name":{"kind":"Name","value":"estLu"}},{"kind":"Field","name":{"kind":"Name","value":"luLe"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const ResolveAbsenceConflictDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResolveAbsenceConflict"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"absenceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resolution"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConflictResolution"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveAbsenceConflict"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"absenceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"absenceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"resolution"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resolution"}}}]}]}}]} as unknown as DocumentNode<ResolveAbsenceConflictMutation, ResolveAbsenceConflictMutationVariables>;
export const ProjetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Projets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actif"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moderateurId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actif"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actif"}}},{"kind":"Argument","name":{"kind":"Name","value":"moderateurId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moderateurId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFields"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjetsQuery, ProjetsQueryVariables>;
export const ProjetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Projet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<ProjetQuery, ProjetQueryVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const DeleteProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const SetProjectActivitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetProjectActivities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activiteIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setProjectActivities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"activiteIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activiteIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dateDebut"}},{"kind":"Field","name":{"kind":"Name","value":"dateFin"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activitesActives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}}]}}]} as unknown as DocumentNode<SetProjectActivitiesMutation, SetProjectActivitiesMutationVariables>;
export const AddProjectModeratorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddProjectModerator"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addProjectModerator"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]}}]} as unknown as DocumentNode<AddProjectModeratorMutation, AddProjectModeratorMutationVariables>;
export const RemoveProjectModeratorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveProjectModerator"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeProjectModerator"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"moderateurs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveProjectModeratorMutation, RemoveProjectModeratorMutationVariables>;
export const MesSaisiesSemaineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MesSaisiesSemaine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"semaine"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mesSaisiesSemaine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"semaine"},"value":{"kind":"Variable","name":{"kind":"Name","value":"semaine"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<MesSaisiesSemaineQuery, MesSaisiesSemaineQueryVariables>;
export const ProjetsActifsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjetsActifs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actif"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<ProjetsActifsQuery, ProjetsActifsQueryVariables>;
export const ActivitesDisponiblesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActivitesDisponibles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activitesDisponibles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActiviteFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActiviteFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}},{"kind":"Field","name":{"kind":"Name","value":"estFeuille"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<ActivitesDisponiblesQuery, ActivitesDisponiblesQueryVariables>;
export const CreateTimeEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTimeEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTimeEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<CreateTimeEntryMutation, CreateTimeEntryMutationVariables>;
export const UpdateTimeEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTimeEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTimeEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<UpdateTimeEntryMutation, UpdateTimeEntryMutationVariables>;
export const DeleteTimeEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTimeEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTimeEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTimeEntryMutation, DeleteTimeEntryMutationVariables>;
export const BulkCreateTimeEntriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BulkCreateTimeEntries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inputs"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntryInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkCreateTimeEntries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inputs"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inputs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<BulkCreateTimeEntriesMutation, BulkCreateTimeEntriesMutationVariables>;
export const BulkUpdateTimeEntriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BulkUpdateTimeEntries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entries"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkUpdateEntry"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkUpdateTimeEntries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entries"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entries"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SaisieFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SaisieFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"duree"}},{"kind":"Field","name":{"kind":"Name","value":"commentaire"}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}},{"kind":"Field","name":{"kind":"Name","value":"cheminComplet"}}]}}]}}]} as unknown as DocumentNode<BulkUpdateTimeEntriesMutation, BulkUpdateTimeEntriesMutationVariables>;
export const AnomaliesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Anomalies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"types"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AnomalyType"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"anomalies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"equipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateDebut"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateDebut"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFin"}}},{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"Variable","name":{"kind":"Name","value":"types"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"semaine"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"utilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"projet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AnomaliesQuery, AnomaliesQueryVariables>;
export const EquipesFullDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EquipesFull"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actifSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<EquipesFullQuery, EquipesFullQueryVariables>;
export const EquipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Equipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<EquipeQuery, EquipeQueryVariables>;
export const CreateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<CreateTeamMutation, CreateTeamMutationVariables>;
export const UpdateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFullFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFullFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"membres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}}]}}]}}]} as unknown as DocumentNode<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const DeleteTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTeamMutation, DeleteTeamMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"equipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"equipeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"actifSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const UserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"User"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const EquipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Equipes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actifSeulement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actifSeulement"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}}]}}]} as unknown as DocumentNode<EquipesQuery, EquipesQueryVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const RestoreUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matricule"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"prenom"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"estActif"}},{"kind":"Field","name":{"kind":"Name","value":"equipe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RestoreUserMutation, RestoreUserMutationVariables>;
export const RestrictionsVisibiliteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RestrictionsVisibilite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restrictionsVisibilite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estVisible"}},{"kind":"Field","name":{"kind":"Name","value":"activite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nom"}},{"kind":"Field","name":{"kind":"Name","value":"chemin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"utilisateur"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nomComplet"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<RestrictionsVisibiliteQuery, RestrictionsVisibiliteQueryVariables>;
export const HideActivityForUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"HideActivityForUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hideActivityForUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"activiteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<HideActivityForUserMutation, HideActivityForUserMutationVariables>;
export const ShowActivityForUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ShowActivityForUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"showActivityForUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"activiteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activiteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<ShowActivityForUserMutation, ShowActivityForUserMutationVariables>;