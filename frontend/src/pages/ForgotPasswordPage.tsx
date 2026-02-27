import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useForgotPassword';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { demander, loading, erreur, succes } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim();
    if (!emailTrimmed) return;
    await demander(emailTrimmed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SAND</h1>
          <p className="text-gray-600">Saisie d'Activite Numerique Declarative</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Entrez votre adresse email et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </p>

          {succes ? (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg text-sm">
              <p className="font-medium mb-1">Email envoyé</p>
              <p>
                Si un compte existe pour cette adresse, vous recevrez un email
                avec les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  disabled={loading}
                />
              </div>

              <div aria-live="polite" aria-atomic="true">
                {erreur && (
                  <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    role="alert"
                  >
                    {erreur}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Envoi en cours…
                  </span>
                ) : (
                  'Envoyer le lien'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
