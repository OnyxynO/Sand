import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        nom
        prenom
        email
        role
        equipe {
          id
          nom
          code
        }
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const DEMANDER_REINITIALISATION_MDP_MUTATION = gql`
  mutation DemanderReinitialisationMdp($input: DemanderReinitialisationMdpInput!) {
    demanderReinitialisationMdp(input: $input)
  }
`;

export const REINITIALISER_MDP_MUTATION = gql`
  mutation ReinitialiserMdp($input: ReinitialisationMdpInput!) {
    reinitialiserMdp(input: $input)
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      nom
      prenom
      email
      role
      equipe {
        id
        nom
        code
      }
    }
  }
`;
