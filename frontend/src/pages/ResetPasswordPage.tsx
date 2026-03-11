import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  KeyIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useResetPassword } from '../hooks/useResetPassword';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [erreurLocale, setErreurLocale] = useState('');

  const { reinitialiser, loading, erreur, succes } = useResetPassword();

  // Lien invalide : token ou email manquant
  if (!token || !email) {
    return (
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(238,154,104,0.18),_transparent_32%),linear-gradient(145deg,_#f6f2ea_0%,_#edf3ee_55%,_#f6efe7_100%)] px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
          <div className="sand-card w-full max-w-md rounded-[2rem] p-8 text-center md:p-10">
            <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <KeyIcon className="h-7 w-7" />
            </div>
            <h1 className="font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">Lien invalide</h1>
            <p className="mb-5 mt-3 text-red-600">
              Ce lien de réinitialisation est invalide ou incomplet.
            </p>
            <Link
              to="/mot-de-passe-oublie"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--sand-accent)] transition hover:text-[color:var(--sand-accent-strong)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Faire une nouvelle demande
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurLocale('');

    if (password !== passwordConfirmation) {
      setErreurLocale('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setErreurLocale('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password.length > 80) {
      setErreurLocale('Le mot de passe ne peut pas dépasser 80 caractères.');
      return;
    }

    await reinitialiser({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(238,154,104,0.18),_transparent_32%),linear-gradient(145deg,_#f6f2ea_0%,_#edf3ee_55%,_#f6efe7_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
        <section className="hidden rounded-[2rem] border border-white/70 bg-white/55 p-10 shadow-[0_32px_80px_-48px_rgba(52,78,65,0.65)] backdrop-blur lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-[color:var(--sand-line)] bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">
            <SparklesIcon className="h-4 w-4 text-[color:var(--sand-accent)]" />
            Mot de passe
          </div>
          <h1 className="mt-6 max-w-md font-['Fraunces',serif] text-5xl leading-tight text-[color:var(--sand-ink)]">
            Repartir sur une base propre, sans bruit.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-[color:var(--sand-muted)]">
            La v2 conserve un flux simple et frontal: nouveau secret, validation claire, retour rapide vers la session.
          </p>
          <div className="mt-8 grid gap-4">
            <div className="sand-card flex items-start gap-3">
              <CheckBadgeIcon className="mt-1 h-5 w-5 text-[color:var(--sand-accent)]" />
              <div>
                <p className="font-semibold text-[color:var(--sand-ink)]">Validation immédiate</p>
                <p className="text-sm text-[color:var(--sand-muted)]">Contrôle local des mots de passe et retour d’état explicite avant même l’aller-retour API.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="sand-card rounded-[2rem] p-8 md:p-10">
            <h2 className="mb-6 font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">
            Nouveau mot de passe
            </h2>

          {succes ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
                <p className="font-medium mb-1">Mot de passe modifié</p>
                <p>Votre mot de passe a été réinitialisé avec succès.</p>
              </div>
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--sand-ink)] px-6 py-3 font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)]"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-4 py-3 text-[color:var(--sand-ink)] shadow-sm outline-none transition focus-visible:border-[color:var(--sand-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--sand-accent)]/20"
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                  maxLength={80}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password_confirmation"
                  className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-4 py-3 text-[color:var(--sand-ink)] shadow-sm outline-none transition focus-visible:border-[color:var(--sand-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--sand-accent)]/20"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  maxLength={80}
                  disabled={loading}
                />
              </div>

              <div aria-live="polite" aria-atomic="true">
                {(erreurLocale || erreur) && (
                  <div
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                  >
                    {erreurLocale || erreur}
                  </div>
                )}
              </div>

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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Enregistrement…
                  </span>
                ) : (
                  'Enregistrer le mot de passe'
                )}
              </button>
            </form>
          )}

          {!succes && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--sand-accent)] transition hover:text-[color:var(--sand-accent-strong)]"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
