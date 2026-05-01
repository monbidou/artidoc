'use client'

/**
 * Composant NotesIntervention
 * ----------------------------------------------------------------
 * Permet à l'artisan d'ajouter des notes datées sur une intervention
 * planifiée. 5 types de notes :
 *   • note_client          → note générale visible par le client (PDF)
 *   • presence_requise     → "votre présence est souhaitée"
 *   • presence_obligatoire → "votre présence est OBLIGATOIRE"
 *   • preparation          → "préparer X pour ce jour"
 *   • note_artisan         → note PRIVÉE de l'artisan (jamais affichée
 *                             au client). Affichée dans le widget "À faire"
 *                             du dashboard avec rappel J-1.
 *
 * Réutilisable :
 *   - dans le panel détail intervention du planning
 *   - dans la fiche chantier (vue de toutes les notes du chantier)
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Trash2,
  Loader2,
  StickyNote,
  AlertTriangle,
  Lock,
  Package,
  EyeOff,
  X,
} from 'lucide-react'

// ===================================================================
// Types
// ===================================================================

export type NoteType =
  | 'note_client'
  | 'presence_requise'
  | 'presence_obligatoire'
  | 'preparation'
  | 'note_artisan'

export interface InterventionNote {
  id: string
  user_id: string
  intervention_id: string
  type: NoteType
  texte: string
  created_at: string
  updated_at: string
}

// LucideIcon est un ForwardRefExoticComponent, pas un simple ComponentType.
// Le type le plus permissif compatible est React.ElementType.
type IconComponent = React.ElementType

interface NoteTypeMeta {
  label: string
  shortLabel: string
  icon: IconComponent
  color: string
  bg: string
  border: string
  description: string
}

// Métadonnées d'affichage par type de note
const TYPE_META: Record<NoteType, NoteTypeMeta> = {
  note_client: {
    label: 'Note pour le client',
    shortLabel: 'Note client',
    icon: StickyNote,
    color: '#0f1a3a',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    description: 'Information visible par le client dans le PDF',
  },
  presence_requise: {
    label: 'Présence souhaitée',
    shortLabel: 'Présence souhaitée',
    icon: AlertTriangle,
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fcd34d',
    description: 'Indiquez au client que sa présence est souhaitée ce jour',
  },
  presence_obligatoire: {
    label: 'Présence obligatoire',
    shortLabel: 'Présence obligatoire',
    icon: Lock,
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    description: 'Présence indispensable (réception, signature, etc.)',
  },
  preparation: {
    label: 'À préparer par le client',
    shortLabel: 'À préparer',
    icon: Package,
    color: '#1e40af',
    bg: '#dbeafe',
    border: '#93c5fd',
    description: 'Le client doit préparer quelque chose pour ce jour',
  },
  note_artisan: {
    label: 'Note privée artisan',
    shortLabel: 'Privée',
    icon: EyeOff,
    color: '#581c87',
    bg: '#f3e8ff',
    border: '#d8b4fe',
    description: 'Rappel uniquement pour vous, JAMAIS affiché au client',
  },
}

const TYPES_CLIENT: NoteType[] = ['note_client', 'presence_requise', 'presence_obligatoire', 'preparation']

// ===================================================================
// Composant principal
// ===================================================================

export default function NotesIntervention({
  interventionId,
  compact = false,
  onChange,
}: {
  interventionId: string
  /** Mode compact : ne montre pas les descriptions, plus dense */
  compact?: boolean
  /** Callback appelé après chaque modification (utile pour rafraîchir une liste parente) */
  onChange?: () => void
}) {
  const [notes, setNotes] = useState<InterventionNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [newType, setNewType] = useState<NoteType>('note_client')
  const [newTexte, setNewTexte] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Fetch notes ──
  const fetchNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('intervention_notes_client')
        .select('*')
        .eq('intervention_id', interventionId)
        .order('created_at', { ascending: true })
      if (err) throw err
      setNotes((data as InterventionNote[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [interventionId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // ── Add note ──
  const handleAdd = async () => {
    const txt = newTexte.trim()
    if (!txt) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { error: err } = await supabase
        .from('intervention_notes_client')
        .insert({
          user_id: user.id,
          intervention_id: interventionId,
          type: newType,
          texte: txt,
        })
      if (err) throw err
      setNewTexte('')
      setNewType('note_client')
      setShowForm(false)
      await fetchNotes()
      onChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'ajout')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete note ──
  const handleDelete = async (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('intervention_notes_client')
        .delete()
        .eq('id', noteId)
      if (err) throw err
      await fetchNotes()
      onChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression')
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // Rendu
  // ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      {/* Erreur */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
          <Loader2 size={14} className="animate-spin" />
          Chargement...
        </div>
      )}

      {/* Liste des notes existantes */}
      {!loading && notes.length === 0 && !showForm && (
        <p className="text-xs text-[#94a3b8] italic py-1">
          Aucune note pour cette intervention.
        </p>
      )}

      {!loading && notes.length > 0 && (
        <ul className="space-y-1.5">
          {notes.map((note) => {
            const meta = TYPE_META[note.type]
            const Icon = meta.icon
            return (
              <li
                key={note.id}
                className="flex items-start gap-2 rounded-lg border px-2.5 py-2 group"
                style={{ background: meta.bg, borderColor: meta.border }}
              >
                <Icon size={14} className="flex-shrink-0 mt-0.5" style={{ color: meta.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: meta.color }}
                    >
                      {meta.shortLabel}
                    </span>
                    {note.type === 'note_artisan' && (
                      <span className="text-[9px] text-[#94a3b8]">(privé, non affiché au client)</span>
                    )}
                  </div>
                  <p className="text-xs leading-snug text-[#1e293b] whitespace-pre-wrap break-words">
                    {note.texte}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-white/60 transition-colors text-[#94a3b8] hover:text-[#ef4444] opacity-0 group-hover:opacity-100"
                  title="Supprimer la note"
                  aria-label="Supprimer la note"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Bouton "+ Ajouter une note" */}
      {!showForm && !loading && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5ab4e0] hover:text-[#3a94c0] transition-colors"
        >
          <Plus size={14} />
          Ajouter une note
        </button>
      )}

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="rounded-lg border-2 border-[#5ab4e0]/30 bg-[#5ab4e0]/[.04] p-3 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5ab4e0]">
              Nouvelle note
            </span>
            <button
              onClick={() => {
                setShowForm(false)
                setNewTexte('')
                setNewType('note_client')
                setError(null)
              }}
              className="p-1 rounded hover:bg-white/60 transition-colors text-[#94a3b8] hover:text-[#1e293b]"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Choix du type */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7b8ba3]">
              Type de note
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(TYPE_META) as NoteType[]).map((t) => {
                const meta = TYPE_META[t]
                const Icon = meta.icon
                const active = newType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewType(t)}
                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-all ${
                      active
                        ? 'shadow-sm'
                        : 'bg-white border-[#e6ecf2] text-[#64748b] hover:border-[#5ab4e0]'
                    }`}
                    style={
                      active
                        ? {
                            background: meta.bg,
                            color: meta.color,
                            borderColor: meta.border,
                          }
                        : undefined
                    }
                  >
                    <Icon size={12} />
                    <span className="truncate text-left">{meta.shortLabel}</span>
                  </button>
                )
              })}
            </div>
            {!compact && (
              <p className="text-[10px] text-[#94a3b8] italic">
                {TYPE_META[newType].description}
              </p>
            )}
          </div>

          {/* Texte de la note */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7b8ba3] mb-1">
              Texte
            </label>
            <textarea
              value={newTexte}
              onChange={(e) => setNewTexte(e.target.value.slice(0, 300))}
              rows={2}
              placeholder={
                newType === 'note_artisan'
                  ? 'Ex : Appeler M. Dupont la veille pour confirmer'
                  : newType === 'preparation'
                    ? 'Ex : Vider le garage avant 8h'
                    : newType === 'presence_obligatoire'
                      ? 'Ex : Réception du chantier — signature requise'
                      : newType === 'presence_requise'
                        ? 'Ex : Validation des choix matériaux'
                        : 'Ex : Sortir le véhicule, prévoir un point d\'eau'
              }
              className="w-full rounded-md border border-[#e6ecf2] bg-white px-2.5 py-1.5 text-xs focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0]/20 outline-none transition-all resize-none"
              autoFocus
            />
            <p className="mt-0.5 text-[10px] text-[#94a3b8] text-right">
              {newTexte.length}/300
            </p>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setNewTexte('')
                setNewType('note_client')
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !newTexte.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-[#5ab4e0] hover:bg-[#3a94c0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus size={12} />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export des constantes pour pouvoir les utiliser ailleurs (PDF, dashboard…)
export { TYPE_META, TYPES_CLIENT }
