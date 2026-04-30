// -------------------------------------------------------------------
// Numerotation hierarchique automatique des lignes de devis/facture
// Style Obat :
//   Section            -> "1", "2", "3"...
//   Sous-section       -> "1.1", "1.2"...
//   Prestation         -> "1.1" (dans section) ou "1.1.1" (dans sous-section)
//   commentaire / saut -> ""
// -------------------------------------------------------------------

export type LigneType = 'section' | 'sous_section' | 'prestation' | 'commentaire' | 'saut_page' | undefined | null

export interface LigneNumerotable {
  type?: LigneType
  numero?: string
  // autres champs preserves
  // no extra constraint
}

/**
 * Calcule le numero hierarchique de chaque ligne et renvoie une nouvelle
 * liste avec le champ `numero` rempli. Les autres champs sont preserves.
 */
export function computeHierarchicalNumbers<T extends LigneNumerotable>(lignes: T[]): Array<T & { numero: string }> {
  let secIdx = 0
  let subIdx = 0
  let leafIdx = 0
  let flatIdx = 0
  let inSection = false
  let inSubsection = false

  return lignes.map((l) => {
    const type = l.type as LigneType

    if (type === 'commentaire' || type === 'saut_page') {
      return { ...l, numero: '' }
    }

    if (type === 'section') {
      secIdx++
      subIdx = 0
      leafIdx = 0
      inSection = true
      inSubsection = false
      return { ...l, numero: `${secIdx}` }
    }

    if (type === 'sous_section') {
      if (!inSection) {
        // sous-section orpheline : on la traite comme une section
        secIdx++
        subIdx = 0
        leafIdx = 0
        inSection = true
        inSubsection = true
        return { ...l, numero: `${secIdx}` }
      }
      subIdx++
      leafIdx = 0
      inSubsection = true
      return { ...l, numero: `${secIdx}.${subIdx}` }
    }

    // type === 'prestation' (ou undefined/null = ancien format)
    if (!inSection) {
      flatIdx++
      return { ...l, numero: `${flatIdx}` }
    }

    if (inSubsection) {
      leafIdx++
      return { ...l, numero: `${secIdx}.${subIdx}.${leafIdx}` }
    }

    subIdx++
    return { ...l, numero: `${secIdx}.${subIdx}` }
  })
}
