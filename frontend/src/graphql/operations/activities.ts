import { gql } from '@apollo/client';

// Fragments
export const ACTIVITY_FRAGMENT = gql`
  fragment ActivityFields on Activity {
    id
    nom
    code
    description
    chemin
    cheminComplet
    niveau
    ordre
    estFeuille
    estSysteme
    estActif
  }
`;

// Fragment recursif pour l'arbre
export const ACTIVITY_TREE_FRAGMENT = gql`
  fragment ActivityTreeFields on Activity {
    id
    nom
    code
    description
    chemin
    niveau
    ordre
    estFeuille
    estSysteme
    estActif
    enfants {
      id
      nom
      code
      description
      chemin
      niveau
      ordre
      estFeuille
      estSysteme
      estActif
      enfants {
        id
        nom
        code
        chemin
        niveau
        ordre
        estFeuille
        estSysteme
        estActif
        enfants {
          id
          nom
          code
          chemin
          niveau
          ordre
          estFeuille
          estSysteme
          estActif
        }
      }
    }
  }
`;

// Queries
export const ARBRE_ACTIVITES = gql`
  ${ACTIVITY_TREE_FRAGMENT}
  query ArbreActivites {
    arbreActivites {
      ...ActivityTreeFields
    }
  }
`;

// Mutations
export const CREATE_ACTIVITY = gql`
  ${ACTIVITY_FRAGMENT}
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      ...ActivityFields
    }
  }
`;

export const UPDATE_ACTIVITY = gql`
  ${ACTIVITY_FRAGMENT}
  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      ...ActivityFields
    }
  }
`;

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

export const MOVE_ACTIVITY = gql`
  ${ACTIVITY_FRAGMENT}
  mutation MoveActivity($id: ID!, $parentId: ID, $ordre: Int!) {
    moveActivity(id: $id, parentId: $parentId, ordre: $ordre) {
      ...ActivityFields
    }
  }
`;
