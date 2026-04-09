import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'admin@nexartis.fr'

/** Vérifie que le requérant est bien l'admin */
async function getAdminUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL ? user : null
}

/** Supabase admin client (bypass RLS) */
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// -------------------------------------------------------------------
// GET /api/admin/users — liste tous les utilisateurs
// -------------------------------------------------------------------
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const supabaseAdmin = adminSupabase()

  // Récupérer toutes les entreprises (tous les utilisateurs)
  const { data: entreprises, error } = await supabaseAdmin
    .from('entreprises')
    .select('id, user_id, nom, email, telephone, metier, ville, abonnement_type, trial_started_at, abonnement_expire_at, notes_admin, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Récupérer les emails auth pour chaque user
  const userIds = (entreprises ?? []).map(e => e.user_id)
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()

  const authMap: Record<string, { email: string; last_sign_in_at: string | null; email_confirmed_at: string | null }> = {}
  for (const u of authUsers?.users ?? []) {
    authMap[u.id] = {
      email: u.email ?? '',
      last_sign_in_at: u.last_sign_in_at ?? null,
      email_confirmed_at: u.email_confirmed_at ?? null,
    }
  }

  const users = (entreprises ?? []).map(e => ({
    ...e,
    auth_email: authMap[e.user_id]?.email ?? e.email ?? '',
    last_sign_in_at: authMap[e.user_id]?.last_sign_in_at ?? null,
    email_confirmed_at: authMap[e.user_id]?.email_confirmed_at ?? null,
  }))

  // Filtrer pour exclure le compte admin lui-même
  const filtered = users.filter(u => u.auth_email !== ADMIN_EMAIL)

  return NextResponse.json({ users: filtered })
}

// -------------------------------------------------------------------
// PATCH /api/admin/users — modifier l'abonnement d'un utilisateur
// -------------------------------------------------------------------
export async function PATCH(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await request.json()
  const { entreprise_id, abonnement_type, notes_admin, abonnement_expire_at } = body

  if (!entreprise_id || !abonnement_type) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const supabaseAdmin = adminSupabase()

  const updates: Record<string, unknown> = { abonnement_type }
  if (notes_admin !== undefined) updates.notes_admin = notes_admin
  if (abonnement_expire_at !== undefined) updates.abonnement_expire_at = abonnement_expire_at

  // Si on passe en lifetime, on supprime la date d'expiration
  if (abonnement_type === 'lifetime') {
    updates.abonnement_expire_at = null
  }

  const { error } = await supabaseAdmin
    .from('entreprises')
    .update(updates)
    .eq('id', entreprise_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
