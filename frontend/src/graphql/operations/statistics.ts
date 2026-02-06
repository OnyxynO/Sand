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

export const STATS_GLOBALES = gql`
  query StatsGlobales($dateDebut: Date!, $dateFin: Date!, $equipeId: ID) {
    statistiques(dateDebut: $dateDebut, dateFin: $dateFin, equipeId: $equipeId) {
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
      parUtilisateur {
        utilisateur {
          id
          nomComplet
        }
        tempsTotal
        tauxCompletion
      }
      parJour {
        date
        tempsTotal
        estComplet
      }
    }
  }
`;

export const STATS_PERIODE_PRECEDENTE = gql`
  query StatsPeriodePrecedente($dateDebut: Date!, $dateFin: Date!, $equipeId: ID) {
    statistiques(dateDebut: $dateDebut, dateFin: $dateFin, equipeId: $equipeId) {
      tempsTotal
      parUtilisateur {
        utilisateur {
          id
          nomComplet
        }
        tempsTotal
        tauxCompletion
      }
    }
  }
`;

export const STATS_PROJET = gql`
  query StatsProjet($dateDebut: Date!, $dateFin: Date!, $projetId: ID!) {
    statistiques(dateDebut: $dateDebut, dateFin: $dateFin, projetId: $projetId) {
      tempsTotal
      parActivite {
        activite {
          id
          nom
        }
        tempsTotal
        pourcentage
      }
      parUtilisateur {
        utilisateur {
          id
          nomComplet
        }
        tempsTotal
        tauxCompletion
      }
      parJour {
        date
        tempsTotal
        estComplet
      }
    }
  }
`;
