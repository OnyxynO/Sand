import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { LOGIN_MUTATION } from '../../../graphql/operations/auth';
import { useAuthStore } from '../../../stores/authStore';
import type { AuthPayload, LoginInput } from '../../../types';

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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(238,154,104,0.22),_transparent_32%),linear-gradient(135deg,_#f7f4ef_0%,_#eef4ef_50%,_#f6efe6_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] border border-white/70 bg-white/55 p-8 shadow-[0_32px_80px_-48px_rgba(52,78,65,0.65)] backdrop-blur md:p-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-[color:var(--sand-line)] bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--sand-muted)]">
            <SparklesIcon className="h-4 w-4 text-[color:var(--sand-accent)]" />
            SAND v2
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--sand-muted)]">
              Saisie d'activite numerique declarative
            </p>
            <h1 className="max-w-xl font-['Fraunces',serif] text-5xl leading-tight text-[color:var(--sand-ink)] md:text-6xl">
              Un cockpit plus clair pour suivre l'activite, les ecarts et les arbitrages.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[color:var(--sand-muted)] md:text-lg">
              La v2 assume une interface plus editoriale: navigation plus lisible, cartes de synthese plus nettes, et parcours metier mieux identifies.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="sand-card space-y-2">
              <ShieldCheckIcon className="h-5 w-5 text-[color:var(--sand-accent)]" />
              <p className="text-sm font-semibold text-[color:var(--sand-ink)]">Session securisee</p>
              <p className="text-sm text-[color:var(--sand-muted)]">Sanctum, cookies HttpOnly et separation claire entre serveur et brouillon local.</p>
            </div>
            <div className="sand-card space-y-2">
              <SparklesIcon className="h-5 w-5 text-[color:var(--sand-accent-strong)]" />
              <p className="text-sm font-semibold text-[color:var(--sand-ink)]">Parcours refondus</p>
              <p className="text-sm text-[color:var(--sand-muted)]">Saisie, stats, export et administration passent par une structure feature plus propre.</p>
            </div>
            <div className="sand-card space-y-2">
              <ArrowRightIcon className="h-5 w-5 text-[color:var(--sand-accent)]" />
              <p className="text-sm font-semibold text-[color:var(--sand-ink)]">Prise en main rapide</p>
              <p className="text-sm text-[color:var(--sand-muted)]">Les memes comptes de test permettent de comparer v1 et v2 sans friction.</p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="sand-card space-y-6 rounded-[2rem] p-8 md:p-10">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">
                Connexion
              </p>
              <h2 className="font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">
                Reprendre la main sur la semaine.
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-4 py-3 text-[color:var(--sand-ink)] shadow-sm outline-none transition focus-visible:border-[color:var(--sand-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--sand-accent)]/20"
                placeholder="nom@entreprise.com"
                autoComplete="email"
                spellCheck={false}
                maxLength={80}
                disabled={loading}
              />
            </div>

            {/* Champ mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[color:var(--sand-muted)]"
                >
                  Mot de passe
                </label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs font-medium text-[color:var(--sand-accent)] transition hover:text-[color:var(--sand-accent-strong)]"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-4 py-3 text-[color:var(--sand-ink)] shadow-sm outline-none transition focus-visible:border-[color:var(--sand-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--sand-accent)]/20"
                placeholder="••••••••"
                autoComplete="current-password"
                maxLength={80}
                disabled={loading}
              />
            </div>

            {/* Message d'erreur */}
            <div aria-live="polite" aria-atomic="true">
              {erreur && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {erreur}
                </div>
              )}
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--sand-ink)] px-4 py-3 font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
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

          {import.meta.env.DEV && (
            <div className="mt-4 rounded-[1.6rem] border border-amber-200/80 bg-amber-50/90 p-4 text-amber-900 shadow-[0_18px_45px_-40px_rgba(161,98,7,0.8)]">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]">
                Comptes de test
              </p>
              <ul className="space-y-1 text-xs">
                <li>
                  <code className="rounded bg-amber-100 px-1.5 py-0.5">admin@sand.local</code> / password
                </li>
                <li>
                  <code className="rounded bg-amber-100 px-1.5 py-0.5">marie.dupont@sand.local</code> / password
                </li>
                <li>
                  <code className="rounded bg-amber-100 px-1.5 py-0.5">jean.martin@sand.local</code> / password
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
