'use client'

import { useState } from 'react'
import {
  Search,
  Users,
  Plus,
  UserPlus,
  X,
  Trash2,
} from 'lucide-react'
import {
  useIntervenants,
  insertRow,
  deleteRow,
  LoadingSkeleton,
  ErrorBanner,
} from '@/lib/hooks'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface Intervenant {
  id: string
  user_id: string
  prenom: string
  nom: string
  telephone: string
  email: string
  metier: string
  type_contrat: 'cdi' | 'cdd' | 'apprenti' | 'interimaire' | 'sous-traitant'
  taux_horaire: number
  niveau_acces: 'proprietaire' | 'compagnon'
  couleur: string
  actif: boolean
  created_at?: string
}

type IntervenantType = 'cdi' | 'cdd' | 'apprenti' | 'interimaire' | 'sous-traitant'
type FilterType = 'tous' | 'employe' | 'interimaire' | 'sous-traitant'

const CONTRAT_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  apprenti: 'Apprenti',
  interimaire: 'Intérimaire',
  'sous-traitant': 'Sous-traitant',
}

const TYPE_LABELS: Record<string, string> = {
  employe: 'Employé',
  interimaire: 'Intérimaire',
  'sous-traitant': 'Sous-traitant',
}

const TYPE_COLORS: Record<string, { badge: string; bg: string }> = {
  employe: { badge: '#5ab4e0', bg: 'bg-blue-100' },
  interimaire: { badge: '#f59e0b', bg: 'bg-amber-100' },
  'sous-traitant': { badge: '#10b981', bg: 'bg-emerald-100' },
}

const AVATAR_COLORS = [
  'bg-[#5ab4e0]',
  'bg-emerald-500',
  'bg-[#e87a2a]',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-indigo-500',
]

function getInitials(prenom: string, nom: string): string {
  return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase()
}

