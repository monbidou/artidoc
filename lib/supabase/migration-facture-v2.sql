-- =============================================================
-- Migration V2 — Refonte facture/devis (mai 2026)
-- =============================================================
-- À exécuter dans Supabase SQL Editor.
-- Idempotente : peut être rejouée sans erreur grâce à `IF NOT EXISTS`.
--
-- Buts :
-- 1. Aligner la table `factures` avec `devis` (objet, conditions, acompte, notes personnalisées).
-- 2. Remplacer la sémantique "notes internes" (privées) par "notes personnalisées" (visibles client).
-- 3. Permettre de lier une facture à un chantier (déjà via `chantier_id`, on ajoute juste la documentation).
-- 4. Stocker l'acompte versé sur la facture (montants HT/TTC + libellé).
-- =============================================================

-- ── 1. Champs facture alignés sur devis ────────────────────────
ALTER TABLE factures ADD COLUMN IF NOT EXISTS objet TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS conditions_paiement TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS notes_personnalisees TEXT;
-- `notes_client` et `client_nom` existent déjà côté code ; on s'assure qu'ils sont en DB.
ALTER TABLE factures ADD COLUMN IF NOT EXISTS notes_client TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS client_nom TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS client_adresse TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS client_telephone TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS client_type TEXT; -- 'particulier' | 'professionnel'

-- ── 2. Acompte versé sur la facture ────────────────────────────
ALTER TABLE factures ADD COLUMN IF NOT EXISTS acompte_pourcent NUMERIC(5,2);
ALTER TABLE factures ADD COLUMN IF NOT EXISTS acompte_montant_ht NUMERIC(12,2);
ALTER TABLE factures ADD COLUMN IF NOT EXISTS acompte_montant_ttc NUMERIC(12,2);
ALTER TABLE factures ADD COLUMN IF NOT EXISTS acompte_label TEXT; -- "Acompte versé le 11/05/2026", etc.

-- ── 3. Notes personnalisées (visibles client) sur devis aussi ──
ALTER TABLE devis ADD COLUMN IF NOT EXISTS notes_personnalisees TEXT;

-- ── 4. Commentaires de documentation ──────────────────────────
COMMENT ON COLUMN factures.objet IS 'Objet/intitulé de la facture (peut être lié à un chantier via chantier_id)';
COMMENT ON COLUMN factures.conditions_paiement IS 'Conditions de règlement (pré-remplies : Virement / Chèque / Espèces ≤ 1000€). Modifiables par l''artisan.';
COMMENT ON COLUMN factures.notes_personnalisees IS 'Notes libres visibles sur le PDF client (ex: "Travaux du 11 au 13 mai 2026"). Remplace l''ancien usage de notes_internes.';
COMMENT ON COLUMN factures.acompte_montant_ttc IS 'Montant de l''acompte déjà versé, qui s''affiche dans le récapitulatif (sous-total brut, acompte, reste à payer).';
COMMENT ON COLUMN factures.client_type IS 'particulier ou professionnel — détermine l''affichage de l''indemnité forfaitaire 40 €.';
COMMENT ON COLUMN devis.notes_personnalisees IS 'Notes libres visibles sur le PDF client. Remplace l''ancien usage de notes_internes.';

-- ── 5. Index utiles pour l'audit ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_factures_chantier_id ON factures(chantier_id);
CREATE INDEX IF NOT EXISTS idx_factures_devis_id ON factures(devis_id);

-- =============================================================
-- Migration de données : copie notes_internes -> notes_personnalisees
-- pour ne perdre aucune information existante.
-- =============================================================
UPDATE devis
   SET notes_personnalisees = notes_internes
 WHERE notes_personnalisees IS NULL
   AND notes_internes IS NOT NULL
   AND length(notes_internes) > 0;

-- Note : on NE supprime PAS notes_internes pour ne pas casser le code existant.
-- Une migration de suppression pourra suivre une fois le code stabilisé.
