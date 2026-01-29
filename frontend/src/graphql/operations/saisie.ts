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
  query MesSaisiesSemaine($semaine: String!) {
    mesSaisiesSemaine(semaine: $semaine) {
      ...SaisieFields
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

// Mutations

export const CREATE_TIME_ENTRY = gql`
  ${SAISIE_FRAGMENT}
  mutation CreateTimeEntry(
    $projetId: ID!
    $activiteId: ID!
    $date: Date!
    $duree: Float!
    $commentaire: String
  ) {
    createTimeEntry(
      projetId: $projetId
      activiteId: $activiteId
      date: $date
      duree: $duree
      commentaire: $commentaire
    ) {
      ...SaisieFields
    }
  }
`;

export const UPDATE_TIME_ENTRY = gql`
  ${SAISIE_FRAGMENT}
  mutation UpdateTimeEntry(
    $id: ID!
    $projetId: ID!
    $activiteId: ID!
    $date: Date!
    $duree: Float!
    $commentaire: String
  ) {
    updateTimeEntry(
      id: $id
      projetId: $projetId
      activiteId: $activiteId
      date: $date
      duree: $duree
      commentaire: $commentaire
    ) {
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
