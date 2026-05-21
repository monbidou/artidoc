'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useSupabaseRecord, updateRow, LoadingSkeleton } from '@/lib/hooks'

interface ClientRecord {
  id: string
  type?: 'particulier' | 'professionnel' | null
  civilite?: string | null
  prenom?: string | null
  nom: string
  raison_sociale?: string | null
  email?: string | null
  telephone?: string | null
  adresse?: string | null
  code_postal?: string | null
  ville?: string | null
  siret?: string | null
  notes_internes?: string | null
}

const CIVILITES = ['', 'M.', 'Mme', 'Mlle']
const inputCls =
  'w-full h-11 rounded-xl border-2 border-[#5ab4e0]/40 px-3 text-sm font-manrope outline-none focus:border-[#5ab4e0] focus:ring-2 focus:ring-[#5ab4e0]/20 transition-all bg-white placeholder:text-gray-400'

export default function ModifierClientPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: client, loading } = useSupabaseRecord<ClientRecord>('clients', id)

  const [type, setType] = useState<'particulier' | 'professionnel'>('particulier')
  const [civilite, setCivilite] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [raisonSociale, setRaisonSociale] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [siret, setSiret] = useState('')
  const [notesInternes, setNotesInternes] = useState('')

  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client || loaded) return
    setType((client.type as 'particulier' | 'professionnel') || 'particulier')
    setCivilite(client.civilite || '')
    setPrenom(client.prenom || '')
    setNom(client.nom || '')
    setRaisonSociale(client.raison_sociale || '')
    setEmail(client.email || '')
    setTelephone(client.telephone || '')
    setAdresse(client.adresse || '')
    setCodePostal(client.code_postal || '')
    setVille(client.ville || '')
    setSiret(client.siret || '')
    setNotesInternes(client.notes_internes || '')
    setLoaded(true)
  }, [client, loaded])

  const handleSave = async () => {
    if (!client) return
    if (!nom.trim()) {
      setError('Le nom est obligatoire.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const values: Record<string, unknown> = {
        type,
        prenom: prenom.trim() || null,
        nom: nom.trim(),
        email: email.trim() || null,
        telephone: telephone.trim() || null,
        adresse: adresse.trim() || null,
        code_postal: codePostal.trim() || null,
        ville: ville.trim() || null,
        siret: siret.trim() || null,
        notes_internes: notesInternes.trim() || null,
      }
      if (civilite) values.civilite = civilite
      if (type === 'professionnel') values.raison_sociale = raisonSociale.trim() || null
      else values.raison_sociale = null

      await updateRow('clients', client.id, values)
      router.push(`/dashboard/clients/${client.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (!client) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/dashboard/clients" className="inline-flex items-center gap-1.5 text-sm font-manrope text-[#6b7280] hover:text-[#1a1a2e]">
          <ArrowLeft size={16} /> Retour aux clients
        </Link>
        <p className="text-sm font-manrope text-gray-500">Client introuvable.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 py-3 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/dashboard/clients/${id}`} className="p-1.5 rounded-md hover:bg-gray-100 flex-shrink-0">
            <ArrowLeft size={18} className="text-[#6b7280]" />
          </Link>
          <h2 className="font-syne font-bold text-base sm:text-lg text-[#1a1a2e] truncate">
            Modifier {`${client.prenom ?? ''} ${client.nom}`.trim() || 'le client'}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/dashboard/clients/${id}`}
            className="h-9 px-3 rounded-xl border-2 border-gray-300 text-sm font-syne font-semibold text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Annuler
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 rounded-xl bg-[#e87a2a] text-white font-syne font-bold text-sm hover:bg-[#f09050] transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Save size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-manrope text-red-700">{error}</div>
        )}

        {/* Type */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Type de client</h3>
          <div className="flex gap-2">
            {(['particulier', 'professionnel'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`h-10 px-4 rounded-xl border-2 text-sm font-syne font-semibold capitalize transition-all ${
                  type === t
                    ? 'border-[#5ab4e0] bg-[#5ab4e0]/10 text-[#0f1a3a]'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Identité */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Identité</h3>

          {type === 'professionnel' && (
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Raison sociale</label>
              <input
                type="text"
                value={raisonSociale}
                onChange={(e) => setRaisonSociale(e.target.value)}
                className={inputCls}
                placeholder="Nom de la société"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-3">
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Civilité</label>
              <select value={civilite} onChange={(e) => setCivilite(e.target.value)} className={inputCls}>
                {CIVILITES.map((c) => (
                  <option key={c} value={c}>{c || '—'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className={inputCls}
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={inputCls}
                placeholder="Nom"
                required
              />
            </div>
          </div>

          {type === 'professionnel' && (
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">SIRET</label>
              <input
                type="text"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                className={inputCls}
                placeholder="14 chiffres"
                maxLength={17}
              />
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="exemple@mail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Téléphone</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className={inputCls}
                placeholder="06 00 00 00 00"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Adresse</h3>
          <div>
            <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Adresse</label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className={inputCls}
              placeholder="N° et rue"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Code postal</label>
              <input
                type="text"
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value)}
                className={inputCls}
                placeholder="33000"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1.5">Ville</label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className={inputCls}
                placeholder="Bordeaux"
              />
            </div>
          </div>
        </div>

        {/* Notes internes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-syne font-bold text-[#0f1a3a] uppercase tracking-wider">Notes internes</h3>
          <textarea
            value={notesInternes}
            onChange={(e) => setNotesInternes(e.target.value)}
            rows={4}
            className="w-full rounded-xl border-2 border-[#5ab4e0]/40 px-3 py-2 text-sm font-manrope outline-none focus:border-[#5ab4e0] focus:ring-2 focus:ring-[#5ab4e0]/20 transition-all bg-white placeholder:text-gray-400 resize-y"
            placeholder="Visible uniquement par vous"
          />
        </div>

        {/* Save bottom mobile */}
        <div className="sm:hidden flex flex-col gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-11 rounded-xl bg-[#e87a2a] text-white font-syne font-bold text-sm hover:bg-[#f09050] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <Link
            href={`/dashboard/clients/${id}`}
            className="h-11 rounded-xl border-2 border-gray-300 text-sm font-syne font-semibold text-gray-600 inline-flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Annuler
          </Link>
        </div>
      </div>
    </div>
  )
}
