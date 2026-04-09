'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  Send,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  X,
} from 'lucide-react'
import EnvoyerFactureModal from '@/components/dashboard/EnvoyerFactureModal'
import {
  useSupabaseRecord,
  useFactureLignes,
  useEntreprise,
  updateRow,
  LoadingSkeleton,
} from '@/lib/hooks'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface FactureRecord {
  id: string
  numero: string
  statut: string
  client_id: string
  chantier_id?: string
  devis_id?: string
  date_emission?: string
  date_echeance?: string
  montant_ht?: number
  montant_tva?: number
  montant_ttc?: number
  montant_paye?: number
  notes?: string
  client_nom?: string
  client_adresse?: string
  client_telephone?: string
  client_email?: string
  notes_client?: string
  created_at: string
  updated_at?: string
}

interface ClientRecord {
  id: string
  nom: string
  adresse?: string
  code_postal?: string
  ville?: string
  telephone?: string
  email?: string
  client_type?: string
}

interface LigneRecord {
  id: string
  designation: string
  unite: string
  quantite: number
  prix_unitaire_ht: number
  total_ht: number
  ordre: number
}

const STATUT_STYLES: Record<string, string> = {
  'Encaissée': 'bg-green-50 text-green-700 border-green-200',
  'payee': 'bg-green-50 text-green-700 border-green-200',
  'Partiellement payée': 'bg-blue-50 text-blue-700 border-blue-200',
  'En attente': 'bg-orange-50 text-orange-700 border-orange-200',
  'En retard': 'bg-red-50 text-red-700 border-red-200',
  'archivee': 'bg-gray-100 text-gray-500 border-gray-200',
  'brouillon': 'bg-gray-100 text-gray-600 border-gray-200',
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function FactureDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: facture, loading: loadingFacture } = useSupabaseRecord<FactureRecord>('factures', id)
  const { data: lignesRaw, loading: loadingLignes } = useFactureLignes(id)
  const { data: client, loading: loadingClient } = useSupabaseRecord<ClientRecord>('clients', facture?.client_id ?? null)
  const { data: devisSource } = useSupabaseRecord<{ notes_client?: string }>('devis', facture?.devis_id ?? null)
  const { entreprise } = useEntreprise()

  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  async function handleMarkPaid() {
    if (!facture || updating) return
    setUpdating(true)
    try {
      await updateRow('factures', facture.id, {
        statut: 'payee',
        montant_paye: facture.montant_ttc || 0,
        date_paiement: new Date().toISOString(),
      })
      setToastMsg('Facture marquée comme payée !')
      setTimeout(() => setToastMsg(null), 3000)
      window.location.reload()
    } catch (err) {
      alert('Erreur : ' + (err instanceof Error ? err.message : 'Échec'))
    } finally {
      setUpdating(false)
    }
  }

  async function handleArchive() {
    if (!facture || updating) return
    setUpdating(true)
    try {
      await updateRow('factures', facture.id, { statut: 'archivee', archivee: true })
      setToastMsg('Facture archivée !')
      setTimeout(() => setToastMsg(null), 3000)
      window.location.reload()
    } catch (err) {
      alert('Erreur : ' + (err instanceof Error ? err.message : 'Échec'))
    } finally {
      setUpdating(false)
    }
  }

  async function handleUnarchive() {
    if (!facture || updating) return
    setUpdating(true)
    try {
      await updateRow('factures', facture.id, { statut: 'payee', archivee: false })
      setToastMsg('Facture désarchivée !')
      setTimeout(() => setToastMsg(null), 3000)
      window.location.reload()
    } catch (err) {
      alert('Erreur : ' + (err instanceof Error ? err.message : 'Échec'))
    } finally {
      setUpdating(false)
    }
  }

  const loading = loadingFacture || loadingLignes || loadingClient

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={8} />
      </div>
    )
  }

  if (!facture) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/factures"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-sm text-gray-500"
        >
          <ArrowLeft size={20} /> Retour
        </Link>
        <p className="text-sm font-manrope text-gray-500">Facture introuvable.</p>
      </div>
    )
  }

  const lignes = lignesRaw as unknown as LigneRecord[]
  const resolvedClientName = client?.nom || facture.client_nom || devisSource?.notes_client?.split(' | ')[0] || 'Non renseigné'
  const totalHT = facture.montant_ht ?? lignes.reduce((s, l) => s + (l.total_ht ?? 0), 0)
  const totalTVA = facture.montant_tva ?? 0
  const totalTTC = facture.montant_ttc ?? totalHT + totalTVA
  const totalPaye = facture.montant_paye ?? 0
  const resteAPayer = totalTTC - totalPaye
  const paymentPercent = totalTTC > 0 ? Math.round((totalPaye / totalTTC) * 100) : 0

  const statutStyle = STATUT_STYLES[facture.statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'

  const fmt = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val || 0)

  function formatDate(d: string | undefined) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-FR')
  }

  const printStyles = `@media print {
    nav, header, aside, .no-print, .sidebar-col { display: none !important; }
    body { background: white !important; }
    .print-zone { box-shadow: none !important; border: none !important; }
  }`

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/factures"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-syne font-bold text-[#0f1a3a]">
                Facture {facture.numero}
              </h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium border ${statutStyle}`}>
                {facture.statut}
              </span>
            </div>
            <p className="text-sm font-manrope text-gray-500 mt-1">
              {resolvedClientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => {
            const nomClient = client?.nom || facture.notes_client?.split(' | ')[0] || 'client'
            const originalTitle = document.title
            document.title = `Facture - ${nomClient}`
            window.print()
            setTimeout(() => { document.title = originalTitle }, 1500)
          }} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-manrope text-[#1a1a2e] transition-colors">
            <Download size={14} />
            Télécharger PDF
          </button>
          <button onClick={() => setSendModalOpen(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-manrope text-[#1a1a2e] transition-colors">
            <Send size={14} />
            Envoyer par email
          </button>
          {facture.statut !== 'payee' && facture.statut !== 'Encaissée' && facture.statut !== 'archivee' && (
            <button
              onClick={handleMarkPaid}
              disabled={updating}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-sm font-manrope text-green-700 transition-colors disabled:opacity-50"
            >
              <CreditCard size={14} />
              Marquer payée
            </button>
          )}
          {(facture.statut === 'payee' || facture.statut === 'Encaissée') && (
            <button
              onClick={handleArchive}
              disabled={updating}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-manrope text-[#1a1a2e] transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Archiver
            </button>
          )}
          {facture.statut === 'archivee' && (
            <button
              onClick={handleUnarchive}
              disabled={updating}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-sm font-manrope text-blue-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Désarchiver
            </button>
          )}
          {facture.statut !== 'payee' && facture.statut !== 'Encaissée' && facture.statut !== 'archivee' && (
            <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-sm font-manrope text-orange-700 transition-colors">
              <AlertTriangle size={14} />
              Relancer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Invoice preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-8 print-zone">

            {/* ═══ HEADER ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'start', marginBottom: 24 }}>
              <div>
                {Boolean(entreprise?.logo_url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entreprise?.logo_url as string} alt="Logo" style={{ height: 64, maxWidth: 160, objectFit: 'contain', marginBottom: 8, mixBlendMode: 'multiply' }} />
                )}
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>{(entreprise?.nom as string) || 'Mon Entreprise'}</div>
                  {Boolean(entreprise?.adresse) && <div>{entreprise?.adresse as string}</div>}
                  {Boolean(entreprise?.code_postal || entreprise?.ville) && <div>{entreprise?.code_postal as string} {entreprise?.ville as string}</div>}
                  {Boolean(entreprise?.siret) && <div>SIRET : {entreprise?.siret as string}</div>}
                  {Boolean(entreprise?.telephone) && <div>Tél : {entreprise?.telephone as string}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb', letterSpacing: 2 }}>FACTURE</div>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>N° <strong>{facture.numero}</strong></div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {formatDate(facture.date_emission || facture.created_at)}
                  {facture.date_echeance && ` · Échéance ${formatDate(facture.date_echeance)}`}
                </div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 14, borderTop: '3px solid #10b981' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#10b981', marginBottom: 8 }}>CLIENT</div>
                {facture.notes_client ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{facture.notes_client.split(' | ')[0]}</div>
                    {facture.notes_client.split(' | ').slice(1).map((info: string, i: number) => (
                      <div key={i} style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{info}</div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{resolvedClientName}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                      {client?.adresse && <div>{client.adresse}</div>}
                      {(client?.code_postal || client?.ville) && <div>{client.code_postal} {client.ville}</div>}
                      {client?.telephone && <div>{client.telephone}</div>}
                      {client?.email && <div>{client.email}</div>}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ height: 3, background: 'linear-gradient(90deg,#2563eb,#93c5fd)', borderRadius: 2, marginBottom: 16 }} />

            {/* ═══ TABLEAU ═══ */}
            {lignes.length > 0 && (
              <table className="w-full mb-8">
                <thead>
                  <tr className="bg-[#2563eb] text-white">
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold uppercase">Désignation</th>
                    <th className="px-3 py-2.5 text-center text-xs font-manrope font-semibold uppercase w-16">Qté</th>
                    <th className="px-3 py-2.5 text-center text-xs font-manrope font-semibold uppercase w-16">Unité</th>
                    <th className="px-3 py-2.5 text-right text-xs font-manrope font-semibold uppercase w-24">P.U. HT</th>
                    <th className="px-3 py-2.5 text-right text-xs font-manrope font-semibold uppercase w-24">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne, i) => (
                    <tr key={ligne.id ?? i} className={i % 2 === 1 ? 'bg-[#f8faff]' : ''}>
                      <td className="px-3 py-2.5 text-sm font-manrope text-[#1a1a2e]">{ligne.designation}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-center text-[#1a1a2e]">{ligne.quantite}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-center text-[#6b7280]">{ligne.unite}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-right text-[#1a1a2e]">{fmt(ligne.prix_unitaire_ht ?? 0)}</td>
                      <td className="px-3 py-2.5 text-sm font-manrope text-right font-semibold text-[#1a1a2e]">{fmt(ligne.total_ht || (ligne.quantite ?? 0) * (ligne.prix_unitaire_ht ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ═══ TOTAUX ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                {facture.notes && (
                  <div>
                    <h4 className="font-manrope font-semibold text-sm text-[#1a1a2e] mb-2">Conditions</h4>
                    <p className="text-sm font-manrope text-[#6b7280] leading-relaxed whitespace-pre-wrap">{facture.notes}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between py-2 text-sm font-manrope">
                  <span className="text-[#6b7280]">Total HT</span>
                  <span className="text-[#1a1a2e] font-medium">{fmt(totalHT)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm font-manrope">
                  <span className="text-[#6b7280]">TVA</span>
                  <span className="text-[#1a1a2e] font-medium">{fmt(totalTVA)}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between py-2 text-sm font-manrope">
                  <span className="text-[#1a1a2e] font-bold">Total TTC</span>
                  <span className="text-[#1a1a2e] font-bold">{fmt(totalTTC)}</span>
                </div>
                <div className="bg-[#2563eb] text-white rounded-lg p-3 mt-3 flex justify-between items-center">
                  <span className="font-syne font-bold text-sm">NET À PAYER</span>
                  <span className="font-syne font-bold text-lg">{fmt(totalTTC)}</span>
                </div>
              </div>
            </div>

            {/* ═══ FOOTER LÉGAL ═══ */}
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: '0.5px solid #e5e7eb', fontSize: 9.5, color: '#9ca3af', textAlign: 'center', lineHeight: 1.7 }}>
              {entreprise?.nom as string} — {entreprise?.adresse as string}, {entreprise?.code_postal as string} {entreprise?.ville as string}
              {Boolean(entreprise?.siret) && ` — SIRET : ${entreprise?.siret as string}`}
              {Boolean(entreprise?.email) && ` — Email : ${entreprise?.email as string}`}
              <br /><span style={{ color: '#d1d5db' }}>Généré via Nexartis — nexartis.fr</span>
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Informations</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-manrope text-gray-500">Date de facture</p>
                  <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{formatDate(facture.date_emission || facture.created_at)}</p>
                </div>
              </div>
              {facture.date_echeance && (
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-manrope text-gray-500">Échéance</p>
                    <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{formatDate(facture.date_echeance)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-manrope text-gray-500">Client</p>
                  <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{resolvedClientName}</p>
                </div>
              </div>
              {client?.adresse && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-manrope text-gray-500">Adresse</p>
                    <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{client.adresse}</p>
                  </div>
                </div>
              )}
              {client?.telephone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-manrope text-gray-500">Téléphone</p>
                    <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{client.telephone}</p>
                  </div>
                </div>
              )}
              {client?.email && (
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-manrope text-gray-500">Email</p>
                    <p className="text-sm font-manrope font-medium text-[#1a1a2e]">{client.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Montants */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Montants</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-manrope">
                <span className="text-gray-500">Total HT</span>
                <span className="font-medium text-[#1a1a2e]">{fmt(totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm font-manrope">
                <span className="text-gray-500">TVA</span>
                <span className="font-medium text-[#1a1a2e]">{fmt(totalTVA)}</span>
              </div>
              <div className="flex justify-between text-sm font-manrope pt-2 border-t border-gray-100">
                <span className="font-bold text-[#0f1a3a]">Total TTC</span>
                <span className="font-bold text-[#0f1a3a]">{fmt(totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Payment tracking */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Paiements</h3>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm font-manrope mb-2">
                <span className="text-gray-500">Progression</span>
                <span className={`font-medium ${paymentPercent >= 100 ? 'text-green-600' : 'text-blue-600'}`}>{paymentPercent}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${paymentPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(paymentPercent, 100)}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-manrope">
                <span className="text-gray-500">Total</span>
                <span className="font-medium text-[#1a1a2e]">{fmt(totalTTC)}</span>
              </div>
              <div className="flex justify-between text-sm font-manrope">
                <span className="text-gray-500">Payé</span>
                <span className="font-medium text-green-600">{fmt(totalPaye)}</span>
              </div>
              <div className="flex justify-between text-sm font-manrope">
                <span className="text-gray-500">Reste</span>
                <span className="font-medium text-[#1a1a2e]">{fmt(resteAPayer)}</span>
              </div>
            </div>

            {paymentPercent < 100 && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full h-9 rounded-lg bg-[#e87a2a] hover:bg-[#f09050] text-white text-sm font-syne font-bold transition-colors"
              >
                Enregistrer un paiement
              </button>
            )}
            {paymentPercent >= 100 && (
              <div className="text-center py-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-manrope font-medium">
                  <CreditCard size={12} /> Intégralement payée
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a2e] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-manrope z-50">
          {toastMsg}
        </div>
      )}

      {facture && (
        <EnvoyerFactureModal
          open={sendModalOpen}
          onClose={() => setSendModalOpen(false)}
          factureId={facture.id}
          numeroFacture={facture.numero}
          clientEmail={client?.email || facture.client_email || ''}
          onSuccess={() => {
            setToastMsg('Facture envoyée avec succès !')
            setTimeout(() => setToastMsg(null), 3000)
          }}
        />
      )}

      {/* Payment modal */}
      {paymentModalOpen && facture && (
        <PaymentModal
          resteAPayer={resteAPayer}
          factureId={facture.id}
          currentPaye={totalPaye}
          totalTTC={totalTTC}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            setToastMsg('Paiement enregistré !')
            setTimeout(() => setToastMsg(null), 3000)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Payment Modal
// -------------------------------------------------------------------

function PaymentModal({
  resteAPayer,
  factureId,
  currentPaye,
  totalTTC,
  onClose,
  onSuccess,
}: {
  resteAPayer: number
  factureId: string
  currentPaye: number
  totalTTC: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [montant, setMontant] = useState(resteAPayer.toFixed(2))
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0])
  const [mode, setMode] = useState('Virement')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    const amount = parseFloat(montant)
    if (isNaN(amount) || amount <= 0) {
      setError('Montant invalide')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const newPaye = currentPaye + amount
      const newStatut = newPaye >= totalTTC ? 'payee' : 'partielle'
      await updateRow('factures', factureId, {
        montant_paye: Math.min(newPaye, totalTTC),
        date_paiement: datePaiement,
        mode_paiement: mode,
        statut: newStatut,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setSaving(false)
    }
  }

  const fmtLocal = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-syne font-bold text-xl text-[#1a1a2e]">Enregistrer un paiement</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm font-manrope">
            <span className="text-gray-500">Reste à payer</span>
            <span className="font-bold text-[#1a1a2e]">{fmtLocal(resteAPayer)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Montant reçu</label>
            <input
              type="number"
              step="0.01"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope outline-none focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0]"
            />
          </div>
          <div>
            <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Date de paiement</label>
            <input
              type="date"
              value={datePaiement}
              onChange={(e) => setDatePaiement(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope outline-none focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0]"
            />
          </div>
          <div>
            <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Mode de paiement</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope outline-none focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0]"
            >
              <option>Virement</option>
              <option>Chèque</option>
              <option>Espèces</option>
              <option>Carte bancaire</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600 font-manrope">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="h-10 px-6 rounded-lg border border-gray-200 text-sm font-manrope hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="h-10 px-6 rounded-lg bg-[#e87a2a] text-white text-sm font-syne font-bold hover:bg-[#f09050] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? 'Enregistrement...' : 'Confirmer le paiement'}
          </button>
        </div>
      </div>
    </div>
  )
}
