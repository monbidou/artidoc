// -------------------------------------------------------------------
// Brevo transactional email service for Nexartis
// Server-side only — do NOT import from client components
// -------------------------------------------------------------------

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const SENDER = { name: 'Nexartis', email: 'no-reply@nexartis.fr' }

// -------------------------------------------------------------------
// Core send function
// -------------------------------------------------------------------

interface SendEmailParams {
  to: { email: string; name?: string }
  subject: string
  html: string
  senderName?: string
}

export async function sendEmail({ to, subject, html, senderName }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error('BREVO_API_KEY is not configured')

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName || SENDER.name, email: SENDER.email },
      to: [{ email: to.email, name: to.name || to.email }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `Brevo error ${res.status}`)
  }

  return res.json()
}

// -------------------------------------------------------------------
// Shared layout — style Obat
// -------------------------------------------------------------------

interface LayoutOptions {
  logoUrl?: string
  entrepriseNom?: string
}

function header(opts: LayoutOptions): string {
  const entName = opts.entrepriseNom || 'Nexartis'
  const logoImg = opts.logoUrl
    ? `<img src="${opts.logoUrl}" alt="${entName}" style="max-height:80px;max-width:250px;object-fit:contain;display:block;margin:0 auto 8px;" />`
    : ''

  return `<div style="padding:28px 32px;text-align:center;background:#ffffff;">
  ${logoImg}
  <div style="font-size:22px;font-weight:700;color:#1e293b;line-height:1.3;">${entName}</div>
</div>
<div style="height:1px;background:#e5e7eb;margin:0 32px;"></div>`
}

function footer(): string {
  return `<div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
  <p style="margin:0;font-size:11px;color:#9ca3af;">Envoyé via Nexartis — nexartis.fr</p>
</div>`
}

function layout(body: string, opts: LayoutOptions = {}) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f6f9;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      ${header(opts)}
      <div style="padding:32px;">
        ${body}
      </div>
      ${footer()}
    </div>
  </div>
</body>
</html>`
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function btn(text: string, url: string) {
  return `<div style="text-align:center;margin:28px 0;">
  <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:8px;">${text}</a>
