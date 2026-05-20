import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Vérifie qu'une URL de redirection est sûre :
 * - doit être un chemin relatif (commence par '/')
 * - ne doit pas être protocol-relative ('//exemple.com' redirige vers exemple.com)
 * - ne doit pas contenir de schéma (http://, javascript:, etc.)
 *
 * Cette fonction empêche les attaques par "Open Redirect" où un attaquant
 * construit une URL du type /auth/callback?code=...&next=https://phishing.com
 * pour rediriger l'utilisateur vers un site malveillant après authentification.
 */
function isSafeRedirectPath(path: string): boolean {
  if (typeof path !== 'string' || path.length === 0) return false
  if (!path.startsWith('/')) return false
  // Protocol-relative URLs (//evil.com) — rejetées
  if (path.startsWith('//')) return false
  // Backslash trick (/\evil.com sur certains navigateurs) — rejeté
  if (path.startsWith('/\\')) return false
  // Tout schéma (http:, javascript:, data:, etc.) — rejeté
  if (/^\/?[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false
  return true
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next')

  // Validation stricte du paramètre `next` pour empêcher l'Open Redirect.
  // Si la valeur est invalide ou suspecte, on retombe sur /dashboard.
  const next = rawNext && isSafeRedirectPath(rawNext) ? rawNext : '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Welcome email a la premiere confirmation uniquement.
      // Non bloquant : toute erreur ici n empeche pas la connexion.
      try {
        const user = data.user
        if (user && user.email && user.email_confirmed_at) {
          const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } },
          )

          const { data: ent } = await admin
            .from('entreprises')
            .select('welcome_email_sent, prenom, nom')
            .eq('user_id', user.id)
            .maybeSingle()

          if (ent && !ent.welcome_email_sent) {
            const meta = (user.user_metadata as Record<string, unknown>) ?? {}
            const displayName =
              (meta.prenom as string) ||
              (ent.prenom as string) ||
              user.email.split('@')[0]

            const { sendWelcomeEmail } = await import('@/lib/email')
            await sendWelcomeEmail({ email: user.email, name: displayName }).catch((e) => {
              console.error('sendWelcomeEmail failed:', e)
            })

            await admin
              .from('entreprises')
              .update({ welcome_email_sent: true })
              .eq('user_id', user.id)
          }
        }
      } catch (e) {
        console.error('Welcome email hook error:', e)
      }

      // Sécurité : on construit l'URL en imposant explicitement l'origine du
      // serveur, et on ne passe que le chemin déjà validé. Impossible de
      // rediriger vers un autre domaine.
      const redirectUrl = new URL(next, origin)
      // Garde-fou supplémentaire : si l'URL résultante a un host différent
      // de notre origin (ce qui ne devrait jamais arriver avec un next validé),
      // on retombe sur /dashboard.
      if (redirectUrl.origin !== origin) {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
