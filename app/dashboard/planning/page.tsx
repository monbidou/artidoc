'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import {
  usePlanning,
  useIntervenants,
  useClients,
  useChantiers,
  insertRow,
  LoadingSkeleton,
  ErrorBanner,
} from '@/lib/hooks'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type ViewMode = 'Jour' | 'Semaine' | 'Mois'
type Creneau = 'Matin 8h-12h' | 'Après-midi 13h-17h' | 'Journée 8h-17h'

// Color palette for intervenants
const COLORS = [
  { bg: 'bg-sky-50', border: 'border-[#5ab4e0]', badge: 'bg-[#5ab4e0]', text: 'text-[#5ab4e0]' },
  { bg: 'bg-emerald-50', border: 'border-emerald-500', badge: 'bg-emerald-500', text: 'text-emerald-600' },
  { bg: 'bg-orange-50', border: 'border-[#e87a2a]', badge: 'bg-[#e87a2a]', text: 'text-[#e87a2a]' },
  { bg: 'bg-purple-50', border: 'border-purple-500', badge: 'bg-violet-500', text: 'text-purple-600' },
  { bg: 'bg-rose-50', border: 'border-rose-500', badge: 'bg-rose-500', text: 'text-rose-600' },
  { bg: 'bg-amber-50', border: 'border-amber-500', badge: 'bg-amber-500', text: 'text-amber-600' },
]

function getInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

function creneauToTimes(creneau: Creneau): { start: string; end: string } {
  switch (creneau) {
    case 'Matin 8h-12h': return { start: '08:00', end: '12:00' }
    case 'Après-midi 13h-17h': return { start: '13:00', end: '17:00' }
    case 'Journée 8h-17h': return { start: '08:00', end: '17:00' }
  }
}

