import { gql } from '@apollo/client';

export const REQUEST_EXPORT = gql`
  mutation RequestExport($input: ExportInput!) {
    requestExport(input: $input) {
      id
      statut
      filtres
      expireLe
      creeLe
    }
  }
`;

export const MES_EXPORTS = gql`
  query MesExports {
    mesExports {
      id
      statut
      filtres
      expireLe
      creeLe
    }
  }
`;

export const DESACTIVER_EXPORT = gql`
  mutation DesactiverExport($id: ID!) {
    desactiverExport(id: $id) {
      id
      statut
      filtres
      expireLe
      creeLe
    }
  }
`;

export const SUPPRIMER_EXPORT = gql`
  mutation SupprimerExport($id: ID!) {
    supprimerExport(id: $id)
  }
`;
