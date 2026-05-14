'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Stepper +/- pour la saisie mobile (quantité ligne devis/facture)
// ─────────────────────────────────────────────────────────────────────────────
// Couleurs Nexartis : sky #5ab4e0 pour bordures/accents, navy #0f1a3a pour le chiffre.
// Hauteur de bouton fixée à 44px (h-11) — taille tactile recommandée (Apple HIG).
// Le tap sur "−" en dessous de `min` est ignoré (noop).
// ─────────────────────────────────────────────────────────────────────────────

import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
}

export default function Stepper({ value, onChange, min = 0, step = 1 }: StepperProps) {
  const safeValue = Number.isFinite(value) ? value : 0

  const decrement = () => {
    const next = safeValue - step
    if (next < min) return // noop : on ne descend pas sous le min
    onChange(next)
  }

  const increment = () => {
    onChange(safeValue + step)
  }

  return (
    <div className="flex items-center gap-2 bg-[#f3f4f6] rounded-2xl p-1 h-14 w-full">
      <button
        type="button"
        aria-label="Diminuer"
        onClick={decrement}
        className="h-11 w-11 shrink-0 rounded-xl bg-white border-2 border-[#5ab4e0]/60 grid place-items-center text-[#1a6fb5] active:scale-95 hover:border-[#5ab4e0] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={safeValue <= min}
      >
        <Minus size={20} strokeWidth={3} />
      </button>

      <input
        type="number"
        value={safeValue}
        onChange={e => {
          const n = Number(e.target.value)
          if (Number.isFinite(n) && n >= min) onChange(n)
        }}
        className="flex-1 h-11 text-center font-syne font-extrabold text-2xl text-[#0f1a3a] bg-transparent border-none outline-none w-full min-w-0"
        inputMode="decimal"
      />

      <button
        type="button"
        aria-label="Augmenter"
        onClick={increment}
        className="h-11 w-11 shrink-0 rounded-xl bg-white border-2 border-[#5ab4e0]/60 grid place-items-center text-[#1a6fb5] active:scale-95 hover:border-[#5ab4e0] transition-all"
      >
        <Plus size={20} strokeWidth={3} />
      </button>
    </div>
  )
}
