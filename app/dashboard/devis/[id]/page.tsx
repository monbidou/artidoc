'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronDown,
  Pencil,
  Copy,
  SendHorizonal,
  Download,
  FileText,
} from 'lucide-react'
import {
  useSupabaseRecord,
  useDevisLignes,
  LoadingSkeleton,
} from '@/lib/hooks'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface DevisRecord {
  id: string
  numero: string
  statut: string
  client_id: string
  chantier_id?: string
  date_devis?: string
  date_validite?: string
  conditions_paiement?: string
  created_at: string
  updated_at?: string
}

interface ClientRecord {
  id: string
  nom: string
  adresse?: string
  email?: string
  telephone?: string
}

interface LigneRecord {
  id: string
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  taux_tva: number
  ordre: number
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function formatCurrency(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20ac'
}

function formatDate(d: string | undefined): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR')
}

const STATUT_STYLES: Record<string, string> = {
  'Brouillon': 'bg-gray-100 text-gray-600',
  'Envoyé': 'bg-blue-50 text-blue-700',
  'Accepté': 'bg-green-50 text-green-700',
  'Refusé': 'bg-red-50 text-red-700',
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function DevisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: devis, loading: loadingDevis } = useSupabaseRecord<DevisRecord>('devis', id)
  const { data: lignesRaw, loading: loadingLignes } = useDevisLignes(id)
  const { data: client, loading: loadingClient } = useSupabaseRecord<ClientRecord>('clients', devis?.client_id ?? null)

  const [actionsOpen, setActionsOpen] = useState(false)

  const loading = loadingDevis || loadingLignes || loadingClient

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="p-6"><LoadingSkeleton rows={8} /></div>
      </div>
    )
  }

  if (!devis) {
    return (
      <div className="min-h-screen p-6">
        <Link href="/dashboard/devis" className="p-1.5 rounded-md hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft size={18} /> Retour
        </Link>
        <p className="text-sm font-manrope text-gray-500 mt-4">Devis introuvable.</p>
      </div>
    )
  }

  const lignes = lignesRaw as unknown as LigneRecord[]

  // Computations
  const tvaGroups: Record<number, { ht: number; tva: number }> = {}
  let totalHT = 0

  lignes.forEach((l) => {
    const lineTotal = (l.quantite ?? 0) * (l.prix_unitaire_ht ?? 0)
    totalHT += lineTotal
    const rate = l.taux_tva ?? 10
    if (!tvaGroups[rate]) tvaGroups[rate] = { ht: 0, tva: 0 }
    tvaGroups[rate].ht += lineTotal
    tvaGroups[rate].tva += lineTotal * (rate / 100)
  })

  const totalTVA = Object.values(tvaGroups).reduce((s, g) => s + g.tva, 0)
  const totalTTC = totalHT + totalTVA

  const statutStyle = STATUT_STYLES[devis.statut] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/devis" className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-[#6b7280]" />
          </Link>
          <h1 className="font-syne font-bold text-xl text-[#1a1a2e]">Devis {devis.numero}</h1>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-manrope font-medium ${statutStyle}`}>
            {devis.statut}
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setActionsOpen(!actionsOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-syne font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-[#1a1a2e]"
          >
            Actions
            <ChevronDown size={14} />
          </button>
          {actionsOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
              {[
                { label: 'Modifier', icon: Pencil, action: () => router.push(`/dashboard/devis/${id}/modifier`) },
                { label: 'Dupliquer', icon: Copy, action: () => {} },
                { label: 'Envoyer', icon: SendHorizonal, action: () => {} },
                { label: 'Télécharger PDF', icon: Download, action: () => {} },
                { label: 'Transformer en facture', icon: FileText, action: () => {} },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => { action.action(); setActionsOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-manrope text-[#1a1a2e] hover:bg-gray-50 transition-colors"
                >
                  <action.icon size={14} className="text-[#6b7280]" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main -- preview card */}
        <div className="flex-1 min-w-0">
          <div className="bg-white shadow-xl rounded-xl p-8 lg:p-12">
            {/* Company / Devis header */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="font-syne font-bold text-xl text-[#0f1a3a]">SARL Plomberie Martin</h2>
                <p className="text-sm font-manrope text-[#6b7280] mt-1 leading-relaxed">
                  15 rue des Artisans<br />
                  33000 Bordeaux<br />
                  SIRET : 123 456 789 00012<br />
                  Tél. : 05 56 00 00 00
                </p>
              </div>
              <div className="text-right">
                <h3 className="font-syne font-bold text-lg text-[#0f1a3a]">DEVIS N° {devis.numero}</h3>
                <p className="text-sm font-manrope text-[#6b7280] mt-1">
                  Date : {formatDate(devis.date_devis || devis.created_at)}<br />
                  {devis.date_validite && <>Validité : {formatDate(devis.date_validite)}<br /></>}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${statutStyle}`}>{devis.statut}</span>
                </p>
              </div>
            </div>

            {/* Client */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-manrope font-semibold uppercase tracking-wider text-[#6b7280] mb-1">Client</p>
              <p className="text-sm font-manrope text-[#1a1a2e] font-medium">{client?.nom ?? 'Non renseigné'}</p>
              {client?.adresse && <p className="text-sm font-manrope text-[#6b7280]">{client.adresse}</p>}
            </div>

            {/* Table */}
            {lignes.length > 0 && (
              <table className="w-full mb-8">
                <thead>
                  <tr className="bg-[#5ab4e0] text-white">
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold uppercase">N°</th>
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold uppercase">Désignation</th>
                    <th className="px-3 py-2.5 text-center text-xs font-manrope font-semibold uppercase">Qté</th>
                    <th className="px-3 py-2.5 text-center text-xs font-manrope font-semibold uppercase">Unité</th>
                    <th className="px-3 py-2.5 text-right text-xs font-manrope font-semibold uppercase">Prix U. HT</th>
                    <th className="px-3 py-2.5 text-center text-xs font-manrope font-semibold uppercase">TVA</th>
                    <th className="px-3 py-2.5 text-right text-xs font-manrope font-semibold uppercase">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((l, i) => (
                    <tr key={l.id ?? i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <td className="px-3 py-2.5 text-sm font-manrope text-[#6b7280]">{i + 1}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-[#1a1a2e]">{l.designation}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-center text-[#1a1a2e]">{l.quantite}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-center text-[#6b7280]">{l.unite}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-right text-[#1a1a2e]">{formatCurrency(l.prix_unitaire_ht)}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-center text-[#6b7280]">{l.taux_tva}%</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-right font-semibold text-[#1a1a2e]">{formatCurrency(l.quantite * l.prix_unitaire_ht)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-72">
                <div className="flex justify-between py-2 text-sm font-manrope">
                  <span className="text-[#6b7280]">Total HT</span>
                  <span className="text-[#1a1a2e] font-medium">{formatCurrency(totalHT)}</span>
                </div>
                {Object.entries(tvaGroups)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([rate, group]) => (
                    <div key={rate} className="flex justify-between py-2 text-sm font-manrope">
                      <span className="text-[#6b7280]">TVA {rate}%</span>
                      <span className="text-[#1a1a2e] font-medium">{formatCurrency(group.tva)}</span>
                    </div>
                  ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between py-2 text-sm font-manrope">
                  <span className="text-[#6b7280]">Total TTC</span>
                  <span className="text-[#1a1a2e] font-medium">{formatCurrency(totalTTC)}</span>
                </div>
                <div className="bg-[#5ab4e0] text-white rounded-lg p-3 mt-3 flex justify-between items-center">
                  <span className="font-syne font-bold text-sm">NET A PAYER</span>
                  <span className="font-syne font-bold text-lg">{formatCurrency(totalTTC)}</span>
                </div>
              </div>
            </div>

            {/* Conditions */}
            {devis.conditions_paiement && (
              <div className="mb-8">
                <h4 className="font-manrope font-semibold text-sm text-[#1a1a2e] mb-2">Conditions de paiement</h4>
                <p className="text-sm font-manrope text-[#6b7280]">{devis.conditions_paiement}</p>
              </div>
            )}

            {/* Signature zone */}
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm font-manrope text-[#6b7280]">Signature du client</p>
                <div className="h-20" />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm font-manrope text-[#6b7280]">Bon pour accord</p>
                <div className="h-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Metadata card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-manrope text-[#6b7280]">Statut</span>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-manrope font-medium ${statutStyle}`}>
                {devis.statut}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-manrope text-[#6b7280]">Client</span>
              <span className="text-sm font-manrope font-medium text-[#1a1a2e]">{client?.nom ?? 'N/A'}</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-sm font-manrope text-[#6b7280]">Créé le</span>
              <span className="text-sm font-manrope text-[#1a1a2e]">{formatDate(devis.created_at)}</span>
            </div>
            {devis.updated_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-manrope text-[#6b7280]">Modifié le</span>
                <span className="text-sm font-manrope text-[#1a1a2e]">{formatDate(devis.updated_at)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-sm font-manrope text-[#6b7280]">Total TTC</span>
              <span className="text-lg font-syne font-bold text-[#1a1a2e]">{formatCurrency(totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
