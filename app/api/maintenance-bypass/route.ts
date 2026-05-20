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
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret') ?? ''
  const action = searchParams.get('action') ?? 'grant'

  // Action de révocation : on supprime le cookie de bypass
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

  // Action par défaut : on accorde le bypass si le secret est correct
  const expectedSecret = process.env.MAINTENANCE_BYPASS_SECRET ?? ''

  // Garde-fou : refuser si le secret côté serveur n'est pas défini ou trop court
  if (!expectedSecret || expectedSecret.length < 16) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Bypass désactivé : variable MAINTENANCE_BYPASS_SECRET manquante ou trop courte (16 caractères minimum).',
      },
      { status: 500 },
    )
  }

  // Comparaison à temps constant pour éviter les timing attacks
  if (!constantTimeEqual(secret, expectedSecret)) {
    return NextResponse.json(
      { ok: false, message: 'Secret invalide.' },
      { status: 401 },
    )
  }

  // Secret OK : on pose un cookie httpOnly de 7 jours et on redirige vers le dashboard
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
