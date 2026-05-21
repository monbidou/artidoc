import { NextRequest, NextResponse } from 'next/server'
import { parseVoiceDevis } from '@/lib/voice/parser'
import {
  getAuthenticatedUser, getClientIp, checkRateLimit,
  secureJson, secureError, rateLimitError, unauthorizedError,
} from '@/lib/api-security'

/**
 * POST /api/voice-devis
 *
 * Parse une transcription vocale et retourne les champs d'un devis pre-rempli.
 * Le parsing est local (lib/voice/parser.ts) - pas d'appel IA pour l'instant,
 * mais on protege quand meme la route au cas ou on basculerait sur OpenAI/Whisper.
 *
 * Securite (P15 audit) :
 * - Auth obligatoire : seul un utilisateur connecte peut invoquer la route.
 * - Rate-limit : 20 requetes / minute par utilisateur (et 30 par IP en filet
 *   de securite anti-bot, plus restrictif si pas authentifie).
 * - Pas de devis_id en input -> pas d'ownership check a faire ici.
 * - Taille de la transcription limitee a 10 000 caracteres (anti-DoS).
 */
export async function POST(req: NextRequest) {
  try {
    // Filet IP : bloque les bots/scans avant meme de toucher Supabase
    const ip = getClientIp(req)
    if (!checkRateLimit(`voice-devis:ip:${ip}`, 30, 60_000)) {
      return rateLimitError()
    }

    // Auth obligatoire
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedError()

    // Rate-limit par utilisateur (plus genereux, mais evite l'abus IA si on
    // bascule sur un parser payant)
    if (!checkRateLimit(`voice-devis:user:${user.id}`, 20, 60_000)) {
      return rateLimitError()
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return secureError('Corps de requete invalide')
    }

    const transcription = body.transcript || body.transcription || body.text || body.input

    if (!transcription || typeof transcription !== 'string' || transcription.trim() === '') {
      return secureError('Transcription manquante')
    }

    // Anti-DoS : on borne la taille d'entree
    if (transcription.length > 10_000) {
      return secureError('Transcription trop longue (10 000 caracteres max)', 413)
    }

    // Parse avec le moteur BTP local (gratuit, instantane)
    const result = parseVoiceDevis(transcription)

    // Transformer le resultat pour matcher le format attendu par handleVoiceResult
    return secureJson({
      client_civilite: result.client_civilite,
      client_nom: [result.client_prenom, result.client_nom].filter(Boolean).join(' ') || null,
      client_prenom: result.client_prenom,
      client_adresse: result.client_adresse,
      client_code_postal: result.client_code_postal,
      client_ville: result.client_ville,
      client_telephone: result.client_telephone,
      client_email: result.client_email,
      chantier: result.chantier,
      lignes: result.lignes.map(l => ({
        designation: l.designation,
        quantite: l.quantite,
        unite: l.unite,
        prix_unitaire: l.prix_unitaire,
      })),
      tva_taux: result.tva_taux,
      conditions_paiement: result.conditions_paiement,
      notes: result.notes,
      dechets_nature: result.dechets_nature,
      date_travaux: result.date_travaux,
      duree: result.duree,
      acompte_pourcentage: result.acompte_pourcentage,
    })
  } catch (error) {
    console.error('Voice devis error:', error)
    return secureError('Erreur de traitement', 500)
  }
}
