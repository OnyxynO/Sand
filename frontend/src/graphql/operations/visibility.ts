import { gql } from '@apollo/client';

// Query pour recuperer les restrictions de visibilite d'un projet
export const RESTRICTIONS_VISIBILITE_QUERY = gql`
  query RestrictionsVisibilite($projetId: ID!) {
    restrictionsVisibilite(projetId: $projetId) {
      id
      estVisible
      activite {
        id
        nom
        chemin
      }
      utilisateur {
        id
        nomComplet
        email
      }
    }
  }
`;

// Mutation pour masquer une activite pour un utilisateur
export const HIDE_ACTIVITY_FOR_USER = gql`
  mutation HideActivityForUser($projetId: ID!, $activiteId: ID!, $userId: ID!) {
    hideActivityForUser(projetId: $projetId, activiteId: $activiteId, userId: $userId)
  }
`;

// Mutation pour rendre visible une activite pour un utilisateur
export const SHOW_ACTIVITY_FOR_USER = gql`
  mutation ShowActivityForUser($projetId: ID!, $activiteId: ID!, $userId: ID!) {
    showActivityForUser(projetId: $projetId, activiteId: $activiteId, userId: $userId)
  }
`;
