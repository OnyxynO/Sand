import { gql } from '@apollo/client';

// Fragments
export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    matricule
    nom
    prenom
    email
    nomComplet
    role
    estActif
    equipe {
      id
      nom
      code
    }
    createdAt
  }
`;

export const TEAM_FRAGMENT = gql`
  fragment TeamFields on Team {
    id
    nom
    code
    estActif
  }
`;

// Queries
export const USERS_QUERY = gql`
  ${USER_FRAGMENT}
  query Users($equipeId: ID, $role: UserRole, $search: String, $actifSeulement: Boolean, $page: Int) {
    users(equipeId: $equipeId, role: $role, search: $search, actifSeulement: $actifSeulement, page: $page) {
      data {
        ...UserFields
      }
      paginatorInfo {
        currentPage
        lastPage
        total
        hasMorePages
      }
    }
  }
`;

export const USER_QUERY = gql`
  ${USER_FRAGMENT}
  query User($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`;

export const TEAMS_QUERY = gql`
  ${TEAM_FRAGMENT}
  query Equipes($actifSeulement: Boolean) {
    equipes(actifSeulement: $actifSeulement) {
      ...TeamFields
    }
  }
`;

// Mutations
export const CREATE_USER = gql`
  ${USER_FRAGMENT}
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserFields
    }
  }
`;

export const UPDATE_USER = gql`
  ${USER_FRAGMENT}
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFields
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const RESTORE_USER = gql`
  ${USER_FRAGMENT}
  mutation RestoreUser($id: ID!) {
    restoreUser(id: $id) {
      ...UserFields
    }
  }
`;
