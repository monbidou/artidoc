import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const PREVIEW_EMAIL = 'schmitt.jeremy33@gmail.com'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const expectedToken = process.env.PREVIEW_TOKEN

  if (!expectedToken || !token || token !== expectedToken) {
    return NextResponse.json({ error: 'Acces refuse' }, { status: 403 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Generate magic link — returns a full action_link URL
  // The redirect_to tells Supabase where to send the user AFTER verification
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: PREVIEW_EMAIL,
    options: {
      redirectTo: 'https://nexartis.fr/auth/callback?next=/dashboard',
    },
  })

  if (error || !data?.properties?.action_link) {
    return NextResponse.json(
      { error: error?.message || 'Impossible de generer le lien' },
      { status: 500 },
    )
  }

  // The action_link points to Supabase's /auth/v1/verify endpoint.
  // Supabase verifies the token, creates a session, and redirects to
  // redirect_to with the session tokens in the URL fragment (#access_token=...).
  // The Supabase client-side JS picks up those tokens automatically.
  return NextResponse.redirect(data.properties.action_link)
}
