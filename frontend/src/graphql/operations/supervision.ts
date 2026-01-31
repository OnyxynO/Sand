import { gql } from '@apollo/client';

export const ANOMALIES_QUERY = gql`
  query Anomalies(
    $projetId: ID
    $equipeId: ID
    $userId: ID
    $dateDebut: Date!
    $dateFin: Date!
    $types: [AnomalyType!]
  ) {
    anomalies(
      projetId: $projetId
      equipeId: $equipeId
      userId: $userId
      dateDebut: $dateDebut
      dateFin: $dateFin
      types: $types
    ) {
      id
      type
      date
      semaine
      detail
      utilisateur {
        id
        nomComplet
        email
        equipe {
          id
          nom
        }
      }
      projet {
        id
        nom
        code
      }
    }
  }
`;
