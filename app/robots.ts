import type { MetadataRoute } from 'next'

/**
 * robots.txt dynamique pour nexartis.fr
 * Indique aux moteurs de recherche quelles pages indexer et lesquelles ignorer.
 * Accessible à : https://nexartis.fr/robots.txt
 *
 * Mode maintenance : si MAINTENANCE_MODE=true, on bloque tout crawl pour éviter
 * que Google n'indexe la page de maintenance. Combiné au code HTTP 503 retourné
 * par le middleware, c'est la procédure recommandée par Google pour une
 * maintenance temporaire sans impact SEO.
 */
export default function robots(): MetadataRoute.Robots {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (maintenanceMode) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      // Pas de sitemap pendant la maintenance
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',    // Espace privé des utilisateurs
          '/api/',          // Routes API
          '/login',         // Pages d'auth
          '/register',
          '/auth/',
          '/onboarding',
          '/reset-password',
          '/forgot-password',
          '/subscription-expired',
          '/signer/',       // Pages de signature (privées par token)
          '/maintenance',   // Page de maintenance (ne pas indexer)
          '/_next/',        // Assets internes Next.js
        ],
      },
    ],
    sitemap: 'https://nexartis.fr/sitemap.xml',
  }
}
