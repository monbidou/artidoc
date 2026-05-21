/**
 * Helpers transverses Nexartis.
 *
 * NE PAS DUPLIQUER LA LOGIQUE — toute détection de franchise TVA / statut
 * auto-entrepreneur doit passer par `isAutoEntrepreneur(entreprise)`.
 */

/**
 * Détecte si une entreprise est en franchise de TVA (auto-entrepreneur, EI,
 * micro-entreprise). Source de vérité unique — remplace les copies dispersées
 * dans les formulaires devis/facture et les pages de visualisation.
 *
 * Règle :
 *   - Si `franchise_tva === true` (case cochée dans Paramètres) → franchise.
 *   - Sinon, si la forme juridique correspond à une micro-entreprise / EI
 *     / auto-entreprise → franchise (sécurité : l'artisan a oublié de cocher).
 *
 * @param entreprise objet entreprise (ou null/undefined si pas encore chargé)
 * @returns true si l'entreprise est en franchise de TVA
 */
export function isAutoEntrepreneur(
  entreprise:
    | { forme_juridique?: string | null; franchise_tva?: boolean | null }
    | null
    | undefined
): boolean {
  if (!entreprise) return false
  if (entreprise.franchise_tva === true) return true
  const fj = (entreprise.forme_juridique || '').toLowerCase().trim()
  return (
    fj.includes('micro') ||
    fj === 'ei' ||
    fj.includes('entreprise individuelle') ||
    fj.includes('auto')
  )
}