</div>`
}

function signature(entrepriseNom: string) {
  return `<p style="font-size:15px;color:#1e293b;line-height:1.7;margin-top:24px;">Cordialement,<br><strong>${entrepriseNom}</strong></p>`
}

// -------------------------------------------------------------------
// Document email template builder (used by send-devis & send-facture routes)
// -------------------------------------------------------------------

export interface DocumentEmailParams {
  type: 'devis' | 'facture'
  numero: string
  clientNom: string
  montantTTC: number
  dateValidite?: string
  dateEcheance?: string
  messagePersonnalise?: string
  entreprise: {
    nom?: string
    logo_url?: string
  }
}

export function buildDocumentEmailHtml(params: DocumentEmailParams): string {
  const {
    type,
    numero,
    clientNom,
    montantTTC,
    dateValidite,
    dateEcheance,
    messagePersonnalise,
    entreprise,
  } = params

  const entNom = entreprise.nom || 'Nexartis'
  const isDevis = type === 'devis'
  const label = isDevis ? 'devis' : 'facture'
  const ctaLabel = isDevis ? 'Voir le devis' : 'Voir la facture'

  const defaultMessage = isDevis
    ? `Veuillez trouver ci-joint votre devis n° ${numero} d'un montant de ${fmt(montantTTC)}.${dateValidite ? ` Ce devis est valable jusqu'au ${dateValidite}.` : ''}`
    : `Veuillez trouver ci-joint votre facture n° ${numero} d'un montant de ${fmt(montantTTC)}${dateEcheance ? `, à régler avant le ${dateEcheance}` : ''}.`

  const body = `
    <p style="font-size:15px;color:#1e293b;line-height:1.7;">Bonjour ${clientNom},</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      ${messagePersonnalise || defaultMessage}
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">N'hésitez pas à nous contacter pour toute question relative à ce ${label}.</p>
    ${btn(ctaLabel, `https://nexartis.fr/dashboard/${isDevis ? 'devis' : 'factures'}`)}
    ${signature(entNom)}`

  return layout(body, {
    logoUrl: entreprise.logo_url,
    entrepriseNom: entNom,
  })
}

// -------------------------------------------------------------------
// 1. Welcome email
// -------------------------------------------------------------------

export async function sendWelcomeEmail(user: { email: string; name: string }) {
  const body = `
    <h2 style="margin:0 0 12px;font-size:22px;color:#1e293b;">Bienvenue sur Nexartis, ${user.name} !</h2>

    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Tout d'abord, un grand <strong>merci pour votre inscription</strong>. Votre confiance compte beaucoup pour nous.
    </p>

    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Notre mission est simple : aider chaque artisan à disposer du <strong>meilleur outil de gestion possible</strong>, à un prix juste et raisonnable. Nexartis a été pensé par des artisans, pour des artisans.
    </p>

    <!-- Encart bêta -->
    <div style="background:#eff6ff;border-left:4px solid #5ab4e0;border-radius:8px;padding:14px 18px;margin:22px 0;">
      <p style="margin:0 0 6px;font-size:14px;color:#0c4a6e;font-weight:700;">Version bêta — pleinement fonctionnelle</p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
        Nexartis est encore jeune mais opérationnel : devis, factures, suivi de chantiers, planning, équipe… Vous pouvez l'utiliser au quotidien sans réserve. Quelques retouches sont régulièrement apportées pour rendre l'outil toujours plus fluide.
      </p>
    </div>

    <h3 style="margin:24px 0 10px;font-size:16px;color:#1e293b;">Pour bien démarrer</h3>

    <!-- Étape 1 : profil -->
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;margin:10px 0;">
      <p style="margin:0 0 4px;font-size:14px;color:#1e293b;font-weight:700;">1. Complétez votre profil</p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        Renseignez votre nom d'entreprise, SIRET, adresse, logo et conditions de paiement. Ces informations apparaîtront automatiquement sur tous vos devis et factures, et vous éviteront de tout ressaisir à chaque document.
      </p>
    </div>

    <!-- Étape 2 : premier devis -->
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;margin:10px 0;">
      <p style="margin:0 0 4px;font-size:14px;color:#1e293b;font-weight:700;">2. Créez votre premier devis ou facture</p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        Tout se fait en quelques clics, avec PDF généré automatiquement et envoi par email à vos clients.
      </p>
    </div>

    <!-- Étape 3 : explorer -->
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;margin:10px 0;">
      <p style="margin:0 0 4px;font-size:14px;color:#1e293b;font-weight:700;">3. Explorez les autres modules</p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        Planning, gestion d'équipe, suivi des chantiers, bibliothèque matériel, relances automatiques. Tout est déjà disponible dans votre espace.
      </p>
    </div>

    ${btn('Accéder à mon espace', 'https://nexartis.fr/dashboard')}

    <!-- Encart contact / contribution -->
    <div style="background:#fef9f3;border:1px solid #fde6c8;border-radius:8px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0 0 8px;font-size:14px;color:#9a3412;font-weight:700;">Vos retours sont précieux</p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">
        Si vous repérez un bug, si une fonctionnalité vous manque, ou si quelque chose pourrait être plus simple, écrivez-nous directement à <a href="mailto:contact.nexartis@gmail.com" style="color:#2563eb;text-decoration:underline;font-weight:600;">contact.nexartis@gmail.com</a>. Nous lisons chaque message et répondons personnellement.
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#9a3412;line-height:1.6;font-style:italic;">
        Les utilisateurs qui contribuent activement à l'amélioration de Nexartis bénéficient régulièrement d'avantages exclusifs sur leur abonnement.
      </p>
    </div>

    <p style="font-size:14px;color:#475569;line-height:1.7;margin-top:20px;">
      Encore merci pour votre confiance, et bonne prise en main de Nexartis.
    </p>

    <p style="font-size:14px;color:#1e293b;line-height:1.6;margin-top:20px;">
      <strong>Jérémy Schmitt</strong><br/>
      <span style="color:#64748b;">Fondateur — Nexartis</span>
    </p>`

  return sendEmail({
    to: { email: user.email, name: user.name },
    subject: 'Bienvenue sur Nexartis — merci pour votre inscription',
    html: layout(body, { entrepriseNom: 'Nexartis' }),
  })
}

// -------------------------------------------------------------------
// 2. Quote sent email
// -------------------------------------------------------------------

export async function sendQuoteEmail(
  client: { email: string; name: string },
  quote: { number: string; totalAmount: number; pdfUrl?: string },
  entreprise?: { nom?: string; logo_url?: string },
) {
  const entNom = entreprise?.nom || 'Nexartis'
  const body = `
    <p style="font-size:15px;color:#1e293b;line-height:1.7;">Bonjour ${client.name},</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Veuillez trouver ci-joint votre devis n° ${quote.number} d'un montant de ${fmt(quote.totalAmount)}.
    </p>
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Numéro</td>
          <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:6px 0;">${quote.number}</td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Montant TTC</td>
          <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:6px 0;">${fmt(quote.totalAmount)}</td>
        </tr>
      </table>
    </div>
    ${btn('Voir le devis', quote.pdfUrl || 'https://nexartis.fr/dashboard/devis')}
    ${signature(entNom)}`

  return sendEmail({
    to: { email: client.email, name: client.name },
    subject: `Devis n° ${quote.number} — ${entNom}`,
    html: layout(body, { logoUrl: entreprise?.logo_url, entrepriseNom: entNom }),
    senderName: entNom,
  })
}

// -------------------------------------------------------------------
// 3. Invoice sent email
// -------------------------------------------------------------------

export async function sendInvoiceEmail(
  client: { email: string; name: string },
  invoice: { number: string; totalAmount: number; dueDate: string; pdfUrl?: string },
  entreprise?: { nom?: string; logo_url?: string },
) {
  const entNom = entreprise?.nom || 'Nexartis'
  const dueDateFmt = new Date(invoice.dueDate).toLocaleDateString('fr-FR')

  const body = `
    <p style="font-size:15px;color:#1e293b;line-height:1.7;">Bonjour ${client.name},</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Veuillez trouver ci-joint votre facture n° ${invoice.number} d'un montant de ${fmt(invoice.totalAmount)}, à régler avant le ${dueDateFmt}.
    </p>
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Numéro</td>
          <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:6px 0;">${invoice.number}</td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Montant TTC</td>
          <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:6px 0;">${fmt(invoice.totalAmount)}</td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Échéance</td>
          <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:6px 0;">${dueDateFmt}</td>
        </tr>
      </table>
    </div>
    ${btn('Voir la facture', invoice.pdfUrl || 'https://nexartis.fr/dashboard/factures')}
    ${signature(entNom)}`

  return sendEmail({
    to: { email: client.email, name: client.name },
    subject: `Facture n° ${invoice.number} — ${entNom}`,
    html: layout(body, { logoUrl: entreprise?.logo_url, entrepriseNom: entNom }),
    senderName: entNom,
  })
}

// -------------------------------------------------------------------
// 4. Quote accepted notification (to artisan)
// -------------------------------------------------------------------

export async function sendQuoteAcceptedEmail(
  artisan: { email: string; name: string },
  client: { name: string },
  quote: { number: string },
) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Devis accepté !</h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;">Bonjour ${artisan.name},</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Bonne nouvelle ! <strong>${client.name}</strong> a accepté votre devis n° <strong>${quote.number}</strong>.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:16px;color:#16a34a;font-weight:700;">Devis n° ${quote.number} — Accepté</p>
      <p style="margin:6px 0 0;font-size:14px;color:#15803d;">Client : ${client.name}</p>
    </div>
    ${btn('Voir le devis', 'https://nexartis.fr/dashboard/devis')}
    <p style="font-size:13px;color:#94a3b8;margin-top:24px;">
      Vous pouvez maintenant convertir ce devis en facture depuis votre espace Nexartis.
    </p>`

  return sendEmail({
    to: { email: artisan.email, name: artisan.name },
    subject: `Devis n° ${quote.number} accepté par ${client.name}`,
    html: layout(body, { entrepriseNom: 'Nexartis' }),
  })
}

