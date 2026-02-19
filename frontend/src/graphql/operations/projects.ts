import { gql } from '@apollo/client';

// Fragments
export const PROJECT_FRAGMENT = gql`
  fragment ProjectFields on Project {
    id
    nom
    code
    description
    dateDebut
    dateFin
    estActif
    createdAt
  }
`;

export const PROJECT_FULL_FRAGMENT = gql`
  fragment ProjectFullFields on Project {
    id
    nom
    code
    description
    dateDebut
    dateFin
    estActif
    createdAt
    moderateurs {
      id
      nomComplet
      email
    }
    utilisateurs {
      id
      nomComplet
      email
    }
    activitesActives {
      id
      nom
      chemin
    }
  }
`;

// Queries
export const PROJETS_QUERY = gql`
  ${PROJECT_FRAGMENT}
  query Projets($actif: Boolean, $moderateurId: ID) {
    projets(actif: $actif, moderateurId: $moderateurId) {
      ...ProjectFields
      moderateurs {
        id
        nomComplet
      }
    }
  }
`;

export const PROJET_QUERY = gql`
  ${PROJECT_FULL_FRAGMENT}
  query Projet($id: ID!) {
    projet(id: $id) {
      ...ProjectFullFields
    }
  }
`;

// Mutations
export const CREATE_PROJECT = gql`
  ${PROJECT_FULL_FRAGMENT}
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      ...ProjectFullFields
    }
  }
`;

export const UPDATE_PROJECT = gql`
  ${PROJECT_FULL_FRAGMENT}
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      ...ProjectFullFields
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const SET_PROJECT_ACTIVITIES = gql`
  ${PROJECT_FULL_FRAGMENT}
  mutation SetProjectActivities($projetId: ID!, $activiteIds: [ID!]!) {
    setProjectActivities(projetId: $projetId, activiteIds: $activiteIds) {
      ...ProjectFullFields
    }
  }
`;

export const ADD_PROJECT_MODERATOR = gql`
  mutation AddProjectModerator($projetId: ID!, $userId: ID!) {
    addProjectModerator(projetId: $projetId, userId: $userId) {
      id
      moderateurs {
        id
        nomComplet
      }
    }
  }
`;

export const REMOVE_PROJECT_MODERATOR = gql`
  mutation RemoveProjectModerator($projetId: ID!, $userId: ID!) {
    removeProjectModerator(projetId: $projetId, userId: $userId) {
      id
      moderateurs {
        id
        nomComplet
      }
    }
  }
`;
