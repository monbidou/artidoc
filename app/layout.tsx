import type { Metadata } from 'next'
import { Syne, Manrope, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConditionalLayout from '@/components/ConditionalLayout'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['700', '800'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Nexartis — Logiciel devis facture artisan | 25€/mois tout inclus',
  description:
    'Créez vos devis et factures artisan en quelques minutes. Planning intelligent exclusif. Conforme Factur-X 2026. Essai gratuit 14 jours sans CB.',
  keywords:
    'logiciel devis artisan, logiciel facture artisan, logiciel artisan, application artisan',
  openGraph: {
    title: 'Nexartis — Logiciel devis facture artisan | 25€/mois tout inclus',
    description:
      'Créez vos devis et factures artisan en quelques minutes. Planning intelligent exclusif. Conforme Factur-X 2026.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Nexartis',
    url: 'https://nexartis.fr',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${syne.variable} ${manrope.variable} ${jakarta.variable}`}>
      <body className="font-manrope bg-white">
        <ConditionalLayout header={<Header />} footer={<Footer />}>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}