function timeToLabel(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getHours()}h`
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function PlanningPage() {
  const { data: planningData, loading: loadingPlanning, error: errorPlanning, refetch } = usePlanning()
  const { data: intervenants, loading: loadingIntervenants, error: errorIntervenants } = useIntervenants()
  const { data: clients, loading: loadingClients, error: errorClients } = useClients()
  const { data: chantiers, loading: loadingChantiers } = useChantiers()

  const [viewMode, setViewMode] = useState<ViewMode>('Semaine')
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [showModal, setShowModal] = useState(false)
  const [modalClientId, setModalClientId] = useState('')
  const [modalIntervenantId, setModalIntervenantId] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalCreneau, setModalCreneau] = useState<Creneau>('Journée 8h-17h')
  const [modalObjet, setModalObjet] = useState('')
  const [modalChantierId, setModalChantierId] = useState('')
  const [conflictStatus, setConflictStatus] = useState<'none' | 'ok' | 'conflict'>('none')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Build week days
  const weekDays = useMemo(() => {
    const days: { label: string; date: Date; dateStr: string }[] = []
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      days.push({ label: dayNames[i], date: d, dateStr: formatDateISO(d) })
    }
    return days
  }, [weekStart])

  // Map intervenant_id -> color
  const intervenantColors = useMemo(() => {
    const map = new Map<string, typeof COLORS[0]>()
    intervenants.forEach((iv, i) => {
      map.set(iv.id as string, COLORS[i % COLORS.length])
    })
    return map
  }, [intervenants])

  // Map client_id -> name
  const clientMap = useMemo(() => {
    const map = new Map<string, string>()
    clients.forEach((c) => {
      const nom = (c as Record<string, unknown>).nom as string ?? ''
      const prenom = (c as Record<string, unknown>).prenom as string ?? ''
      map.set((c as Record<string, unknown>).id as string, `${prenom} ${nom}`.trim())
    })
    return map
  }, [clients])

  // Map planning by intervenant_id + dateStr
  const planningMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>[]>()
    for (const item of planningData) {
      const rec = item as Record<string, unknown>
      const ivId = rec.intervenant_id as string
      const dateDebut = rec.date_debut as string
      if (!dateDebut) continue
      const dateStr = dateDebut.split('T')[0]
      const key = `${ivId}__${dateStr}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(rec)
    }
    return map
  }, [planningData])

  const resetModal = () => {
    setModalClientId('')
    setModalIntervenantId('')
    setModalDate('')
    setModalCreneau('Journée 8h-17h')
    setModalObjet('')
    setModalChantierId('')
    setConflictStatus('none')
    setSubmitError(null)
  }

  const openModal = () => {
    resetModal()
    setShowModal(true)
  }

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const weekEndDate = new Date(weekStart)
  weekEndDate.setDate(weekEndDate.getDate() + 4)

  const checkConflicts = () => {
    if (!modalIntervenantId || !modalDate) {
      setConflictStatus('none')
      return
    }
    const { start, end } = creneauToTimes(modalCreneau)
    const newStart = new Date(`${modalDate}T${start}:00`)
    const newEnd = new Date(`${modalDate}T${end}:00`)

    const hasConflict = planningData.some((item) => {
      const rec = item as Record<string, unknown>
      if (rec.intervenant_id !== modalIntervenantId) return false
      const existStart = new Date(rec.date_debut as string)
      const existEnd = new Date(rec.date_fin as string)
      // Overlap: newStart < existEnd AND newEnd > existStart
      return newStart < existEnd && newEnd > existStart
    })

    setConflictStatus(hasConflict ? 'conflict' : 'ok')
  }

  const handleSubmit = async () => {
    if (!modalIntervenantId || !modalDate || !modalObjet) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { start, end } = creneauToTimes(modalCreneau)
      await insertRow('planning_interventions', {
        intervenant_id: modalIntervenantId,
        client_id: modalClientId || null,
        chantier_id: modalChantierId || null,
        date_debut: `${modalDate}T${start}:00`,
        date_fin: `${modalDate}T${end}:00`,
        objet: modalObjet,
      })
      refetch()
      setShowModal(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la creation')
    } finally {
      setSubmitting(false)
    }
  }

  const loading = loadingPlanning || loadingIntervenants || loadingClients || loadingChantiers
  const error = errorPlanning || errorIntervenants || errorClients

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorBanner message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* View toggle */}
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          {(['Jour', 'Semaine', 'Mois'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-sm font-syne font-bold transition-colors ${
                viewMode === mode
                  ? 'bg-gray-100 text-[#0f1a3a]'
                  : 'bg-white text-[#6b7280] hover:text-[#1a1a2e]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <button
            onClick={prevWeek}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-manrope text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
          >
            <ChevronLeft size={16} />
            Sem. precedente
          </button>
          <span className="flex items-center gap-1.5 px-3 py-2 text-sm font-syne font-bold text-[#0f1a3a]">
            <CalendarDays size={16} className="text-[#5ab4e0]" />
            Sem. du {weekStart.getDate()} au {weekEndDate.getDate()} {weekEndDate.toLocaleString('fr-FR', { month: 'long' })} {weekEndDate.getFullYear()}
          </span>
          <button
            onClick={nextWeek}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-manrope text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
          >
            Sem. suivante
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-[#e87a2a] hover:bg-[#f09050] text-white text-sm font-syne font-bold transition-colors"
        >
          <Plus size={16} />
          Ajouter une intervention
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {intervenants.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-manrope text-[#6b7280]">Aucun intervenant configure. Ajoutez des intervenants pour utiliser le planning.</p>
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-manrope font-semibold uppercase tracking-wider text-gray-500 w-[140px] border-r border-gray-200">
                  Equipe
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.dateStr}
                    className="px-3 py-3 text-center text-xs font-syne font-semibold text-gray-500 border-r border-gray-100 last:border-r-0"
                  >
                    <span className="block text-[#0f1a3a] font-bold text-sm">{day.label} {day.date.getDate()}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {intervenants.map((member, mIdx) => {
                const rec = member as Record<string, unknown>
                const ivId = rec.id as string
                const nom = (rec.nom as string) ?? ''
                const prenom = (rec.prenom as string) ?? ''
                const fullName = `${prenom} ${nom}`.trim()
                const initials = getInitials(fullName || 'NN')
                const color = intervenantColors.get(ivId) ?? COLORS[0]

                return (
                  <tr
                    key={ivId}
                    className={`border-b border-gray-100 ${mIdx % 2 === 1 ? 'bg-[#f8f9fa]' : ''}`}
                  >
                    {/* Name column */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${color.badge} flex items-center justify-center text-white text-xs font-syne font-bold`}>
                          {initials}
                        </div>
                        <span className="text-sm font-manrope font-semibold text-[#1a1a2e]">{fullName}</span>
                      </div>
                    </td>
                    {/* Day columns */}
                    {weekDays.map((day) => {
                      const key = `${ivId}__${day.dateStr}`
                      const interventions = planningMap.get(key) ?? []
                      return (
                        <td
                          key={day.dateStr}
                          className="px-2 py-2 border-r border-gray-100 last:border-r-0 min-h-[100px] h-[100px] align-top"
                        >
                          {interventions.length > 0 ? (
                            <div className="space-y-1">
                              {interventions.map((intervention) => {
                                const clientName = clientMap.get(intervention.client_id as string) ?? ''
                                const objet = (intervention.objet as string) ?? ''
                                const horaires = `${timeToLabel(intervention.date_debut as string)}-${timeToLabel(intervention.date_fin as string)}`
                                return (
                                  <div
                                    key={intervention.id as string}
                                    className={`rounded-lg p-2.5 ${color.bg} border-l-4 ${color.border} cursor-pointer hover:shadow-sm transition-shadow`}
                                  >
                                    <p className="text-[15px] font-manrope font-bold text-[#0f1a3a] leading-tight">{clientName}</p>
                                    <p className={`text-[13px] font-manrope ${color.text} mt-0.5`}>{objet}</p>
                                    <p className="text-[12px] font-manrope text-[#6b7280] mt-0.5">{horaires}</p>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="group h-full min-h-[80px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                              <button
                                onClick={openModal}
                                className="text-gray-300 group-hover:text-[#5ab4e0] transition-colors"
                              >
                                <Plus size={20} />
                              </button>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add intervention modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5">
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-syne font-bold text-[#0f1a3a]">Nouvelle intervention</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Client</label>
              <select
                value={modalClientId}
                onChange={(e) => setModalClientId(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((c) => {
                  const cr = c as Record<string, unknown>
                  const nom = (cr.nom as string) ?? ''
                  const prenom = (cr.prenom as string) ?? ''
                  return (
                    <option key={cr.id as string} value={cr.id as string}>
                      {`${prenom} ${nom}`.trim()}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Intervenant */}
            <div>
              <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Intervenant</label>
              <select
                value={modalIntervenantId}
                onChange={(e) => { setModalIntervenantId(e.target.value); setConflictStatus('none') }}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
              >
                <option value="">Sélectionner un intervenant...</option>
                {intervenants.map((m) => {
                  const mr = m as Record<string, unknown>
                  const nom = (mr.nom as string) ?? ''
                  const prenom = (mr.prenom as string) ?? ''
                  return (
                    <option key={mr.id as string} value={mr.id as string}>
                      {`${prenom} ${nom}`.trim()}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Chantier */}
            <div>
              <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Chantier (optionnel)</label>
              <select
                value={modalChantierId}
                onChange={(e) => setModalChantierId(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
              >
                <option value="">Aucun chantier</option>
                {chantiers.map((ch) => {
                  const cr = ch as Record<string, unknown>
                  return (
                    <option key={cr.id as string} value={cr.id as string}>
                      {(cr.nom as string) ?? (cr.reference as string) ?? cr.id}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Date</label>
              <input
                type="date"
                value={modalDate}
                onChange={(e) => { setModalDate(e.target.value); setConflictStatus('none') }}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
              />
            </div>

            {/* Creneau */}
            <div>
              <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Creneau</label>
              <div className="flex gap-2">
                {(['Matin 8h-12h', 'Après-midi 13h-17h', 'Journée 8h-17h'] as Creneau[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => { setModalCreneau(c); setConflictStatus('none') }}
                    className={`flex-1 py-2 rounded-lg border text-sm font-manrope transition-colors ${
                      modalCreneau === c
                        ? 'border-[#5ab4e0] bg-sky-50 text-[#0f1a3a] font-medium'
                        : 'border-gray-200 text-[#6b7280] hover:border-gray-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Objet */}
            <div>
              <label className="block text-sm font-manrope font-medium text-[#1a1a2e] mb-1">Objet des travaux</label>
              <input
                type="text"
                value={modalObjet}
                onChange={(e) => setModalObjet(e.target.value)}
                placeholder="Ex: Installation chauffe-eau"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-manrope focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none"
              />
            </div>

            {/* Conflict check */}
            <div>
              <button
                onClick={checkConflicts}
                className="text-sm font-manrope font-medium text-[#5ab4e0] hover:text-[#0f1a3a] transition-colors"
              >
                Verifier les conflits
              </button>
              {conflictStatus === 'ok' && (
                <div className="flex items-center gap-1.5 mt-2 text-sm font-manrope text-green-600">
                  <CheckCircle2 size={16} />
                  Aucun conflit
                </div>
              )}
              {conflictStatus === 'conflict' && (
                <div className="flex items-center gap-1.5 mt-2 text-sm font-manrope text-red-600">
                  <AlertTriangle size={16} />
                  Conflit detecte : cet intervenant a deja une intervention sur ce creneau
                </div>
              )}
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600 font-manrope">{submitError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 h-10 rounded-lg border border-gray-200 text-sm font-syne font-bold text-[#6b7280] hover:text-[#1a1a2e] hover:border-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !modalIntervenantId || !modalDate || !modalObjet}
                className="px-5 h-10 rounded-lg bg-[#e87a2a] hover:bg-[#f09050] text-white text-sm font-syne font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
