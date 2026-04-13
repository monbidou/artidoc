'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────

interface DevisData {
  id: string
  numero: string
  statut: string
  date_emission?: string
  date_validite?: string
  date_debut_travaux?: string
  duree_estimee?: string
  objet?: string
  conditions_paiement?: string
  acompte_pourcent?: number
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  date_signature?: string
  signed_by?: string
  client_signature_base64?: string
  dechets_nature?: string
  dechets_quantite?: string
  dechets_responsable?: string
  dechets_tri?: string
  dechets_collecte_nom?: string
  dechets_collecte_adresse?: string
  dechets_collecte_type?: string
  dechets_cout?: number
  dechets_inclure_cout?: boolean
}

interface Ligne {
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  taux_tva: number
  montant_ht: number
  ordre: number
  type: string
  optionnel: boolean
}

interface Entreprise {
  nom?: string
  adresse?: string
  code_postal?: string
  ville?: string
  telephone?: string
  email?: string
  siret?: string
  logo_url?: string
  signature_base64?: string
  tampon_base64?: string
}

interface ClientInfo {
  nom: string
  adresse: string
  telephone: string
  email: string
}

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

const formatDate = (d?: string) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ───────────────────────────────────────────────────────────────
// Signature Pad Component
// ───────────────────────────────────────────────────────────────

function SignaturePad({
  onSignature,
  onClear,
}: {
  onSignature: (base64: string) => void
  onClear: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }, [getPos])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasDrawn(true)
  }, [isDrawing, getPos])

  const endDraw = useCallback(() => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas && hasDrawn) {
      onSignature(canvas.toDataURL('image/png'))
    }
  }, [hasDrawn, onSignature])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    onClear()
  }, [onClear])

  return (
    <div>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full cursor-crosshair"
          style={{ height: 150 }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm font-manrope">Dessinez votre signature ici</p>
          </div>
        )}
      </div>
      {hasDrawn && (
        <button
          onClick={clear}
          className="mt-2 text-sm text-gray-500 hover:text-red-500 font-manrope transition-colors"
        >
          Effacer et recommencer
        </button>
      )}
    </div>
  )
}

// ───────────────────────────────────────────────────────────────
// Main Page
// ───────────────────────────────────────────────────────────────

