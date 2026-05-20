import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware Nexartis.
 *
 * Étape 1 : si MAINTENANCE_MODE=true, on bloque tout le monde sauf :
 *   - les utilisateurs ayant le cookie de bypass (admin)
 *   - la page /maintenance elle-même
 *   - l'API /api/maintenance-bypass (pour se débloquer)
 *   - le webhook Stripe (Stripe rejouera de toute façon, mais on évite des
 *     soucis si la maintenance dure plus de quelques heures)
 *   - les assets statiques (déjà exclus par le matcher)
 *
 * Étape 2 : flow normal Supabase (auth, redirection, vérification abonnement).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Mode maintenance activé via variable d'environnement
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (maintenanceMode) {
    // Chemins autorisés pendant la maintenance
    const allowedPaths = [
      '/maintenance',
      '/api/maintenance-bypass',
      '/api/stripe/webhook', // Stripe doit pouvoir notifier les paiements
    ]
    const isAllowed = allowedPaths.some((p) => pathname.startsWith(p))

    // L'utilisateur a-t-il le cookie de bypass valide ?
    const hasBypass = request.cookies.get('nexartis_bypass')?.value === '1'

    // Si la requête n'est pas autorisée et que l'utilisateur n'a pas le bypass,
    // on rewrite vers /maintenance avec le code 503 (bon pour le SEO).
    if (!isAllowed && !hasBypass) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'

      // On ajoute un en-tête marqueur à la requête. Le layout racine pourra
      // le lire côté serveur (via headers() de next/headers) pour savoir qu'on
      // est en maintenance et masquer header/footer marketing en conséquence.
      // Indispensable parce qu'un rewrite garde l'URL d'origine côté client,
      // donc usePathname() ne peut pas détecter qu'on est sur /maintenance.
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-maintenance', '1')

      const response = NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
        status: 503,
      })
      // Indique aux moteurs de recherche et navigateurs de revenir dans 1 heure
      response.headers.set('Retry-After', '3600')
      // Empêche les CDN/proxies de cacher cette réponse
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      // Empêche tout moteur de recherche d'indexer la page maintenance
      // (en plus du <meta robots noindex> côté page)
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
      return response
    }
  }

  // Mode normal : on délègue au flow Supabase habituel
  return await updateSession(request)
}

export const config = {
  // On intercepte TOUT sauf :
  //   - les assets Next.js (/_next/static, /_next/image)
  //   - les fichiers statiques avec extension (favicon, images, polices, etc.)
  // Cela permet à la page /maintenance de bien afficher ses styles et polices.
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}
