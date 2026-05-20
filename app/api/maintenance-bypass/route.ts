import { NextResponse, type NextRequest } from 'next/server'

/**
 * Route de bypass de la maintenance.
 *
 * Utilisation : aller sur https://nexartis.fr/api/maintenance-bypass?secret=XXX
 * où XXX est la valeur de la variable d'environnement MAINTENANCE_BYPASS_SECRET.
 *
 * Si le secret est correct, on pose un cookie `nexartis_bypass=1` valable 7 jours
 * qui permettra à l'utilisateur d'accéder normalement au site pendant que le mode
 * maintenance est actif pour tous les autres.
 *
 * Pour révoquer le bypass : appeler ?action=clear
 *
 * Sécurité :
 *  - comparaison à temps constant du secret (anti timing attack)
 *  - rate-limit en mémoire : max 5 tentatives invalides par IP par 10 minutes
 *  - log des tentatives invalides dans les logs Vercel
 */

// ─── Rate-limit en mémoire ───────────────────────────────────────────────────
// Volontairement simple : un Map IP → { tentatives, expireAt }.
// Limite : ne fonctionne que pour une seule instance serverless. Vercel scale
// horizontalement, donc un attaquant pourrait théoriquement contourner en
// tombant sur d'autres instances. C'est ACCEPTABLE ici parce que :
//   1. La probabilité de tomber sur la même instance n'est pas négligeable.
//   2. Le secret fait 256 bits → bruteforce inenvisageable même sans rate-limit.
//   3. Toute tentative invalide est loggée → on verra une attaque.
// Pour un rate-limit vraiment distribué, il faudrait Upstash Redis ou équivalent.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5
const rateLimitStore = new Map<string, { count: number; expireAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  // Pas d'entrée ou fenêtre expirée → reset
  if (!entry || entry.expireAt < now) {
    rateLimitStore.set(ip, { count: 0, expireAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS }
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - entry.count }
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || entry.expireAt < now) {
    rateLimitStore.set(ip, { count: 1, expireAt: now + RATE_LIMIT_WINDOW_MS })
  } else {
    entry.count += 1
  }
}

function getClientIp(request: NextRequest): string {
  // Vercel pose les bons en-têtes
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// ─── Handler GET ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret') ?? ''
  const action = searchParams.get('action') ?? 'grant'

  // Action de révocation : on supprime le cookie de bypass (pas de check secret)
  if (action === 'clear') {
    const response = NextResponse.json({ ok: true, message: 'Bypass révoqué.' })
    response.cookies.set('nexartis_bypass', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // supprime le cookie
    })
    return response
  }

  // Vérification rate-limit AVANT toute comparaison de secret
  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) {
    console.warn(
      `[maintenance-bypass] Rate-limit dépassé pour IP ${ip} — tentatives bloquées pendant ${Math.ceil(
        RATE_LIMIT_WINDOW_MS / 60000,
      )} min`,
    )
    return NextResponse.json(
      {
        ok: false,
        message:
          'Trop de tentatives. Réessaie dans 10 minutes.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
        },
      },
    )
  }

  // Action par défaut : on accorde le bypass si le secret est correct
  const expectedSecret = process.env.MAINTENANCE_BYPASS_SECRET ?? ''

  // Garde-fou : refuser si le secret côté serveur n'est pas défini ou trop court
  if (!expectedSecret || expectedSecret.length < 16) {
    console.error(
      '[maintenance-bypass] MAINTENANCE_BYPASS_SECRET manquant ou trop court (16 caractères minimum).',
    )
    return NextResponse.json(
      {
        ok: false,
        message:
          'Bypass désactivé : configuration serveur manquante.',
      },
      { status: 500 },
    )
  }

  // Comparaison à temps constant pour éviter les timing attacks
  if (!constantTimeEqual(secret, expectedSecret)) {
    recordFailedAttempt(ip)
    console.warn(
      `[maintenance-bypass] Tentative invalide depuis IP ${ip} (${rateLimit.remaining - 1} restantes)`,
    )
    return NextResponse.json(
      {
        ok: false,
        message: 'Secret invalide.',
      },
      { status: 401 },
    )
  }

  // Secret OK : on pose un cookie httpOnly de 7 jours et on redirige vers le dashboard
  console.info(`[maintenance-bypass] Bypass accordé depuis IP ${ip}`)
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = '/dashboard'
  redirectUrl.search = ''

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set('nexartis_bypass', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })

  return response
}

/**
 * Comparaison à temps constant entre deux chaînes.
 * Empêche les attaques par mesure de temps qui pourraient deviner le secret
 * caractère par caractère.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // On compare quand même pour ne pas révéler la longueur via le timing
    let acc = 1
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i++) {
      acc |= (a.charCodeAt(i) ^ b.charCodeAt(i)) | 0
    }
    return false
  }
  let acc = 0
  for (let i = 0; i < a.length; i++) {
    acc |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return acc === 0
}
