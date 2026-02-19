import { gql } from '@apollo/client';

export const SUPPRIMER_DONNEES_UTILISATEUR = gql`
  mutation SupprimerDonneesUtilisateur($userId: ID!, $confirmationNom: String!) {
    supprimerDonneesUtilisateur(userId: $userId, confirmationNom: $confirmationNom) {
      saisiesSupprimees
      absencesSupprimees
      notificationsSupprimees
      exportsSupprimees
      logsAnonymises
    }
  }
`;

export const PURGER_TOUTES_DONNEES = gql`
  mutation PurgerToutesDonnees($confirmationPhrase: String!) {
    purgerToutesDonnees(confirmationPhrase: $confirmationPhrase) {
      saisiesSupprimees
      logsSupprimees
      absencesSupprimees
      notificationsSupprimees
      exportsSupprimees
    }
  }
`;
