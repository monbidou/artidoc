'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, RefreshCw, Crown, Clock, Ban, CheckCircle, Users, Search } from 'lucide-react'
import { useUser } from '@/lib/hooks'

const ADMIN_EMAIL = 'admin@nexartis.fr'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface UserRecord {
  id: string
  user_id: string
  nom: string
  auth_email: string
  email: string
  telephone: string
  metier: string
  ville: string
  abonnement_type: 'trial' | 'lifetime' | 'actif' | 'suspendu'
  trial_started_at: string
  abonnement_expire_at: string | null
  notes_admin: string | null
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function trialDaysLeft(trialStarted: string): number {
  const start = new Date(trialStarted)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, 14 - diffDays)
}

const ABONNEMENT_CONFIG = {
  trial: {
    label: 'Essai',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock,
  },
  lifetime: {
    label: 'À vie',
    color: 'bg-purple-100 text-purple-800',
    icon: Crown,
  },
  actif: {
    label: 'Actif',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  suspendu: {
    label: 'Suspendu',
    color: 'bg-red-100 text-red-700',
    icon: Ban,
  },
}

// -------------------------------------------------------------------
// Composant badge statut
// -------------------------------------------------------------------

function AbonnementBadge({ type, trialStarted }: { type: string; trialStarted: string }) {
  const config = ABONNEMENT_CONFIG[type as keyof typeof ABONNEMENT_CONFIG] ?? ABONNEMENT_CONFIG.trial
  const Icon = config.icon
  const daysLeft = type === 'trial' ? trialDaysLeft(trialStarted) : null

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={11} />
      {config.label}
      {daysLeft !== null && (
        <span className="ml-0.5 opacity-80">({daysLeft}j restants)</span>
      )}
    </span>
  )
}

// -------------------------------------------------------------------
// Composant modal de gestion
// -------------------------------------------------------------------

function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: UserRecord
  onClose: () => void
  onSave: (id: string, type: string, notes: string) => Promise<void>
}) {
  const [type, setType] = useState(user.abonnement_type)
  const [notes, setNotes] = useState(user.notes_admin ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(user.id, type, notes)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Shield size={18} className="text-[#2563eb]" />
          </div>
          <div>
            <div className="font-syne font-bold text-[#1a1a2e] text-base">{user.nom}</div>
            <div className="text-xs text-gray-400 font-manrope">{user.auth_email}</div>
          </div>
        </div>

        {/* Infos */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs font-manrope text-gray-500 bg-gray-50 rounded-xl p-3">
            <div><span className="font-semibold text-gray-700">Métier</span><br />{user.metier || '—'}</div>
            <div><span className="font-semibold text-gray-700">Ville</span><br />{user.ville || '—'}</div>
            <div><span className="font-semibold text-gray-700">Inscrit le</span><br />{formatDate(user.created_at)}</div>
            <div><span className="font-semibold text-gray-700">Dernière connexion</span><br />{formatDate(user.last_sign_in_at)}</div>
          </div>

          {/* Sélecteur abonnement */}
          <div>
            <label className="block text-sm font-manrope font-semibold text-[#1a1a2e] mb-2">
              Type d&apos;abonnement
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ABONNEMENT_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button
                    key={key}
                    onClick={() => setType(key as UserRecord['abonnement_type'])}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-manrope transition-all ${
                      type === key
                        ? 'border-[#2563eb] bg-blue-50 text-[#2563eb] font-semibold'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {cfg.label}
                    {key === 'lifetime' && <Crown size={11} className="text-purple-500 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes admin */}
          <div>
            <label className="block text-sm font-manrope font-semibold text-[#1a1a2e] mb-1.5">
              Notes (visibles uniquement par vous)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: ami testeur, ne pas facturer..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-manrope text-[#1a1a2e] resize-none focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-manrope text-gray-500 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-manrope font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// Page principale
// -------------------------------------------------------------------

export default function AdminPage() {
  const { user, loading: loadingUser } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Sécurité : seul l'admin peut accéder
  useEffect(() => {
    if (!loadingUser && user?.email !== ADMIN_EMAIL) {
      router.replace('/dashboard')
    }
  }, [user, loadingUser, router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Erreur chargement')
      const json = await res.json()
      setUsers(json.users ?? [])
    } catch {
      setToast('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) fetchUsers()
  }, [user, fetchUsers])

  async function handleSave(entrepriseId: string, abonnementType: string, notes: string) {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entreprise_id: entrepriseId, abonnement_type: abonnementType, notes_admin: notes }),
    })
    if (res.ok) {
      setToast('Abonnement mis à jour ✓')
      fetchUsers()
      setTimeout(() => setToast(null), 3000)
    } else {
      setToast('Erreur lors de la mise à jour')
    }
  }

  if (loadingUser || user?.email !== ADMIN_EMAIL) return null

  // Filtrage par recherche
  const filtered = users.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.auth_email?.toLowerCase().includes(search.toLowerCase()) ||
    u.metier?.toLowerCase().includes(search.toLowerCase()) ||
    u.ville?.toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const stats = {
    total: users.length,
    trial: users.filter(u => u.abonnement_type === 'trial').length,
    lifetime: users.filter(u => u.abonnement_type === 'lifetime').length,
    actif: users.filter(u => u.abonnement_type === 'actif').length,
    suspendu: users.filter(u => u.abonnement_type === 'suspendu').length,
  }

  return (
    <div className="min-h-screen">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield size={18} className="text-[#2563eb]" />
          </div>
          <div>
            <h1 className="font-syne font-bold text-xl text-[#1a1a2e]">Panneau Admin</h1>
            <p className="text-xs text-gray-400 font-manrope">Gestion des utilisateurs Nexartis</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 text-sm font-manrope bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-[#1a1a2e]"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#1a1a2e]', bg: 'bg-white', icon: Users },
          { label: 'En essai', value: stats.trial, color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
          { label: 'À vie', value: stats.lifetime, color: 'text-purple-700', bg: 'bg-purple-50', icon: Crown },
          { label: 'Actif', value: stats.actif, color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`${stat.bg} rounded-xl border border-gray-100 p-4 flex items-center gap-3`}>
              <Icon size={20} className={stat.color} />
              <div>
                <div className={`font-syne font-bold text-xl ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 font-manrope">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, email, métier, ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-manrope text-[#1a1a2e] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/30 bg-white"
        />
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 font-manrope">
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 font-manrope">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Métier</th>
                  <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-gray-500 uppercase tracking-wider">Abonnement</th>
                  <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Inscrit</th>
                  <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Dernière connexion</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-manrope font-semibold text-sm text-[#1a1a2e]">{u.nom || '—'}</div>
                      {u.ville && <div className="text-xs text-gray-400">{u.ville}</div>}
                      {u.notes_admin && (
                        <div className="text-xs text-purple-500 mt-0.5 italic truncate max-w-[160px]">{u.notes_admin}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-sm font-manrope text-gray-600 truncate max-w-[180px]">{u.auth_email}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm font-manrope text-gray-500">{u.metier || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <AbonnementBadge type={u.abonnement_type} trialStarted={u.trial_started_at} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm font-manrope text-gray-400">{formatDate(u.created_at)}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm font-manrope text-gray-400">{formatDate(u.last_sign_in_at)}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 text-xs font-manrope font-medium bg-[#2563eb]/10 text-[#2563eb] rounded-lg hover:bg-[#2563eb]/20 transition"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal gestion utilisateur */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a2e] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-manrope z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
