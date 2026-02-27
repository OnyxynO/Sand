import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN_MUTATION } from '../graphql/operations/auth';
import { useAuthStore } from '../stores/authStore';
import type { AuthPayload, LoginInput } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const connecter = useAuthStore((state) => state.connecter);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');

  const [login, { loading }] = useMutation<
    { login: AuthPayload },
    { input: LoginInput }
  >(LOGIN_MUTATION, {
    onCompleted: (data) => {
      connecter(data.login.user);
      navigate('/');
    },
    onError: (error) => {
      // Extraire le message d'erreur
      const message = error.message || 'Une erreur est survenue';
      setErreur(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      setErreur('Veuillez remplir tous les champs');
      return;
    }

    await login({
      variables: {
        input: { email: emailTrimmed, password: passwordTrimmed },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SAND</h1>
          <p className="text-gray-600">Saisie d'Activite Numerique Declarative</p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                placeholder="nom@entreprise.com"
                autoComplete="email"
                spellCheck={false}
                disabled={loading}
              />
            </div>

            {/* Champ mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {/* Message d'erreur */}
            <div aria-live="polite" aria-atomic="true">
              {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                  {erreur}
                </div>
              )}
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin motion-reduce:animate-none -ml-1 mr-3 h-5 w-5 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connexion en cours…
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        {/* Comptes de test (dev only) */}
        {import.meta.env.DEV && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Comptes de test :
            </p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>
                <code className="bg-amber-100 px-1 rounded">admin@sand.local</code> / password (Admin)
              </li>
              <li>
                <code className="bg-amber-100 px-1 rounded">marie.dupont@sand.local</code> / password (Moderateur)
              </li>
              <li>
                <code className="bg-amber-100 px-1 rounded">jean.martin@sand.local</code> / password (Utilisateur)
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
