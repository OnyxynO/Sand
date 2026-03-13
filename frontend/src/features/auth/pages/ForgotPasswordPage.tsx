import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useForgotPassword } from '../../../hooks/useForgotPassword';

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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(238,154,104,0.18),_transparent_28%),linear-gradient(145deg,_#f6f2ea_0%,_#edf3ee_55%,_#f6efe7_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden rounded-[2rem] border border-white/70 bg-white/55 p-10 shadow-[0_32px_80px_-48px_rgba(52,78,65,0.65)] backdrop-blur lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-[color:var(--sand-line)] bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">
            <SparklesIcon className="h-4 w-4 text-[color:var(--sand-accent)]" />
            Recuperation
          </div>
          <h1 className="mt-6 max-w-md font-['Fraunces',serif] text-5xl leading-tight text-[color:var(--sand-ink)]">
            Revenir dans l'application sans detour.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-[color:var(--sand-muted)]">
            La v2 garde le flux simple: demande du lien, reception de l'email, retour direct sur un parcours propre et lisible.
          </p>
          <div className="mt-8 grid gap-4">
            <div className="sand-card flex items-start gap-3">
              <EnvelopeIcon className="mt-1 h-5 w-5 text-[color:var(--sand-accent)]" />
              <div>
                <p className="font-semibold text-[color:var(--sand-ink)]">Lien securise</p>
                <p className="text-sm text-[color:var(--sand-muted)]">Le token est envoye uniquement si un compte existe pour l'adresse fournie.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="sand-card rounded-[2rem] p-8 md:p-10">
            <h2 className="mb-2 font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">
            Mot de passe oublié
            </h2>
            <p className="mb-6 text-sm leading-6 text-[color:var(--sand-muted)]">
              Entrez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
            </p>

            {succes ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
                <p className="mb-1 font-medium">Email envoyé</p>
                <p>
                  Si un compte existe pour cette adresse, vous recevrez un email avec les instructions pour reinitialiser votre mot de passe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    maxLength={80}
                    disabled={loading}
                  />
                </div>

                <div aria-live="polite" aria-atomic="true">
                  {erreur && (
                    <div
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      role="alert"
                    >
                      {erreur}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
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
                className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--sand-accent)] transition hover:text-[color:var(--sand-accent-strong)]"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