export default function SignerDevisPage() {
  const { token } = useParams<{ token: string }>()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [devis, setDevis] = useState<DevisData | null>(null)
  const [lignes, setLignes] = useState<Ligne[]>([])
  const [entreprise, setEntreprise] = useState<Entreprise>({})
  const [client, setClient] = useState<ClientInfo>({ nom: '', adresse: '', telephone: '', email: '' })

  // Signature state
  const [mode, setMode] = useState<'draw' | 'approve' | null>(null)
  const [signedBy, setSignedBy] = useState('')
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  // Fetch devis data
  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch(`/api/public/devis/${token}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erreur de chargement')
          return
        }
        setDevis(data.devis)
        setLignes(data.lignes)
        setEntreprise(data.entreprise)
        setClient(data.client)
        if (data.client?.nom) setSignedBy(data.client.nom)
        // Déjà signé ?
        if (data.devis.statut === 'signe' || data.devis.statut === 'facture') {
          setSigned(true)
        }
      } catch {
        setError('Impossible de charger le devis')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  // Handle signature submission
  async function handleSign() {
    if (!signedBy.trim()) {
      setSignError('Veuillez entrer votre nom')
      return
    }
    if (mode === 'draw' && !signatureBase64) {
      setSignError('Veuillez dessiner votre signature')
      return
    }
    setSigning(true)
    setSignError(null)
    try {
      const res = await fetch('/api/public/signer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signedBy: signedBy.trim(),
          signatureBase64: mode === 'draw' ? signatureBase64 : null,
          mode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSignError(data.error || 'Erreur lors de la signature')
        return
      }
      setSigned(true)
    } catch {
      setSignError('Erreur de connexion, veuillez réessayer')
    } finally {
      setSigning(false)
    }
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-manrope">Chargement du devis...</p>
        </div>
      </div>
    )
  }

  // ─── Error ───
  if (error || !devis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-syne font-bold text-gray-900 mb-2">Lien invalide</h1>
          <p className="text-gray-500 font-manrope">{error || 'Ce devis n\'existe pas ou le lien a expiré.'}</p>
        </div>
      </div>
    )
  }

  // ─── Already signed ───
  if (signed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-syne font-bold text-gray-900 mb-2">Devis signé</h1>
          <p className="text-gray-500 font-manrope mb-4">
            Le devis n° {devis.numero} a été accepté{devis.signed_by ? ` par ${devis.signed_by}` : ''}.
          </p>
          <p className="text-sm text-gray-400 font-manrope">
            {entreprise.nom} a été notifié. Vous pouvez fermer cette page.
          </p>
        </div>
      </div>
    )
  }

  // ─── Main view ───
  const totalHT = devis.montant_ht || 0
  const totalTVA = devis.montant_tva || 0
  const totalTTC = devis.montant_ttc || 0

  // Group lignes by TVA rate for the summary
  const tvaGroups: Record<number, { ht: number; tva: number }> = {}
  lignes.filter(l => l.type === 'prestation' && !l.optionnel).forEach(l => {
    const rate = l.taux_tva || 10
    if (!tvaGroups[rate]) tvaGroups[rate] = { ht: 0, tva: 0 }
    const ht = l.quantite * l.prix_unitaire_ht
    tvaGroups[rate].ht += ht
    tvaGroups[rate].tva += ht * (rate / 100)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {entreprise.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entreprise.logo_url} alt="" className="h-8 object-contain" />
            )}
            <span className="font-syne font-bold text-[#1a1a2e] text-sm">{entreprise.nom || 'Nexartis'}</span>
          </div>
          <span className="text-xs font-manrope text-gray-400">Devis n° {devis.numero}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ═══ DEVIS PREVIEW ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header devis */}
          <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h1 className="font-syne font-bold text-2xl mb-1">DEVIS</h1>
                <p className="font-manrope text-white/70 text-sm">N° {devis.numero}</p>
              </div>
              <div className="text-right font-manrope text-sm">
                {devis.date_emission && <p className="text-white/70">Émis le {formatDate(devis.date_emission)}</p>}
                {devis.date_validite && <p className="text-white/70">Valable jusqu&apos;au {formatDate(devis.date_validite)}</p>}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Objet */}
            {devis.objet && (
              <div>
                <p className="text-xs font-manrope font-semibold text-gray-400 uppercase tracking-wider mb-1">Objet</p>
                <p className="font-manrope text-[#1a1a2e] font-medium">{devis.objet}</p>
              </div>
            )}

            {/* Artisan / Client cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-manrope font-semibold text-blue-500 uppercase tracking-wider mb-2">Artisan</p>
                <p className="font-manrope font-semibold text-[#1a1a2e] text-sm">{entreprise.nom}</p>
                {entreprise.adresse && <p className="font-manrope text-gray-600 text-xs mt-1">{entreprise.adresse}</p>}
                {(entreprise.code_postal || entreprise.ville) && (
                  <p className="font-manrope text-gray-600 text-xs">{entreprise.code_postal} {entreprise.ville}</p>
                )}
                {entreprise.telephone && <p className="font-manrope text-gray-600 text-xs mt-1">{entreprise.telephone}</p>}
                {entreprise.siret && <p className="font-manrope text-gray-400 text-xs mt-1">SIRET : {entreprise.siret}</p>}
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs font-manrope font-semibold text-green-600 uppercase tracking-wider mb-2">Client</p>
                <p className="font-manrope font-semibold text-[#1a1a2e] text-sm">{client.nom}</p>
                {client.adresse && <p className="font-manrope text-gray-600 text-xs mt-1">{client.adresse}</p>}
                {client.telephone && <p className="font-manrope text-gray-600 text-xs mt-1">{client.telephone}</p>}
                {client.email && <p className="font-manrope text-gray-600 text-xs mt-1">{client.email}</p>}
              </div>
            </div>

            {/* Dates supplémentaires */}
            {(devis.date_debut_travaux || devis.duree_estimee) && (
              <div className="flex flex-wrap gap-4 text-sm font-manrope">
                {devis.date_debut_travaux && (
                  <div>
                    <span className="text-gray-400 text-xs">Début des travaux :</span>
                    <span className="ml-2 text-[#1a1a2e] font-medium">{formatDate(devis.date_debut_travaux)}</span>
                  </div>
                )}
                {devis.duree_estimee && (
                  <div>
                    <span className="text-gray-400 text-xs">Durée estimée :</span>
                    <span className="ml-2 text-[#1a1a2e] font-medium">{devis.duree_estimee}</span>
                  </div>
                )}
              </div>
            )}

            {/* Table des lignes */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="py-3 px-3 font-manrope font-semibold text-gray-500 text-xs uppercase tracking-wider">Désignation</th>
                    <th className="py-3 px-3 font-manrope font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Qté</th>
                    <th className="py-3 px-3 font-manrope font-semibold text-gray-500 text-xs uppercase tracking-wider text-right hidden sm:table-cell">Unité</th>
                    <th className="py-3 px-3 font-manrope font-semibold text-gray-500 text-xs uppercase tracking-wider text-right hidden sm:table-cell">P.U. HT</th>
                    <th className="py-3 px-3 font-manrope font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">TVA</th>
                    <th className="py-3 px-3 font-manrope font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((l, i) => {
                    if (l.type === 'section') {
                      return (
                        <tr key={i} className="bg-gray-50">
                          <td colSpan={6} className="py-2 px-3 font-manrope font-bold text-[#1a1a2e] text-xs uppercase tracking-wider">
                            {l.designation}
                          </td>
                        </tr>
                      )
                    }
                    if (l.type === 'commentaire') {
                      return (
                        <tr key={i}>
                          <td colSpan={6} className="py-1 px-3 font-manrope text-gray-500 text-xs italic">
                            {l.designation}
                          </td>
                        </tr>
                      )
                    }
                    if (l.type === 'saut_page') return null
                    const montantHT = l.quantite * l.prix_unitaire_ht
                    return (
                      <tr key={i} className={`border-b border-gray-100 ${l.optionnel ? 'opacity-60' : ''}`}>
                        <td className="py-2.5 px-3 font-manrope text-[#1a1a2e]">
                          {l.designation}
                          {l.optionnel && <span className="ml-2 text-xs text-orange-500 font-medium">(option)</span>}
                        </td>
                        <td className="py-2.5 px-3 font-manrope text-gray-600 text-right">{l.quantite}</td>
                        <td className="py-2.5 px-3 font-manrope text-gray-600 text-right hidden sm:table-cell">{l.unite}</td>
                        <td className="py-2.5 px-3 font-manrope text-gray-600 text-right hidden sm:table-cell">{formatCurrency(l.prix_unitaire_ht)}</td>
                        <td className="py-2.5 px-3 font-manrope text-gray-600 text-right">{l.taux_tva}%</td>
                        <td className="py-2.5 px-3 font-manrope text-[#1a1a2e] font-medium text-right">{formatCurrency(montantHT)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-1">
                <div className="flex justify-between py-1 font-manrope text-sm">
                  <span className="text-gray-500">Total HT</span>
                  <span className="text-[#1a1a2e] font-medium">{formatCurrency(totalHT)}</span>
                </div>
                {Object.entries(tvaGroups).map(([rate, vals]) => (
                  <div key={rate} className="flex justify-between py-1 font-manrope text-sm">
                    <span className="text-gray-500">TVA {rate}%</span>
                    <span className="text-[#1a1a2e]">{formatCurrency(vals.tva)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 font-manrope text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-500">Total TVA</span>
                  <span className="text-[#1a1a2e] font-medium">{formatCurrency(totalTVA)}</span>
                </div>
                <div className="bg-[#2563eb] text-white rounded-lg p-3 flex justify-between items-center mt-2">
                  <span className="font-syne font-bold text-sm">NET À PAYER</span>
                  <span className="font-syne font-bold text-lg">{formatCurrency(totalTTC)}</span>
                </div>
                {/* Acompte */}
                {devis.acompte_pourcent && devis.acompte_pourcent > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-2 space-y-1">
                    <div className="flex justify-between font-manrope text-sm">
                      <span className="text-blue-600 font-medium">Acompte à verser ({devis.acompte_pourcent}%)</span>
                      <span className="text-blue-600 font-semibold">{formatCurrency(totalTTC * devis.acompte_pourcent / 100)}</span>
                    </div>
                    <div className="flex justify-between font-manrope text-xs">
                      <span className="text-gray-500">Reste à facturer</span>
                      <span className="text-gray-700">{formatCurrency(totalTTC - totalTTC * devis.acompte_pourcent / 100)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conditions de paiement */}
            {devis.conditions_paiement && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-manrope font-semibold text-gray-400 uppercase tracking-wider mb-1">Conditions de paiement</p>
                <p className="font-manrope text-gray-700 text-sm">{devis.conditions_paiement}</p>
              </div>
            )}

            {/* Déchets */}
            {devis.dechets_nature && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-manrope font-semibold text-amber-600 uppercase tracking-wider mb-2">Gestion des déchets</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-manrope">
                  {devis.dechets_nature && <p><span className="text-gray-500">Nature :</span> <span className="text-gray-700">{devis.dechets_nature}</span></p>}
                  {devis.dechets_quantite && <p><span className="text-gray-500">Quantité :</span> <span className="text-gray-700">{devis.dechets_quantite}</span></p>}
                  {devis.dechets_responsable && <p><span className="text-gray-500">Responsable :</span> <span className="text-gray-700">{devis.dechets_responsable}</span></p>}
                  {devis.dechets_tri && <p><span className="text-gray-500">Tri :</span> <span className="text-gray-700">{devis.dechets_tri}</span></p>}
                  {devis.dechets_collecte_nom && <p><span className="text-gray-500">Collecteur :</span> <span className="text-gray-700">{devis.dechets_collecte_nom}</span></p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ SECTION SIGNATURE ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-5">
            <div>
              <h2 className="font-syne font-bold text-lg text-[#1a1a2e] mb-1">Signer ce devis</h2>
              <p className="font-manrope text-gray-500 text-sm">
                En signant, vous acceptez les termes et conditions de ce devis.
                {devis.date_validite && ` Ce devis est valable jusqu'au ${formatDate(devis.date_validite)}.`}
              </p>
            </div>

            {/* Nom du signataire */}
            <div>
              <label className="block text-sm font-manrope font-medium text-gray-700 mb-1.5">
                Votre nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                placeholder="Prénom Nom"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-manrope text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Choix du mode de signature */}
            <div>
              <p className="text-sm font-manrope font-medium text-gray-700 mb-3">Choisissez votre mode de signature :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => { setMode('draw'); setSignError(null) }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    mode === 'draw'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === 'draw' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <svg className={`w-5 h-5 ${mode === 'draw' ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-manrope font-semibold text-sm ${mode === 'draw' ? 'text-blue-700' : 'text-gray-700'}`}>Signature manuscrite</p>
                      <p className="font-manrope text-xs text-gray-500">Dessinez votre signature</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => { setMode('approve'); setSignatureBase64(null); setSignError(null) }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    mode === 'approve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === 'approve' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <svg className={`w-5 h-5 ${mode === 'approve' ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-manrope font-semibold text-sm ${mode === 'approve' ? 'text-green-700' : 'text-gray-700'}`}>Approbation directe</p>
                      <p className="font-manrope text-xs text-gray-500">Cliquez pour approuver</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Signature pad (mode draw) */}
            {mode === 'draw' && (
              <SignaturePad
                onSignature={setSignatureBase64}
                onClear={() => setSignatureBase64(null)}
              />
            )}

            {/* Error */}
            {signError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-manrope">{signError}</p>
              </div>
            )}

            {/* Submit button */}
            {mode && (
              <button
                onClick={handleSign}
                disabled={signing}
                className={`w-full py-3.5 rounded-xl font-manrope font-bold text-white text-sm transition-all ${
                  signing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : mode === 'draw'
                      ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                      : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'
                }`}
              >
                {signing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signature en cours...
                  </span>
                ) : mode === 'draw' ? (
                  'Signer ce devis'
                ) : (
                  `J'approuve ce devis — ${formatCurrency(totalTTC)}`
                )}
              </button>
            )}

            {/* Legal text */}
            <p className="text-xs text-gray-400 font-manrope text-center leading-relaxed">
              En signant ce devis, vous reconnaissez avoir pris connaissance de l&apos;ensemble des prestations
              et conditions décrites ci-dessus et vous les acceptez. Cette signature a valeur d&apos;engagement contractuel.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400 font-manrope">
            Propulsé par <a href="https://nexartis.fr" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Nexartis</a>
          </p>
        </div>
      </div>
    </div>
  )
}
