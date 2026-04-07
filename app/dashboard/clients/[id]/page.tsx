'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Pencil,
  FileText,
  HardHat,
  Receipt,
  History,
  Plus,
} from 'lucide-react'
import {
  useSupabaseRecord,
  useSupabaseQuery,
  LoadingSkeleton,
} from '@/lib/hooks'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface Client {
  id: string
  nom: string
  type: string
  email: string
  telephone: string
  adresse: string
}

interface Chantier {
  id: string
  nom: string
  statut: string
  progression: number
}

interface Devis {
  id: string
  numero: string
  statut: string
  created_at: string
  total_ttc: number
}

interface Facture {
  id: string
  numero: string
  statut: string
  created_at: string
  total_ttc: number
}

const TABS = [
  { key: 'chantiers', label: 'Chantiers', icon: HardHat },
  { key: 'devis', label: 'Devis', icon: FileText },
  { key: 'factures', label: 'Factures', icon: Receipt },
  { key: 'historique', label: 'Historique', icon: History },
]

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: client, loading } = useSupabaseRecord<Client>('clients', id)
  const { data: chantiers, loading: loadingChantiers } = useSupabaseQuery<Chantier>('chantiers', { filters: { client_id: id } })
  const { data: devis, loading: loadingDevis } = useSupabaseQuery<Devis>('devis', { filters: { client_id: id } })
  const { data: factures, loading: loadingFactures } = useSupabaseQuery<Facture>('factures', { filters: { client_id: id } })

  const [activeTab, setActiveTab] = useState('chantiers')

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-sm font-manrope text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux clients
        </Link>
        <p className="text-sm font-manrope text-gray-500">Client introuvable.</p>
      </div>
    )
  }

  const caTotal = devis.reduce((sum, d) => sum + (d.total_ttc ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm font-manrope text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
      >
        <ArrowLeft size={16} />
        Retour aux clients
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-syne font-bold text-[#0f1a3a]">{client.nom}</h1>
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-manrope font-medium bg-gray-100 text-gray-600">
            {client.type || 'Particulier'}
          </span>
        </div>
        <button
          onClick={() => router.push(`/dashboard/clients/${id}/modifier`)}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-syne font-bold text-[#1a1a2e] transition-colors"
        >
          <Pencil size={14} />
          Modifier
        </button>
      </div>

      {/* Info + Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Coordonnées</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm font-manrope text-[#1a1a2e]">
              <MapPin size={16} className="text-[#6b7280] flex-shrink-0" />
              {client.adresse || 'Non renseignée'}
            </div>
            <div className="flex items-center gap-2.5 text-sm font-manrope text-[#1a1a2e]">
              <Mail size={16} className="text-[#6b7280] flex-shrink-0" />
              {client.email || 'Non renseigné'}
            </div>
            <div className="flex items-center gap-2.5 text-sm font-manrope text-[#1a1a2e]">
              <Phone size={16} className="text-[#6b7280] flex-shrink-0" />
              {client.telephone || 'Non renseigné'}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Chiffres</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-manrope text-[#6b7280]">CA total</p>
              <p className="text-xl font-syne font-bold text-[#1a1a2e]">{caTotal.toLocaleString('fr-FR')} &euro;</p>
            </div>
            <div>
              <p className="text-xs font-manrope text-[#6b7280]">Chantiers</p>
              <p className="text-xl font-syne font-bold text-[#1a1a2e]">{chantiers.length}</p>
            </div>
            <div>
              <p className="text-xs font-manrope text-[#6b7280]">Devis</p>
              <p className="text-xl font-syne font-bold text-[#1a1a2e]">{devis.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs & content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-syne font-bold -mb-px border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#0f1a3a] border-[#5ab4e0]'
                    : 'text-[#6b7280] border-transparent hover:text-[#1a1a2e]'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {activeTab === 'chantiers' && (
              loadingChantiers ? <div className="p-4"><LoadingSkeleton rows={2} /></div> : chantiers.length === 0 ? (
                <div className="py-12 text-center">
                  <HardHat size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-manrope text-gray-500">Aucun chantier</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Chantier', 'Statut', 'Progression'].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chantiers.map((ch) => (
                      <tr key={ch.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-manrope font-semibold text-[#1a1a2e]">{ch.nom}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-manrope font-medium bg-blue-50 text-blue-700">
                            {ch.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5ab4e0] rounded-full"
                                style={{ width: `${ch.progression ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-manrope text-[#6b7280]">{ch.progression ?? 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'devis' && (
              loadingDevis ? <div className="p-4"><LoadingSkeleton rows={2} /></div> : devis.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-manrope text-gray-500">Aucun devis</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Numéro', 'Statut', 'Date', 'Total TTC'].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {devis.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-manrope font-semibold text-[#1a1a2e]">{d.numero}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-manrope font-medium bg-blue-50 text-blue-700">
                            {d.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-manrope text-gray-600">
                          {d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : ''}
                        </td>
                        <td className="px-4 py-3 text-sm font-manrope font-bold text-[#1a1a2e]">
                          {(d.total_ttc ?? 0).toLocaleString('fr-FR')} &euro;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'factures' && (
              loadingFactures ? <div className="p-4"><LoadingSkeleton rows={2} /></div> : factures.length === 0 ? (
                <div className="py-12 text-center">
                  <Receipt size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-manrope text-gray-500">Aucune facture</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Numéro', 'Statut', 'Date', 'Total TTC'].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {factures.map((f) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-manrope font-semibold text-[#1a1a2e]">{f.numero}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-manrope font-medium bg-blue-50 text-blue-700">
                            {f.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-manrope text-gray-600">
                          {f.created_at ? new Date(f.created_at).toLocaleDateString('fr-FR') : ''}
                        </td>
                        <td className="px-4 py-3 text-sm font-manrope font-bold text-[#1a1a2e]">
                          {(f.total_ttc ?? 0).toLocaleString('fr-FR')} &euro;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'historique' && (
              <div className="py-12 text-center">
                <History size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-manrope text-gray-500">Aucune donnée</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Actions rapides</h2>
          <Link
            href={`/dashboard/devis/nouveau?client_id=${id}`}
            className="w-full flex items-center gap-2 h-10 px-4 rounded-lg bg-[#e87a2a] hover:bg-[#f09050] text-white text-sm font-syne font-bold transition-colors"
          >
            <Plus size={16} />
            Créer un devis pour ce client
          </Link>
          {client.telephone && (
            <a
              href={`tel:${client.telephone.replace(/\s/g, '')}`}
              className="w-full flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-syne font-bold text-[#1a1a2e] transition-colors"
            >
              <Phone size={16} />
              Appeler
            </a>
          )}
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="w-full flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-syne font-bold text-[#1a1a2e] transition-colors"
            >
              <Mail size={16} />
              Envoyer un email
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
