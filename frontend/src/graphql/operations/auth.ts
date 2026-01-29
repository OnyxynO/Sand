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
      token
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
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
