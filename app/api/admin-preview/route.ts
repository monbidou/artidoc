import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const PREVIEW_EMAIL = 'monbidou33160@gmail.com'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const expectedToken = process.env.PREVIEW_TOKEN

  // Validate token
  if (!expectedToken || !token || token !== expectedToken) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // Require service role key
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
  }

  // Create admin client with service role
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Generate magic link for the preview user (does NOT send an email)
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: PREVIEW_EMAIL,
    options: { redirectTo: `${origin}/dashboard` },
  })

  if (error || !data?.properties?.hashed_token) {
    return NextResponse.json(
      { error: 'Impossible de générer le lien de prévisualisation' },
      { status: 500 }
    )
  }

  // Redirect to the auth callback with the token hash
  // Supabase magic links use /auth/v1/verify with token_hash
  const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${data.properties.hashed_token}&type=magiclink&redirect_to=${origin}/dashboard`

  return NextResponse.redirect(verifyUrl)
}
