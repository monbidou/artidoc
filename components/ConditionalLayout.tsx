'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const HIDDEN_ROUTES = ['/dashboard', '/onboarding', '/login', '/register', '/auth', '/signer', '/maintenance']

export default function ConditionalLayout({
  header,
  footer,
  children,
  forceHidden = false,
}: {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
  /**
   * Permet au layout racine de forcer le masquage du header/footer même
   * quand l'URL du navigateur ne correspond à aucune route cachée.
   * Utilisé notamment en mode maintenance : le middleware fait un rewrite
   * vers /maintenance mais l'URL côté client reste l'URL d'origine, donc
   * usePathname() ne voit pas /maintenance.
   */
  forceHidden?: boolean
}) {
  const pathname = usePathname()
  const isHidden =
    forceHidden || HIDDEN_ROUTES.some((route) => pathname.startsWith(route))

  return (
    <>
      {!isHidden && header}
      <main>{children}</main>
      {!isHidden && footer}
    </>
  )
}
