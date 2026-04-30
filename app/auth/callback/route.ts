import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

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

      const redirectUrl = new URL(next, origin)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
