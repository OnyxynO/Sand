import { gql } from '@apollo/client';

export const PARAMETRES_QUERY = gql`
  query Parametres {
    parametres {
      id
      cle
      valeur
      description
    }
  }
`;

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($settings: [SettingInput!]!) {
    updateSettings(settings: $settings) {
      id
      cle
      valeur
      description
    }
  }
`;
