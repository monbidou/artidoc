import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/auto-confirm
 * Auto-confirme un utilisateur après inscription pour qu'il puisse se connecter immédiatement.
 * Utilise la service role key (bypass RLS).
 * Crée aussi la ligne dans la table "entreprises" si elle n'existe pas encore.
 */
export async function POST(request: Request) {
  try {
    const { user_id, email, prenom, nom, entreprise } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'user_id requis' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    // 1. Auto-confirmer l'email de l'utilisateur
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      email_confirm: true,
    })

    if (confirmError) {
      console.error('Auto-confirm error:', confirmError)
      return NextResponse.json({ error: confirmError.message }, { status: 500 })
    }

    // 2. Créer la ligne entreprise si elle n'existe pas encore
    const { data: existing } = await supabaseAdmin
      .from('entreprises')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (!existing) {
      const { error: insertError } = await supabaseAdmin.from('entreprises').insert({
        user_id,
        email: email || '',
        nom: entreprise || '',
        prenom: prenom || '',
        metier: '',
        abonnement_type: 'trial',
        trial_started_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('Entreprise insert error:', insertError)
        // Non bloquant — l'utilisateur peut quand même se connecter
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Auto-confirm route error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
