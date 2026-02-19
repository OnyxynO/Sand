import { gql } from '@apollo/client';

export const REQUEST_EXPORT = gql`
  mutation RequestExport($input: ExportInput!) {
    requestExport(input: $input) {
      id
      statut
      urlTelechargement
      expireLe
    }
  }
`;
