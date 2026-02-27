import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { REINITIALISER_MDP_MUTATION } from '../graphql/operations/auth';

interface ResetPasswordInput {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface UseResetPasswordResult {
  reinitialiser: (input: ResetPasswordInput) => Promise<void>;
  loading: boolean;
  erreur: string;
  succes: boolean;
}

export function useResetPassword(): UseResetPasswordResult {
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);

  const [mutation, { loading }] = useMutation<
    { reinitialiserMdp: boolean },
    { input: ResetPasswordInput }
  >(REINITIALISER_MDP_MUTATION);

  const reinitialiser = async (input: ResetPasswordInput): Promise<void> => {
    setErreur('');
    setSucces(false);
    try {
      await mutation({ variables: { input } });
      setSucces(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue.';
      setErreur(message);
    }
  };

  return { reinitialiser, loading, erreur, succes };
}
