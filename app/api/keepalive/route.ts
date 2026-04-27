import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Cet endpoint est appele par Vercel Cron tous les 5 jours pour empecher
// Supabase Free de mettre le projet en pause apres 7 jours d'inactivite.
// On varie les requetes a chaque execution pour ressembler a de l'activite
// humaine plutot qu'a un bot keep-alive detectable.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30


type KeepaliveQuery = {
  name: string
  run: (s: SupabaseClient) => Promise<{ error: { message: string } | null }>
}

// 12 requetes differentes touchant les vraies tables de Nexartis.
// La rotation est deterministe (basee sur la date) donc deux executions
// consecutives utilisent toujours une requete differente.
const QUERIES: KeepaliveQuery[] = [
  {
    name: 'count_entreprises',
    run: async (s) => {
      const { error } = await s.from('entreprises').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_clients',
    run: async (s) => {
      const { error } = await s.from('clients').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_devis',
    run: async (s) => {
      const { error } = await s.from('devis').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_factures',
    run: async (s) => {
      const { error } = await s.from('factures').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_chantiers',
    run: async (s) => {
      const { error } = await s.from('chantiers').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_planning',
    run: async (s) => {
      const { error } = await s.from('planning_interventions').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_intervenants',
    run: async (s) => {
      const { error } = await s.from('intervenants').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_paiements',
    run: async (s) => {
      const { error } = await s.from('paiements').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'latest_devis',
    run: async (s) => {
      const { error } = await s.from('devis').select('id, created_at').order('created_at', { ascending: false }).limit(1)
      return { error }
    },
  },
  {
    name: 'latest_facture',
    run: async (s) => {
      const { error } = await s.from('factures').select('id, created_at').order('created_at', { ascending: false }).limit(1)
      return { error }
    },
  },
  {
    name: 'count_documents',
    run: async (s) => {
      const { error } = await s.from('documents').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
  {
    name: 'count_prestations',
    run: async (s) => {
      const { error } = await s.from('prestations').select('id', { count: 'exact', head: true })
      return { error }
    },
  },
]

export async function GET(request: NextRequest) {
  // Securite : Vercel Cron envoie automatiquement Authorization: Bearer <CRON_SECRET>.
  // Tout appel sans ce header est rejete pour empecher un DoS public sur la base.
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Selection deterministe : la rotation tourne tous les jours, donc deux
  // invocations a 5 jours d'intervalle prennent des requetes differentes
  // (5 mod 12 = 5, decalage stable sur 12 cycles).
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const queryIdx = daysSinceEpoch % QUERIES.length
  const query = QUERIES[queryIdx]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )

  const start = Date.now()
  let success = false
  let errorMessage: string | null = null

  try {
    const result = await query.run(supabase)
    if (result.error) {
      errorMessage = result.error.message
    } else {
      success = true
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e)
  }

  const durationMs = Date.now() - start

  // Log structure pour Vercel Logs : on verra dans la console l'etat de chaque execution.
  console.log('[keepalive]', JSON.stringify({
    ok: success,
    query: query.name,
    durationMs,
    timestamp: new Date().toISOString(),
    error: errorMessage,
  }))

  return NextResponse.json({
    ok: success,
    query: query.name,
    durationMs,
    timestamp: new Date().toISOString(),
    error: errorMessage,
  }, { status: success ? 200 : 500 })
}
