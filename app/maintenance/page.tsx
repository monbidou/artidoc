import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Maintenance en cours — Nexartis',
  description:
    'Nexartis est temporairement indisponible le temps que nous améliorions le service. Merci de votre patience.',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default function MaintenancePage() {
  const retourEstime =
    process.env.NEXT_PUBLIC_MAINTENANCE_RETURN ?? 'très prochainement'
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contact@nexartis.fr'

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-navy px-6 py-16 text-cream">
      {/* Décor de fond doux */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-2xl text-center">
        {/* Logo / Wordmark */}
        <div className="mb-12 inline-flex items-center justify-center">
          <span className="font-syne text-3xl font-bold tracking-tight text-cream">
            Nex<span className="text-orange">artis</span>
          </span>
        </div>

        {/* Pictogramme : engrenage minimaliste */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-orange/15 ring-1 ring-orange/30">
          <svg
            aria-hidden="true"
            className="h-9 w-9 animate-spin text-orange"
            style={{ animationDuration: '10s' }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="font-syne text-4xl font-bold leading-tight tracking-tight text-cream sm:text-5xl">
          Maintenance en cours
        </h1>

        {/* Sous-titre / explication */}
        <p className="mt-6 text-lg leading-relaxed text-cream/80 sm:text-xl">
          Nous améliorons Nexartis pour vous offrir un outil encore plus fiable
          et conforme. Le service sera de nouveau accessible{' '}
          <span className="font-semibold text-orange">{retourEstime}</span>.
        </p>

        <p className="mt-4 text-base leading-relaxed text-cream/60">
          Vos données sont en sécurité et resteront accessibles dès le retour
          du service. Merci de votre patience.
        </p>

        {/* Bouton de contact */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={`mailto:${contactEmail}?subject=Question%20pendant%20la%20maintenance`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-6 py-3 font-medium text-cream shadow-lg shadow-orange/20 transition hover:bg-orange-hover focus:outline-none focus:ring-2 focus:ring-orange/60 focus:ring-offset-2 focus:ring-offset-navy"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Nous contacter
          </Link>

          <a
            href="https://status.nexartis.fr"
            className="text-sm font-medium text-cream/70 underline-offset-4 hover:text-cream hover:underline"
          >
            Suivre l&apos;état du service
          </a>
        </div>
      </div>

      {/* Footer minimal */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Nexartis — Logiciel de devis et factures
        pour artisans
      </footer>
    </main>
  )
}
