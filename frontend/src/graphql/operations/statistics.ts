import { gql } from '@apollo/client';

export const MES_STATISTIQUES = gql`
  query MesStatistiques($dateDebut: Date!, $dateFin: Date!) {
    statistiques(dateDebut: $dateDebut, dateFin: $dateFin) {
      tempsTotal
      parProjet {
        projet {
          id
          nom
          code
        }
        tempsTotal
        pourcentage
      }
      parActivite {
        activite {
          id
          nom
        }
        tempsTotal
        pourcentage
      }
      parJour {
        date
        tempsTotal
        estComplet
      }
    }
  }
`;
