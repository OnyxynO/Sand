import { gql } from '@apollo/client';

// Fragments
export const TEAM_FULL_FRAGMENT = gql`
  fragment TeamFullFields on Team {
    id
    nom
    code
    description
    estActif
    createdAt
    membres {
      id
      nomComplet
    }
  }
`;

// Queries
export const TEAMS_FULL_QUERY = gql`
  ${TEAM_FULL_FRAGMENT}
  query EquipesFull($actifSeulement: Boolean) {
    equipes(actifSeulement: $actifSeulement) {
      ...TeamFullFields
    }
  }
`;

export const TEAM_QUERY = gql`
  ${TEAM_FULL_FRAGMENT}
  query Equipe($id: ID!) {
    equipe(id: $id) {
      ...TeamFullFields
    }
  }
`;

// Mutations
export const CREATE_TEAM = gql`
  ${TEAM_FULL_FRAGMENT}
  mutation CreateTeam($input: TeamInput!) {
    createTeam(input: $input) {
      ...TeamFullFields
    }
  }
`;

export const UPDATE_TEAM = gql`
  ${TEAM_FULL_FRAGMENT}
  mutation UpdateTeam($id: ID!, $input: TeamInput!) {
    updateTeam(id: $id, input: $input) {
      ...TeamFullFields
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id)
  }
`;
