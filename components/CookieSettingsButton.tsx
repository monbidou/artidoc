'use client'

import { openCookieSettings } from './CookieConsent'

/**
 * Bouton "Gérer mes cookies" à placer dans le Footer.
 * Cliquer ouvre la modal de personnalisation du CookieConsent, permettant
 * à l'utilisateur de revenir sur ses choix à tout moment (exigence CNIL).
 */
export default function CookieSettingsButton({
  className = '',
  children = 'Gérer les cookies',
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => openCookieSettings()}
      className={
        className ||
        'block text-left text-[13px] text-white/55 py-1 transition-colors hover:text-[var(--orange)]'
      }
    >
      {children}
    </button>
  )
}