// -------------------------------------------------------------------
// 5. Payment received confirmation
// -------------------------------------------------------------------

export async function sendPaymentReceivedEmail(
  client: { email: string; name: string },
  invoice: { number: string; amount: number },
  entreprise?: { nom?: string; logo_url?: string },
) {
  const entNom = entreprise?.nom || 'Nexartis'
  const body = `
    <p style="font-size:15px;color:#1e293b;line-height:1.7;">Bonjour ${client.name},</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Nous confirmons la bonne réception de votre paiement.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#16a34a;">Facture n° ${invoice.number}</p>
      <p style="margin:8px 0 0;font-size:22px;color:#15803d;font-weight:700;">${fmt(invoice.amount)}</p>
    </div>
    ${signature(entNom)}`

  return sendEmail({
    to: { email: client.email, name: client.name },
    subject: `Paiement reçu — Facture n° ${invoice.number}`,
    html: layout(body, { logoUrl: entreprise?.logo_url, entrepriseNom: entNom }),
    senderName: entNom,
  })
}

// -------------------------------------------------------------------
// 6. Payment reminder
// -------------------------------------------------------------------

export async function sendPaymentReminderEmail(
  client: { email: string; name: string },
  invoice: { number: string; totalAmount: number; dueDate: string; daysPastDue: number },
  entreprise?: { nom?: string; logo_url?: string },
) {
  const entNom = entreprise?.nom || 'Nexartis'
  const dueDateFmt = new Date(invoice.dueDate).toLocaleDateString('fr-FR')

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Rappel de paiement</h2>
    <p style="font-size:15px;color:#1e293b;line-height:1.7;">Bonjour ${client.name},</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Nous nous permettons de vous rappeler que la facture ci-dessous est en attente de règlement
      depuis <strong>${invoice.daysPastDue} jour${invoice.daysPastDue > 1 ? 's' : ''}</strong>.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Facture</td>
          <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:6px 0;">n° ${invoice.number}</td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Montant</td>
          <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:6px 0;">${fmt(invoice.totalAmount)}</td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#64748b;padding:6px 0;">Échéance</td>
          <td style="font-size:14px;color:#dc2626;font-weight:600;text-align:right;padding:6px 0;">${dueDateFmt}</td>
        </tr>
      </table>
    </div>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Si le règlement a déjà été effectué, merci de ne pas tenir compte de ce message.
    </p>
    ${signature(entNom)}`

  return sendEmail({
    to: { email: client.email, name: client.name },
    subject: `Rappel — Facture n° ${invoice.number} en attente`,
    html: layout(body, { logoUrl: entreprise?.logo_url, entrepriseNom: entNom }),
    senderName: entNom,
  })
}
