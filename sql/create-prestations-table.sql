-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : Création de la table `prestations`
-- ═══════════════════════════════════════════════════════════════════════════
--
-- CONTEXTE : la page /dashboard/prestations insérait par erreur dans la table
-- `chantiers`, polluant la liste des chantiers réels de l'utilisateur. Le
-- correctif côté code utilise désormais la table `prestations` qui DOIT exister.
-- Cette migration la crée avec RLS activée et policies multi-tenants.
--
-- ⚠️ À EXÉCUTER AVANT de déployer le code corrigé. Sinon la page prestations
-- crashera avec "table prestations does not exist".
--
-- Procédure : Supabase → SQL Editor → New Query → coller ce fichier → Run.
-- Idempotent : peut être lancé plusieurs fois sans erreur.
--
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS prestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  prix_unitaire NUMERIC(10, 2),
  unite TEXT,
  taux_tva NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Index pour accélérer la recherche par user_id (multi-tenant)
CREATE INDEX IF NOT EXISTS prestations_user_id_idx ON prestations(user_id);

-- Index pour la recherche par titre (autocomplétion)
CREATE INDEX IF NOT EXISTS prestations_titre_idx ON prestations(user_id, titre);

-- Index pour le filtre soft-delete
CREATE INDEX IF NOT EXISTS prestations_deleted_at_idx ON prestations(user_id, deleted_at);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_prestations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prestations_updated_at_trigger ON prestations;
CREATE TRIGGER prestations_updated_at_trigger
  BEFORE UPDATE ON prestations
  FOR EACH ROW EXECUTE FUNCTION update_prestations_updated_at();

-- ─── RLS (Row Level Security) ─────────────────────────────────────────────
ALTER TABLE prestations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prestations_select_own" ON prestations;
DROP POLICY IF EXISTS "prestations_insert_own" ON prestations;
DROP POLICY IF EXISTS "prestations_update_own" ON prestations;
DROP POLICY IF EXISTS "prestations_delete_own" ON prestations;

CREATE POLICY "prestations_select_own"
  ON prestations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "prestations_insert_own"
  ON prestations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prestations_update_own"
  ON prestations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prestations_delete_own"
  ON prestations FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Commentaires de documentation ────────────────────────────────────────
COMMENT ON TABLE prestations IS
  'Catalogue personnel de prestations de l''artisan. Sert d''autocomplétion lors de la création de devis/factures. Multi-tenant via user_id + RLS.';
COMMENT ON COLUMN prestations.titre IS 'Libellé court de la prestation (ex: "Installation tableau électrique")';
COMMENT ON COLUMN prestations.description IS 'Description détaillée optionnelle (ex: "Norme NFC 15-100, tableau 3 rangées 13 modules")';
COMMENT ON COLUMN prestations.prix_unitaire IS 'Prix HT unitaire par défaut (peut être surchargé dans le devis)';
COMMENT ON COLUMN prestations.unite IS 'Unité de mesure (forfait, m², ml, h, jour, etc.)';
COMMENT ON COLUMN prestations.taux_tva IS 'Taux de TVA par défaut (20.00, 10.00, 5.50, 0.00)';
COMMENT ON COLUMN prestations.deleted_at IS 'Soft delete : NULL = active, sinon date de suppression';

-- ═══════════════════════════════════════════════════════════════════════════
-- VÉRIFICATION POST-EXÉCUTION
-- ═══════════════════════════════════════════════════════════════════════════
-- SELECT
--   schemaname,
--   tablename,
--   rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'prestations';
-- ═══════════════════════════════════════════════════════════════════════════
