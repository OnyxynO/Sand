/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment ActivityFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    cheminComplet\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n  }\n": typeof types.ActivityFieldsFragmentDoc,
    "\n  fragment ActivityTreeFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n    enfants {\n      id\n      nom\n      code\n      description\n      chemin\n      niveau\n      ordre\n      estFeuille\n      estSysteme\n      estActif\n      enfants {\n        id\n        nom\n        code\n        chemin\n        niveau\n        ordre\n        estFeuille\n        estSysteme\n        estActif\n        enfants {\n          id\n          nom\n          code\n          chemin\n          niveau\n          ordre\n          estFeuille\n          estSysteme\n          estActif\n        }\n      }\n    }\n  }\n": typeof types.ActivityTreeFieldsFragmentDoc,
    "\n  \n  query ArbreActivites {\n    arbreActivites {\n      ...ActivityTreeFields\n    }\n  }\n": typeof types.ArbreActivitesDocument,
    "\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityFields\n    }\n  }\n": typeof types.CreateActivityDocument,
    "\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityFields\n    }\n  }\n": typeof types.UpdateActivityDocument,
    "\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n": typeof types.DeleteActivityDocument,
    "\n  \n  mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {\n    moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {\n      ...ActivityFields\n    }\n  }\n": typeof types.MoveActivityDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        nom\n        prenom\n        email\n        role\n        equipe {\n          id\n          nom\n          code\n        }\n      }\n      token\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      nom\n      prenom\n      email\n      role\n      equipe {\n        id\n        nom\n        code\n      }\n    }\n  }\n": typeof types.MeDocument,
    "\n  fragment ProjectFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n  }\n": typeof types.ProjectFieldsFragmentDoc,
    "\n  fragment ProjectFullFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n    moderateurs {\n      id\n      nomComplet\n      email\n    }\n    utilisateurs {\n      id\n      nomComplet\n      email\n    }\n    activitesActives {\n      id\n      nom\n      chemin\n    }\n  }\n": typeof types.ProjectFullFieldsFragmentDoc,
    "\n  \n  query Projets($actif: Boolean, $moderateurId: ID) {\n    projets(actif: $actif, moderateurId: $moderateurId) {\n      ...ProjectFields\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n": typeof types.ProjetsDocument,
    "\n  \n  query Projet($id: ID!) {\n    projet(id: $id) {\n      ...ProjectFullFields\n    }\n  }\n": typeof types.ProjetDocument,
    "\n  \n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      ...ProjectFullFields\n    }\n  }\n": typeof types.CreateProjectDocument,
    "\n  \n  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      ...ProjectFullFields\n    }\n  }\n": typeof types.UpdateProjectDocument,
    "\n  mutation DeleteProject($id: ID!) {\n    deleteProject(id: $id)\n  }\n": typeof types.DeleteProjectDocument,
    "\n  \n  mutation SetProjectActivities($projetId: ID!, $activiteIds: [ID!]!) {\n    setProjectActivities(projetId: $projetId, activiteIds: $activiteIds) {\n      ...ProjectFullFields\n    }\n  }\n": typeof types.SetProjectActivitiesDocument,
    "\n  mutation AddProjectModerator($projetId: ID!, $userId: ID!) {\n    addProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n": typeof types.AddProjectModeratorDocument,
    "\n  mutation RemoveProjectModerator($projetId: ID!, $userId: ID!) {\n    removeProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n": typeof types.RemoveProjectModeratorDocument,
    "\n  fragment SaisieFields on TimeEntry {\n    id\n    date\n    duree\n    commentaire\n    projet {\n      id\n      nom\n      code\n    }\n    activite {\n      id\n      nom\n      chemin\n      cheminComplet\n    }\n  }\n": typeof types.SaisieFieldsFragmentDoc,
    "\n  fragment ProjetFields on Project {\n    id\n    nom\n    code\n    estActif\n  }\n": typeof types.ProjetFieldsFragmentDoc,
    "\n  fragment ActiviteFields on Activity {\n    id\n    nom\n    chemin\n    cheminComplet\n    estFeuille\n    estActif\n  }\n": typeof types.ActiviteFieldsFragmentDoc,
    "\n  \n  query MesSaisiesSemaine($semaine: String!) {\n    mesSaisiesSemaine(semaine: $semaine) {\n      ...SaisieFields\n    }\n  }\n": typeof types.MesSaisiesSemaineDocument,
    "\n  \n  query ProjetsActifs {\n    projets(actif: true) {\n      ...ProjetFields\n    }\n  }\n": typeof types.ProjetsActifsDocument,
    "\n  \n  query ActivitesDisponibles($projetId: ID!) {\n    activitesDisponibles(projetId: $projetId) {\n      ...ActiviteFields\n    }\n  }\n": typeof types.ActivitesDisponiblesDocument,
    "\n  \n  mutation CreateTimeEntry($input: TimeEntryInput!) {\n    createTimeEntry(input: $input) {\n      ...SaisieFields\n    }\n  }\n": typeof types.CreateTimeEntryDocument,
    "\n  \n  mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {\n    updateTimeEntry(id: $id, input: $input) {\n      ...SaisieFields\n    }\n  }\n": typeof types.UpdateTimeEntryDocument,
    "\n  mutation DeleteTimeEntry($id: ID!) {\n    deleteTimeEntry(id: $id)\n  }\n": typeof types.DeleteTimeEntryDocument,
    "\n  \n  mutation BulkCreateTimeEntries($inputs: [TimeEntryInput!]!) {\n    bulkCreateTimeEntries(inputs: $inputs) {\n      ...SaisieFields\n    }\n  }\n": typeof types.BulkCreateTimeEntriesDocument,
    "\n  \n  mutation BulkUpdateTimeEntries($entries: [BulkUpdateEntry!]!) {\n    bulkUpdateTimeEntries(entries: $entries) {\n      ...SaisieFields\n    }\n  }\n": typeof types.BulkUpdateTimeEntriesDocument,
    "\n  fragment TeamFullFields on Team {\n    id\n    nom\n    code\n    description\n    estActif\n    createdAt\n    membres {\n      id\n      nomComplet\n    }\n  }\n": typeof types.TeamFullFieldsFragmentDoc,
    "\n  \n  query EquipesFull($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFullFields\n    }\n  }\n": typeof types.EquipesFullDocument,
    "\n  \n  query Equipe($id: ID!) {\n    equipe(id: $id) {\n      ...TeamFullFields\n    }\n  }\n": typeof types.EquipeDocument,
    "\n  \n  mutation CreateTeam($input: TeamInput!) {\n    createTeam(input: $input) {\n      ...TeamFullFields\n    }\n  }\n": typeof types.CreateTeamDocument,
    "\n  \n  mutation UpdateTeam($id: ID!, $input: TeamInput!) {\n    updateTeam(id: $id, input: $input) {\n      ...TeamFullFields\n    }\n  }\n": typeof types.UpdateTeamDocument,
    "\n  mutation DeleteTeam($id: ID!) {\n    deleteTeam(id: $id)\n  }\n": typeof types.DeleteTeamDocument,
    "\n  fragment UserFields on User {\n    id\n    matricule\n    nom\n    prenom\n    email\n    nomComplet\n    role\n    estActif\n    equipe {\n      id\n      nom\n      code\n    }\n    createdAt\n  }\n": typeof types.UserFieldsFragmentDoc,
    "\n  fragment TeamFields on Team {\n    id\n    nom\n    code\n    estActif\n  }\n": typeof types.TeamFieldsFragmentDoc,
    "\n  \n  query Users($equipeId: ID, $role: UserRole, $search: String, $actifSeulement: Boolean) {\n    users(equipeId: $equipeId, role: $role, search: $search, actifSeulement: $actifSeulement) {\n      data {\n        ...UserFields\n      }\n      paginatorInfo {\n        currentPage\n        lastPage\n        total\n      }\n    }\n  }\n": typeof types.UsersDocument,
    "\n  \n  query User($id: ID!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n": typeof types.UserDocument,
    "\n  \n  query Equipes($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFields\n    }\n  }\n": typeof types.EquipesDocument,
    "\n  \n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      ...UserFields\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  \n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      ...UserFields\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation DeleteUser($id: ID!) {\n    deleteUser(id: $id)\n  }\n": typeof types.DeleteUserDocument,
    "\n  \n  mutation RestoreUser($id: ID!) {\n    restoreUser(id: $id) {\n      ...UserFields\n    }\n  }\n": typeof types.RestoreUserDocument,
};
const documents: Documents = {
    "\n  fragment ActivityFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    cheminComplet\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n  }\n": types.ActivityFieldsFragmentDoc,
    "\n  fragment ActivityTreeFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n    enfants {\n      id\n      nom\n      code\n      description\n      chemin\n      niveau\n      ordre\n      estFeuille\n      estSysteme\n      estActif\n      enfants {\n        id\n        nom\n        code\n        chemin\n        niveau\n        ordre\n        estFeuille\n        estSysteme\n        estActif\n        enfants {\n          id\n          nom\n          code\n          chemin\n          niveau\n          ordre\n          estFeuille\n          estSysteme\n          estActif\n        }\n      }\n    }\n  }\n": types.ActivityTreeFieldsFragmentDoc,
    "\n  \n  query ArbreActivites {\n    arbreActivites {\n      ...ActivityTreeFields\n    }\n  }\n": types.ArbreActivitesDocument,
    "\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityFields\n    }\n  }\n": types.CreateActivityDocument,
    "\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityFields\n    }\n  }\n": types.UpdateActivityDocument,
    "\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n": types.DeleteActivityDocument,
    "\n  \n  mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {\n    moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {\n      ...ActivityFields\n    }\n  }\n": types.MoveActivityDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        nom\n        prenom\n        email\n        role\n        equipe {\n          id\n          nom\n          code\n        }\n      }\n      token\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      nom\n      prenom\n      email\n      role\n      equipe {\n        id\n        nom\n        code\n      }\n    }\n  }\n": types.MeDocument,
    "\n  fragment ProjectFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n  }\n": types.ProjectFieldsFragmentDoc,
    "\n  fragment ProjectFullFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n    moderateurs {\n      id\n      nomComplet\n      email\n    }\n    utilisateurs {\n      id\n      nomComplet\n      email\n    }\n    activitesActives {\n      id\n      nom\n      chemin\n    }\n  }\n": types.ProjectFullFieldsFragmentDoc,
    "\n  \n  query Projets($actif: Boolean, $moderateurId: ID) {\n    projets(actif: $actif, moderateurId: $moderateurId) {\n      ...ProjectFields\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n": types.ProjetsDocument,
    "\n  \n  query Projet($id: ID!) {\n    projet(id: $id) {\n      ...ProjectFullFields\n    }\n  }\n": types.ProjetDocument,
    "\n  \n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      ...ProjectFullFields\n    }\n  }\n": types.CreateProjectDocument,
    "\n  \n  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      ...ProjectFullFields\n    }\n  }\n": types.UpdateProjectDocument,
    "\n  mutation DeleteProject($id: ID!) {\n    deleteProject(id: $id)\n  }\n": types.DeleteProjectDocument,
    "\n  \n  mutation SetProjectActivities($projetId: ID!, $activiteIds: [ID!]!) {\n    setProjectActivities(projetId: $projetId, activiteIds: $activiteIds) {\n      ...ProjectFullFields\n    }\n  }\n": types.SetProjectActivitiesDocument,
    "\n  mutation AddProjectModerator($projetId: ID!, $userId: ID!) {\n    addProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n": types.AddProjectModeratorDocument,
    "\n  mutation RemoveProjectModerator($projetId: ID!, $userId: ID!) {\n    removeProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n": types.RemoveProjectModeratorDocument,
    "\n  fragment SaisieFields on TimeEntry {\n    id\n    date\n    duree\n    commentaire\n    projet {\n      id\n      nom\n      code\n    }\n    activite {\n      id\n      nom\n      chemin\n      cheminComplet\n    }\n  }\n": types.SaisieFieldsFragmentDoc,
    "\n  fragment ProjetFields on Project {\n    id\n    nom\n    code\n    estActif\n  }\n": types.ProjetFieldsFragmentDoc,
    "\n  fragment ActiviteFields on Activity {\n    id\n    nom\n    chemin\n    cheminComplet\n    estFeuille\n    estActif\n  }\n": types.ActiviteFieldsFragmentDoc,
    "\n  \n  query MesSaisiesSemaine($semaine: String!) {\n    mesSaisiesSemaine(semaine: $semaine) {\n      ...SaisieFields\n    }\n  }\n": types.MesSaisiesSemaineDocument,
    "\n  \n  query ProjetsActifs {\n    projets(actif: true) {\n      ...ProjetFields\n    }\n  }\n": types.ProjetsActifsDocument,
    "\n  \n  query ActivitesDisponibles($projetId: ID!) {\n    activitesDisponibles(projetId: $projetId) {\n      ...ActiviteFields\n    }\n  }\n": types.ActivitesDisponiblesDocument,
    "\n  \n  mutation CreateTimeEntry($input: TimeEntryInput!) {\n    createTimeEntry(input: $input) {\n      ...SaisieFields\n    }\n  }\n": types.CreateTimeEntryDocument,
    "\n  \n  mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {\n    updateTimeEntry(id: $id, input: $input) {\n      ...SaisieFields\n    }\n  }\n": types.UpdateTimeEntryDocument,
    "\n  mutation DeleteTimeEntry($id: ID!) {\n    deleteTimeEntry(id: $id)\n  }\n": types.DeleteTimeEntryDocument,
    "\n  \n  mutation BulkCreateTimeEntries($inputs: [TimeEntryInput!]!) {\n    bulkCreateTimeEntries(inputs: $inputs) {\n      ...SaisieFields\n    }\n  }\n": types.BulkCreateTimeEntriesDocument,
    "\n  \n  mutation BulkUpdateTimeEntries($entries: [BulkUpdateEntry!]!) {\n    bulkUpdateTimeEntries(entries: $entries) {\n      ...SaisieFields\n    }\n  }\n": types.BulkUpdateTimeEntriesDocument,
    "\n  fragment TeamFullFields on Team {\n    id\n    nom\n    code\n    description\n    estActif\n    createdAt\n    membres {\n      id\n      nomComplet\n    }\n  }\n": types.TeamFullFieldsFragmentDoc,
    "\n  \n  query EquipesFull($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFullFields\n    }\n  }\n": types.EquipesFullDocument,
    "\n  \n  query Equipe($id: ID!) {\n    equipe(id: $id) {\n      ...TeamFullFields\n    }\n  }\n": types.EquipeDocument,
    "\n  \n  mutation CreateTeam($input: TeamInput!) {\n    createTeam(input: $input) {\n      ...TeamFullFields\n    }\n  }\n": types.CreateTeamDocument,
    "\n  \n  mutation UpdateTeam($id: ID!, $input: TeamInput!) {\n    updateTeam(id: $id, input: $input) {\n      ...TeamFullFields\n    }\n  }\n": types.UpdateTeamDocument,
    "\n  mutation DeleteTeam($id: ID!) {\n    deleteTeam(id: $id)\n  }\n": types.DeleteTeamDocument,
    "\n  fragment UserFields on User {\n    id\n    matricule\n    nom\n    prenom\n    email\n    nomComplet\n    role\n    estActif\n    equipe {\n      id\n      nom\n      code\n    }\n    createdAt\n  }\n": types.UserFieldsFragmentDoc,
    "\n  fragment TeamFields on Team {\n    id\n    nom\n    code\n    estActif\n  }\n": types.TeamFieldsFragmentDoc,
    "\n  \n  query Users($equipeId: ID, $role: UserRole, $search: String, $actifSeulement: Boolean) {\n    users(equipeId: $equipeId, role: $role, search: $search, actifSeulement: $actifSeulement) {\n      data {\n        ...UserFields\n      }\n      paginatorInfo {\n        currentPage\n        lastPage\n        total\n      }\n    }\n  }\n": types.UsersDocument,
    "\n  \n  query User($id: ID!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n": types.UserDocument,
    "\n  \n  query Equipes($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFields\n    }\n  }\n": types.EquipesDocument,
    "\n  \n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      ...UserFields\n    }\n  }\n": types.CreateUserDocument,
    "\n  \n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      ...UserFields\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation DeleteUser($id: ID!) {\n    deleteUser(id: $id)\n  }\n": types.DeleteUserDocument,
    "\n  \n  mutation RestoreUser($id: ID!) {\n    restoreUser(id: $id) {\n      ...UserFields\n    }\n  }\n": types.RestoreUserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ActivityFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    cheminComplet\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n  }\n"): (typeof documents)["\n  fragment ActivityFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    cheminComplet\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ActivityTreeFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n    enfants {\n      id\n      nom\n      code\n      description\n      chemin\n      niveau\n      ordre\n      estFeuille\n      estSysteme\n      estActif\n      enfants {\n        id\n        nom\n        code\n        chemin\n        niveau\n        ordre\n        estFeuille\n        estSysteme\n        estActif\n        enfants {\n          id\n          nom\n          code\n          chemin\n          niveau\n          ordre\n          estFeuille\n          estSysteme\n          estActif\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment ActivityTreeFields on Activity {\n    id\n    nom\n    code\n    description\n    chemin\n    niveau\n    ordre\n    estFeuille\n    estSysteme\n    estActif\n    enfants {\n      id\n      nom\n      code\n      description\n      chemin\n      niveau\n      ordre\n      estFeuille\n      estSysteme\n      estActif\n      enfants {\n        id\n        nom\n        code\n        chemin\n        niveau\n        ordre\n        estFeuille\n        estSysteme\n        estActif\n        enfants {\n          id\n          nom\n          code\n          chemin\n          niveau\n          ordre\n          estFeuille\n          estSysteme\n          estActif\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query ArbreActivites {\n    arbreActivites {\n      ...ActivityTreeFields\n    }\n  }\n"): (typeof documents)["\n  \n  query ArbreActivites {\n    arbreActivites {\n      ...ActivityTreeFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {\n    moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {\n      ...ActivityFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {\n    moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {\n      ...ActivityFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        nom\n        prenom\n        email\n        role\n        equipe {\n          id\n          nom\n          code\n        }\n      }\n      token\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        nom\n        prenom\n        email\n        role\n        equipe {\n          id\n          nom\n          code\n        }\n      }\n      token\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      nom\n      prenom\n      email\n      role\n      equipe {\n        id\n        nom\n        code\n      }\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      nom\n      prenom\n      email\n      role\n      equipe {\n        id\n        nom\n        code\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProjectFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n  }\n"): (typeof documents)["\n  fragment ProjectFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProjectFullFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n    moderateurs {\n      id\n      nomComplet\n      email\n    }\n    utilisateurs {\n      id\n      nomComplet\n      email\n    }\n    activitesActives {\n      id\n      nom\n      chemin\n    }\n  }\n"): (typeof documents)["\n  fragment ProjectFullFields on Project {\n    id\n    nom\n    code\n    description\n    dateDebut\n    dateFin\n    estActif\n    createdAt\n    moderateurs {\n      id\n      nomComplet\n      email\n    }\n    utilisateurs {\n      id\n      nomComplet\n      email\n    }\n    activitesActives {\n      id\n      nom\n      chemin\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query Projets($actif: Boolean, $moderateurId: ID) {\n    projets(actif: $actif, moderateurId: $moderateurId) {\n      ...ProjectFields\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query Projets($actif: Boolean, $moderateurId: ID) {\n    projets(actif: $actif, moderateurId: $moderateurId) {\n      ...ProjectFields\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query Projet($id: ID!) {\n    projet(id: $id) {\n      ...ProjectFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  query Projet($id: ID!) {\n    projet(id: $id) {\n      ...ProjectFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      ...ProjectFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      ...ProjectFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      ...ProjectFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {\n    updateProject(id: $id, input: $input) {\n      ...ProjectFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteProject($id: ID!) {\n    deleteProject(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteProject($id: ID!) {\n    deleteProject(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation SetProjectActivities($projetId: ID!, $activiteIds: [ID!]!) {\n    setProjectActivities(projetId: $projetId, activiteIds: $activiteIds) {\n      ...ProjectFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation SetProjectActivities($projetId: ID!, $activiteIds: [ID!]!) {\n    setProjectActivities(projetId: $projetId, activiteIds: $activiteIds) {\n      ...ProjectFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddProjectModerator($projetId: ID!, $userId: ID!) {\n    addProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddProjectModerator($projetId: ID!, $userId: ID!) {\n    addProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveProjectModerator($projetId: ID!, $userId: ID!) {\n    removeProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveProjectModerator($projetId: ID!, $userId: ID!) {\n    removeProjectModerator(projetId: $projetId, userId: $userId) {\n      id\n      moderateurs {\n        id\n        nomComplet\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SaisieFields on TimeEntry {\n    id\n    date\n    duree\n    commentaire\n    projet {\n      id\n      nom\n      code\n    }\n    activite {\n      id\n      nom\n      chemin\n      cheminComplet\n    }\n  }\n"): (typeof documents)["\n  fragment SaisieFields on TimeEntry {\n    id\n    date\n    duree\n    commentaire\n    projet {\n      id\n      nom\n      code\n    }\n    activite {\n      id\n      nom\n      chemin\n      cheminComplet\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProjetFields on Project {\n    id\n    nom\n    code\n    estActif\n  }\n"): (typeof documents)["\n  fragment ProjetFields on Project {\n    id\n    nom\n    code\n    estActif\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ActiviteFields on Activity {\n    id\n    nom\n    chemin\n    cheminComplet\n    estFeuille\n    estActif\n  }\n"): (typeof documents)["\n  fragment ActiviteFields on Activity {\n    id\n    nom\n    chemin\n    cheminComplet\n    estFeuille\n    estActif\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query MesSaisiesSemaine($semaine: String!) {\n    mesSaisiesSemaine(semaine: $semaine) {\n      ...SaisieFields\n    }\n  }\n"): (typeof documents)["\n  \n  query MesSaisiesSemaine($semaine: String!) {\n    mesSaisiesSemaine(semaine: $semaine) {\n      ...SaisieFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query ProjetsActifs {\n    projets(actif: true) {\n      ...ProjetFields\n    }\n  }\n"): (typeof documents)["\n  \n  query ProjetsActifs {\n    projets(actif: true) {\n      ...ProjetFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query ActivitesDisponibles($projetId: ID!) {\n    activitesDisponibles(projetId: $projetId) {\n      ...ActiviteFields\n    }\n  }\n"): (typeof documents)["\n  \n  query ActivitesDisponibles($projetId: ID!) {\n    activitesDisponibles(projetId: $projetId) {\n      ...ActiviteFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation CreateTimeEntry($input: TimeEntryInput!) {\n    createTimeEntry(input: $input) {\n      ...SaisieFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateTimeEntry($input: TimeEntryInput!) {\n    createTimeEntry(input: $input) {\n      ...SaisieFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {\n    updateTimeEntry(id: $id, input: $input) {\n      ...SaisieFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {\n    updateTimeEntry(id: $id, input: $input) {\n      ...SaisieFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTimeEntry($id: ID!) {\n    deleteTimeEntry(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteTimeEntry($id: ID!) {\n    deleteTimeEntry(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation BulkCreateTimeEntries($inputs: [TimeEntryInput!]!) {\n    bulkCreateTimeEntries(inputs: $inputs) {\n      ...SaisieFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation BulkCreateTimeEntries($inputs: [TimeEntryInput!]!) {\n    bulkCreateTimeEntries(inputs: $inputs) {\n      ...SaisieFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation BulkUpdateTimeEntries($entries: [BulkUpdateEntry!]!) {\n    bulkUpdateTimeEntries(entries: $entries) {\n      ...SaisieFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation BulkUpdateTimeEntries($entries: [BulkUpdateEntry!]!) {\n    bulkUpdateTimeEntries(entries: $entries) {\n      ...SaisieFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TeamFullFields on Team {\n    id\n    nom\n    code\n    description\n    estActif\n    createdAt\n    membres {\n      id\n      nomComplet\n    }\n  }\n"): (typeof documents)["\n  fragment TeamFullFields on Team {\n    id\n    nom\n    code\n    description\n    estActif\n    createdAt\n    membres {\n      id\n      nomComplet\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query EquipesFull($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  query EquipesFull($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query Equipe($id: ID!) {\n    equipe(id: $id) {\n      ...TeamFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  query Equipe($id: ID!) {\n    equipe(id: $id) {\n      ...TeamFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation CreateTeam($input: TeamInput!) {\n    createTeam(input: $input) {\n      ...TeamFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateTeam($input: TeamInput!) {\n    createTeam(input: $input) {\n      ...TeamFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation UpdateTeam($id: ID!, $input: TeamInput!) {\n    updateTeam(id: $id, input: $input) {\n      ...TeamFullFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateTeam($id: ID!, $input: TeamInput!) {\n    updateTeam(id: $id, input: $input) {\n      ...TeamFullFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTeam($id: ID!) {\n    deleteTeam(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteTeam($id: ID!) {\n    deleteTeam(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserFields on User {\n    id\n    matricule\n    nom\n    prenom\n    email\n    nomComplet\n    role\n    estActif\n    equipe {\n      id\n      nom\n      code\n    }\n    createdAt\n  }\n"): (typeof documents)["\n  fragment UserFields on User {\n    id\n    matricule\n    nom\n    prenom\n    email\n    nomComplet\n    role\n    estActif\n    equipe {\n      id\n      nom\n      code\n    }\n    createdAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TeamFields on Team {\n    id\n    nom\n    code\n    estActif\n  }\n"): (typeof documents)["\n  fragment TeamFields on Team {\n    id\n    nom\n    code\n    estActif\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query Users($equipeId: ID, $role: UserRole, $search: String, $actifSeulement: Boolean) {\n    users(equipeId: $equipeId, role: $role, search: $search, actifSeulement: $actifSeulement) {\n      data {\n        ...UserFields\n      }\n      paginatorInfo {\n        currentPage\n        lastPage\n        total\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query Users($equipeId: ID, $role: UserRole, $search: String, $actifSeulement: Boolean) {\n    users(equipeId: $equipeId, role: $role, search: $search, actifSeulement: $actifSeulement) {\n      data {\n        ...UserFields\n      }\n      paginatorInfo {\n        currentPage\n        lastPage\n        total\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query User($id: ID!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  \n  query User($id: ID!) {\n    user(id: $id) {\n      ...UserFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query Equipes($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFields\n    }\n  }\n"): (typeof documents)["\n  \n  query Equipes($actifSeulement: Boolean) {\n    equipes(actifSeulement: $actifSeulement) {\n      ...TeamFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      ...UserFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      ...UserFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteUser($id: ID!) {\n    deleteUser(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteUser($id: ID!) {\n    deleteUser(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation RestoreUser($id: ID!) {\n    restoreUser(id: $id) {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation RestoreUser($id: ID!) {\n    restoreUser(id: $id) {\n      ...UserFields\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;