function getAvatarColor(couleur: string | null, id: string): string {
  if (couleur) return couleur
  const index = Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function getTypeFromContrat(typeContrat: IntervenantType): FilterType {
  if (['cdi', 'cdd', 'apprenti'].includes(typeContrat)) return 'employe'
  if (typeContrat === 'interimaire') return 'interimaire'
  if (typeContrat === 'sous-traitant') return 'sous-traitant'
  return 'employe'
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function EquipePage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('tous')
  const [filterMetier, setFilterMetier] = useState<string>('tous')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: intervenants, loading, error, refetch } = useIntervenants()
  const allIntervenants = (intervenants as unknown as Intervenant[])

  // Extract unique métiers, sorted alphabetically
  const uniqueMetiers = Array.from(
    new Set(allIntervenants.map((e) => e.metier).filter(Boolean))
  ).sort()

  // Calculate stats
  const employes = allIntervenants.filter((e) => ['cdi', 'cdd', 'apprenti'].includes(e.type_contrat))
  const interimaires = allIntervenants.filter((e) => e.type_contrat === 'interimaire')
  const sousTraitants = allIntervenants.filter((e) => e.type_contrat === 'sous-traitant')

  // Apply filters
  const filtered = allIntervenants.filter((e) => {
    // Filter by type
    const eType = getTypeFromContrat(e.type_contrat)
    if (filterType !== 'tous' && eType !== filterType) return false

    // Filter by métier
    if (filterMetier !== 'tous' && e.metier !== filterMetier) return false

    // Filter by search
    if (search) {
      const q = search.toLowerCase()
      const fullName = `${e.prenom} ${e.nom}`.toLowerCase()
      return (
        fullName.includes(q) ||
        e.metier.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      )
    }

    return true
  })

  // Modal form state
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    metier: '',
    type_contrat: 'cdi' as IntervenantType,
    niveau_acces: 'compagnon' as Intervenant['niveau_acces'],
  })

  const resetForm = () =>
    setForm({ prenom: '', nom: '', email: '', telephone: '', metier: '', type_contrat: 'cdi', niveau_acces: 'compagnon' })

  const handleCreate = async () => {
    setSaving(true)
    try {
      await insertRow('intervenants', {
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        metier: form.metier,
        type_contrat: form.type_contrat,
        niveau_acces: form.niveau_acces,
        taux_horaire: null,
        couleur: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        actif: true,
      })
      refetch()
      setShowModal(false)
      resetForm()
    } catch {
      // error handled silently
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRow('intervenants', id)
      refetch()
    } catch {
      // error handled silently
    } finally {
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorBanner message={error} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-syne font-bold text-[#0f1a3a]">Mon équipe</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-[#f59e0b] hover:bg-[#f08c1c] text-white text-sm font-syne font-bold transition-colors"
        >
          <Plus size={16} />
          Ajouter un membre
        </button>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <div className="px-3 py-1.5 rounded-full bg-blue-100 text-sm font-manrope text-[#0f1a3a]">
          <span className="font-semibold">{employes.length}</span> employé{employes.length !== 1 ? 's' : ''}
        </div>
        <div className="px-3 py-1.5 rounded-full bg-amber-100 text-sm font-manrope text-[#0f1a3a]">
          <span className="font-semibold">{interimaires.length}</span> intérimaire{interimaires.length !== 1 ? 's' : ''}
        </div>
        <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-sm font-manrope text-[#0f1a3a]">
          <span className="font-semibold">{sousTraitants.length}</span> sous-traitant{sousTraitants.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-200 pl-9 pr-4 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none transition-colors"
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm font-manrope text-[#1a1a2e] focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none transition-colors"
        >
          <option value="tous">Tous les types</option>
          <option value="employe">Employés</option>
          <option value="interimaire">Intérimaires</option>
          <option value="sous-traitant">Sous-traitants</option>
        </select>

        {/* Métier filter */}
        <select
          value={filterMetier}
          onChange={(e) => setFilterMetier(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm font-manrope text-[#1a1a2e] focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none transition-colors"
        >
          <option value="tous">Tous les métiers</option>
          {uniqueMetiers.map((metier) => (
            <option key={metier} value={metier}>
              {metier}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Avatar</th>
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Contrat</th>
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Métier</th>
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Téléphone</th>
              <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((intervenant, idx) => {
              const type = getTypeFromContrat(intervenant.type_contrat)
              const typeColor = TYPE_COLORS[type]
              return (
                <tr
                  key={intervenant.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    idx % 2 === 1 ? 'bg-[#f8f9fa]' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(intervenant.couleur, intervenant.id)} flex items-center justify-center text-white text-xs font-syne font-bold`}>
                      {getInitials(intervenant.prenom, intervenant.nom)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-manrope font-semibold text-[#1a1a2e]">{intervenant.nom}</p>
                      <p className="text-xs font-manrope text-gray-500">{intervenant.prenom}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-syne font-bold text-white"
                      style={{ backgroundColor: typeColor.badge }}
                    >
                      {TYPE_LABELS[type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-manrope text-gray-600">
                    {CONTRAT_LABELS[intervenant.type_contrat] || intervenant.type_contrat}
                  </td>
                  <td className="px-4 py-3 text-sm font-manrope text-gray-600">{intervenant.metier}</td>
                  <td className="px-4 py-3 text-sm font-manrope text-gray-600">{intervenant.email}</td>
                  <td className="px-4 py-3 text-sm font-manrope text-gray-600">{intervenant.telephone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {intervenant.niveau_acces === 'compagnon' && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5ab4e0] text-[#5ab4e0] hover:bg-[#5ab4e0] hover:text-white text-xs font-syne font-bold transition-colors">
                          <UserPlus size={13} />
                          Inviter
                        </button>
                      )}
                      {deleteConfirm === intervenant.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(intervenant.id)}
                            className="px-2 py-1 rounded bg-red-500 text-white text-xs font-syne font-bold hover:bg-red-600 transition-colors"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 rounded bg-gray-200 text-gray-600 text-xs font-syne font-bold hover:bg-gray-300 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(intervenant.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-manrope text-gray-500">Aucun membre trouvé</p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((intervenant) => {
          const type = getTypeFromContrat(intervenant.type_contrat)
          const typeColor = TYPE_COLORS[type]
          return (
            <div
              key={intervenant.id}
              className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
            >
              {/* Line 1: Avatar + Nom Prénom + Type badge */}
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(intervenant.couleur, intervenant.id)} flex items-center justify-center text-white text-sm font-syne font-bold flex-shrink-0`}>
                    {getInitials(intervenant.prenom, intervenant.nom)}
                  </div>
                  <div>
                    <p className="text-sm font-manrope font-semibold text-[#1a1a2e]">
                      {intervenant.nom} {intervenant.prenom}
                    </p>
                  </div>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-syne font-bold text-white whitespace-nowrap"
                  style={{ backgroundColor: typeColor.badge }}
                >
                  {TYPE_LABELS[type]}
                </span>
              </div>

              {/* Line 2: Métier · Contrat */}
              <div className="text-xs font-manrope text-gray-500">
                {intervenant.metier} · {CONTRAT_LABELS[intervenant.type_contrat] || intervenant.type_contrat}
              </div>

              {/* Line 3: Email */}
              <div className="text-xs font-manrope text-gray-600">{intervenant.email}</div>

              {/* Line 4: Téléphone */}
              <div className="text-xs font-manrope text-gray-600">{intervenant.telephone}</div>

              {/* Line 5: Actions */}
              <div className="flex items-center gap-2 pt-2">
                {intervenant.niveau_acces === 'compagnon' && (
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5ab4e0] text-[#5ab4e0] hover:bg-[#5ab4e0] hover:text-white text-xs font-syne font-bold transition-colors">
                    <UserPlus size={13} />
                    Inviter
                  </button>
                )}
                {deleteConfirm === intervenant.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => handleDelete(intervenant.id)}
                      className="flex-1 px-2 py-1 rounded bg-red-500 text-white text-xs font-syne font-bold hover:bg-red-600 transition-colors"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-2 py-1 rounded bg-gray-200 text-gray-600 text-xs font-syne font-bold hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(intervenant.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-manrope text-gray-500">Aucun membre trouvé</p>
          </div>
        )}
      </div>

      {/* Modal: Ajouter un membre */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-syne font-bold text-[#0f1a3a]">Ajouter un membre</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Type select first */}
            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1">Type *</label>
              <select
                value={form.type_contrat}
                onChange={(e) => setForm({ ...form, type_contrat: e.target.value as IntervenantType })}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
              >
                <option value="cdi">Employé (CDI)</option>
                <option value="cdd">Employé (CDD)</option>
                <option value="apprenti">Apprenti</option>
                <option value="interimaire">Intérimaire</option>
                <option value="sous-traitant">Sous-traitant</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1">Prénom</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1">Métier</label>
              <input
                type="text"
                value={form.metier}
                onChange={(e) => setForm({ ...form, metier: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-manrope font-semibold text-gray-500 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-syne font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.prenom || !form.nom}
                className="h-10 px-5 rounded-lg bg-[#f59e0b] hover:bg-[#f08c1c] disabled:opacity-50 text-white text-sm font-syne font-bold transition-colors"
              >
                {saving ? 'Enregistrement...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
