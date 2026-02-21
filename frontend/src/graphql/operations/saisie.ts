import { gql } from '@apollo/client';

// Fragments reutilisables
export const SAISIE_FRAGMENT = gql`
  fragment SaisieFields on TimeEntry {
    id
    date
    duree
    commentaire
    projet {
      id
      nom
      code
    }
    activite {
      id
      nom
      chemin
      cheminComplet
    }
  }
`;

export const PROJET_FRAGMENT = gql`
  fragment ProjetFields on Project {
    id
    nom
    code
    estActif
  }
`;

export const ACTIVITE_FRAGMENT = gql`
  fragment ActiviteFields on Activity {
    id
    nom
    chemin
    cheminComplet
    estFeuille
    estActif
  }
`;

// Queries

export const MES_SAISIES_SEMAINE = gql`
  ${SAISIE_FRAGMENT}
  query MesSaisiesSemaine($semaine: String!, $userId: ID) {
    mesSaisiesSemaine(semaine: $semaine, userId: $userId) {
      ...SaisieFields
    }
  }
`;

export const UTILISATEURS_MODERABLES = gql`
  query UtilisateursModerables {
    utilisateursModerables {
      id
      nom
      prenom
      nomComplet
    }
  }
`;

export const PROJETS_ACTIFS = gql`
  ${PROJET_FRAGMENT}
  query ProjetsActifs {
    projets(actif: true) {
      ...ProjetFields
    }
  }
`;

export const ACTIVITES_DISPONIBLES = gql`
  ${ACTIVITE_FRAGMENT}
  query ActivitesDisponibles($projetId: ID!) {
    activitesDisponibles(projetId: $projetId) {
      ...ActiviteFields
    }
  }
`;

// Absences de la semaine
export const ABSENCES_SEMAINE = gql`
  query AbsencesSemaine($dateDebut: Date!, $dateFin: Date!, $userId: ID) {
    absences(dateDebut: $dateDebut, dateFin: $dateFin, userId: $userId) {
      id
      type
      typeLibelle
      dateDebut
      dateFin
      dureeJournaliere
    }
  }
`;

// Mutation de synchronisation des absences depuis l'API RH
export const SYNC_ABSENCES = gql`
  mutation SyncAbsences($dateDebut: Date!, $dateFin: Date!, $userId: ID) {
    syncAbsences(dateDebut: $dateDebut, dateFin: $dateFin, userId: $userId) {
      importes
      conflits
      erreurs
    }
  }
`;

// Historique d'une saisie
export const HISTORIQUE_SAISIE = gql`
  query HistoriqueSaisie($semaineISO: String!, $userId: ID) {
    mesSaisiesSemaine(semaine: $semaineISO, userId: $userId) {
      id
      date
      duree
      projet {
        id
        code
      }
      activite {
        id
        nom
      }
      historique {
        id
        action
        ancienneDuree
        nouvelleDuree
        ancienCommentaire
        nouveauCommentaire
        createdAt
        auteur {
          nomComplet
        }
      }
    }
  }
`;

// Mutations

export const CREATE_TIME_ENTRY = gql`
  ${SAISIE_FRAGMENT}
  mutation CreateTimeEntry($input: TimeEntryInput!) {
    createTimeEntry(input: $input) {
      ...SaisieFields
    }
  }
`;

export const UPDATE_TIME_ENTRY = gql`
  ${SAISIE_FRAGMENT}
  mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {
    updateTimeEntry(id: $id, input: $input) {
      ...SaisieFields
    }
  }
`;

export const DELETE_TIME_ENTRY = gql`
  mutation DeleteTimeEntry($id: ID!) {
    deleteTimeEntry(id: $id)
  }
`;

export const BULK_CREATE_TIME_ENTRIES = gql`
  ${SAISIE_FRAGMENT}
  mutation BulkCreateTimeEntries($inputs: [TimeEntryInput!]!) {
    bulkCreateTimeEntries(inputs: $inputs) {
      ...SaisieFields
    }
  }
`;

export const BULK_UPDATE_TIME_ENTRIES = gql`
  ${SAISIE_FRAGMENT}
  mutation BulkUpdateTimeEntries($entries: [BulkUpdateEntry!]!) {
    bulkUpdateTimeEntries(entries: $entries) {
      ...SaisieFields
    }
  }
`;

export const DECLARER_ABSENCE = gql`
  mutation DeclarerAbsence($date: Date!, $duree: Float) {
    declarerAbsence(date: $date, duree: $duree)
  }
`;
