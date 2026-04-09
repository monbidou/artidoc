'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  HardHat,
  FileText,
  Receipt,
  Clock,
  Camera,
  FolderOpen,
  Plus,
} from 'lucide-react'
import {
  useSupabaseRecord,
  LoadingSkeleton,
} from '@/lib/hooks'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface ChantierRecord {
  id: string
  nom: string
  client_id?: string
  client_nom?: string
  statut: string
  adresse?: string
  telephone?: string
  email?: string
  date_debut?: string
  date_fin?: string
  devis_ttc?: number
  facture_ttc?: number
  encaisse?: number
  marge_estimee?: number
  avancement?: number
  notes?: string
  created_at: string
}

interface ClientRecord {
  id: string
  nom: string
  adresse?: string
  telephone?: string
  email?: string
}

const STATUT_STYLES: Record<string, string> = {
  'En cours': 'bg-blue-50 text-blue-700 border-blue-200',
  'Terminé': 'bg-green-50 text-green-700 border-green-200',
  'Archivé': 'bg-gray-100 text-gray-600 border-gray-200',
}

type TabKey = 'resume' | 'devis' | 'factures' | 'planning' | 'photos' | 'documents'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'resume', label: 'Résumé', icon: HardHat },
  { key: 'devis', label: 'Devis', icon: FileText },
  { key: 'factures', label: 'Factures', icon: Receipt },
  { key: 'planning', label: 'Planning', icon: Clock },
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'documents', label: 'Documents', icon: FolderOpen },
]

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function ChantierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: chantier, loading: loadingChantier } = useSupabaseRecord<ChantierRecord>('chantiers', id)
  const { data: client, loading: loadingClient } = useSupabaseRecord<ClientRecord>('clients', chantier?.client_id ?? null)

  const [activeTab, setActiveTab] = useState<TabKey>('resume')
  const [notes, setNotes] = useState('')

  // Sync notes when chantier loads
  const chantierNotes = chantier?.notes ?? ''
  if (chantierNotes && notes === '' && chantierNotes !== notes) {
    // Only set once on load
  }

  const loading = loadingChantier || loadingClient

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={8} />
      </div>
    )
  }

  if (!chantier) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/chantiers"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-sm text-gray-500"
        >
          <ArrowLeft size={20} /> Retour
        </Link>
        <p className="text-sm font-manrope text-gray-500">Chantier introuvable.</p>
      </div>
    )
  }

  const clientNom = client?.nom ?? chantier.client_nom ?? 'Client inconnu'
  const adresse = chantier.adresse ?? client?.adresse ?? ''
  const telephone = chantier.telephone ?? client?.telephone ?? ''
  const email = chantier.email ?? client?.email ?? ''
  const avancement = chantier.avancement ?? 0
  const deviseTTC = chantier.devis_ttc ?? 0
  const factureTTC = chantier.facture_ttc ?? 0
  const encaisse = chantier.encaisse ?? 0
  const margeEstimee = chantier.marge_estimee ?? 0
  const statutStyle = STATUT_STYLES[chantier.statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'

  function getProgressColor(percent: number) {
    if (percent >= 75) return 'bg-green-500'
    if (percent >= 25) return 'bg-[#5ab4e0]'
    return 'bg-[#e87a2a]'
  }

  function formatDate(d: string | undefined) {
    if (!d) return 'Non défini'
    return new Date(d).toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/chantiers"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-syne font-bold text-[#0f1a3a]">
                {chantier.nom} &mdash; {clientNom}
              </h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium border ${statutStyle}`}>
                {chantier.statut}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/dashboard/chantiers/${id}/modifier`)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-manrope text-[#1a1a2e] transition-colors"
        >
          <Pencil size={14} />
          Modifier
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Devisé" value={`${deviseTTC.toLocaleString('fr-FR')} €`} />
        <InfoCard label="Facturé" value={`${factureTTC.toLocaleString('fr-FR')} €`} />
        <InfoCard label="Encaissé" value={`${encaisse.toLocaleString('fr-FR')} €`} />
        <InfoCard label="Marge estimée" value={`${margeEstimee}%`} valueColor="text-green-600" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-manrope font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-[#5ab4e0] text-[#0f1a3a]'
                  : 'border-transparent text-gray-500 hover:text-[#1a1a2e] hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Client</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-manrope text-gray-500">Nom</p>
                  <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{clientNom}</p>
                </div>
              </div>
              {adresse && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-manrope text-gray-500">Adresse</p>
                    <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{adresse}</p>
                  </div>
                </div>
              )}
              {telephone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-manrope text-gray-500">Téléphone</p>
                    <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{telephone}</p>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-manrope text-gray-500">Email</p>
                    <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chantier info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Chantier</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-manrope text-gray-500">Début</p>
                  <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{formatDate(chantier.date_debut)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-manrope text-gray-500">Fin prévue</p>
                  <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{formatDate(chantier.date_fin)}</p>
                </div>
              </div>

              {/* Avancement */}
              <div>
                <div className="flex justify-between text-sm font-manrope mb-2">
                  <span className="text-gray-500">Avancement</span>
                  <span className="font-medium text-[#1a1a2e]">{avancement}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getProgressColor(avancement)}`} style={{ width: `${avancement}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Notes</h3>
            <textarea
              value={notes || chantierNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes sur ce chantier..."
              className="w-full h-32 rounded-lg border border-gray-200 p-3 text-sm font-manrope text-[#1a1a2e] placeholder:text-gray-400 focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none resize-none transition-colors"
            />
          </div>
        </div>
      )}

      {activeTab === 'devis' && (
        <EmptyState
          icon={FileText}
          title="Aucun devis associé"
          description="Associez un devis existant ou créez-en un nouveau pour ce chantier."
          ctaLabel="Créer un devis"
          ctaHref="/dashboard/devis/nouveau"
        />
      )}

      {activeTab === 'factures' && (
        <EmptyState
          icon={Receipt}
          title="Aucune facture associée"
          description="Créez une facture à partir d'un devis signé pour ce chantier."
          ctaLabel="Créer une facture"
          ctaHref="/dashboard/factures/nouveau"
        />
      )}

      {activeTab === 'planning' && (
        <EmptyState
          icon={Clock}
          title="Planning non configuré"
          description="Définissez les étapes et le planning de ce chantier."
          ctaLabel="Configurer le planning"
        />
      )}

      {activeTab === 'photos' && (
        <EmptyState
          icon={Camera}
          title="Aucune photo"
          description="Ajoutez des photos pour documenter l'avancement du chantier."
          ctaLabel="Ajouter des photos"
        />
      )}

      {activeTab === 'documents' && (
        <EmptyState
          icon={FolderOpen}
          title="Aucun document"
          description="Ajoutez des documents liés à ce chantier (plans, permis, etc.)."
          ctaLabel="Ajouter un document"
        />
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// InfoCard
// -------------------------------------------------------------------

function InfoCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-manrope text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-syne font-bold ${valueColor || 'text-[#1a1a2e]'}`}>{value}</p>
    </div>
  )
}

// -------------------------------------------------------------------
// EmptyState
// -------------------------------------------------------------------

function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: React.ElementType
  title: string
  description: string
  ctaLabel: string
  ctaHref?: string
}) {
  const button = (
    <button className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#e87a2a] hover:bg-[#f09050] text-white text-sm font-syne font-bold transition-colors">
      <Plus size={16} />
      {ctaLabel}
    </button>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
      <Icon size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-syne font-bold text-[#1a1a2e] mb-2">{title}</h3>
      <p className="text-sm font-manrope text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {ctaHref ? (
        <Link href={ctaHref}>
          {button}
        </Link>
      ) : (
        button
      )}
    </div>
  )
}
