'use client'

// ─────────────────────────────────────────────────────────────────────────────
// UnitChips — sélecteur d'unité ovale tactile pour la saisie mobile
// ─────────────────────────────────────────────────────────────────────────────
// Remplace le <select> classique (peu maniable au pouce sur smartphone).
// Chips rounded-full ; l'option active prend le fond sky #5ab4e0 et le texte
// blanc. Les options wrap naturellement sur plusieurs lignes via flex-wrap.
// ─────────────────────────────────────────────────────────────────────────────

interface UnitChipsProps {
  value: string
  onChange: (u: string) => void
  options?: string[]
}

const DEFAULT_UNITS = ['U', 'm²', 'm', 'ml', 'h', 'jour', 'forfait', 'lot']

export default function UnitChips({ value, onChange, options }: UnitChipsProps) {
  const units = options && options.length > 0 ? options : DEFAULT_UNITS

  return (
    <div className="flex flex-wrap gap-2">
      {units.map(unit => {
        const active = unit === value
        return (
          <button
            key={unit}
            type="button"
            onClick={() => onChange(unit)}
            className={[
              'px-4 py-2 rounded-full border-2 text-sm font-manrope font-semibold transition-all active:scale-95',
              active
                ? 'bg-[#5ab4e0] text-white border-[#5ab4e0] shadow-sm'
                : 'bg-white text-[#4b5563] border-gray-200 hover:border-[#5ab4e0]/60',
            ].join(' ')}
          >
            {unit}
          </button>
        )
      })}
    </div>
  )
}
