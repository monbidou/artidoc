import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

/**
 * POST /api/auth/resend-confirmation
 * Renvoie le mail de confirmation Nexartis à un utilisateur non confirmé.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    // Vérifier que l'utilisateur existe et n'est pas déjà confirmé
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === email)

    if (!authUser) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return NextResponse.json({ success: true })
    }

    if (authUser.email_confirmed_at) {
      // Déjà confirmé — renvoyer quand même un succès silencieux
      return NextResponse.json({ success: true })
    }

    // Générer un nouveau lien de confirmation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexartis.fr'
    let confirmUrl = ''

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${siteUrl}/auth/callback` },
    })
    if (!linkError && linkData?.properties?.action_link) {
      confirmUrl = linkData.properties.action_link
    }

    if (!confirmUrl) {
      return NextResponse.json({ error: 'Impossible de générer le lien' }, { status: 500 })
    }

    // Récupérer le prénom depuis les metadata
    const meta = (authUser.user_metadata as Record<string, unknown>) ?? {}
    const displayName = (meta.prenom as string) || email.split('@')[0]

    // Envoyer le mail
    const html = buildConfirmationEmailHtml({ name: displayName, confirmUrl })
    await sendEmail({
      to: { email, name: displayName },
      subject: 'Confirmez votre compte Nexartis',
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend confirmation error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function buildConfirmationEmailHtml({ name, confirmUrl }: { name: string; confirmUrl: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f6f9;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="padding:28px 32px;text-align:center;background:#ffffff;">
        <div style="font-size:24px;font-weight:700;color:#1e293b;line-height:1.3;">Nexartis</div>
      </div>
      <div style="height:1px;background:#e5e7eb;margin:0 32px;"></div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Bonjour ${name},</h2>
        <p style="font-size:15px;color:#475569;line-height:1.7;">
          Voici votre lien de confirmation. Cliquez sur le bouton ci-dessous pour activer votre compte Nexartis.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${confirmUrl}" style="display:inline-block;background:#e87a2a;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:10px;">
            Confirmer mon compte
          </a>
        </div>
        <p style="font-size:13px;color:#94a3b8;margin-top:24px;line-height:1.6;">
          Si vous n'avez pas demandé cet email, ignorez-le simplement.<br/>
          Ce lien expire dans 24 heures.
        </p>
      </div>
      <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">Envoyé via Nexartis — nexartis.fr</p>
      </div>
    </div>
  </div>
</body>
</html>`
}
