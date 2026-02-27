import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { DEMANDER_REINITIALISATION_MDP_MUTATION } from '../graphql/operations/auth';

interface UseForgotPasswordResult {
  demander: (email: string) => Promise<void>;
  loading: boolean;
  erreur: string;
  succes: boolean;
}

export function useForgotPassword(): UseForgotPasswordResult {
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);

  const [mutation, { loading }] = useMutation<
    { demanderReinitialisationMdp: boolean },
    { input: { email: string } }
  >(DEMANDER_REINITIALISATION_MDP_MUTATION);

  const demander = async (email: string): Promise<void> => {
    setErreur('');
    setSucces(false);
    try {
      await mutation({ variables: { input: { email } } });
      setSucces(true);
    } catch {
      setErreur('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return { demander, loading, erreur, succes };
}
