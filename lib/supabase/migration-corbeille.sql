-- ============================================================
-- Migration : Corbeille (soft delete) pour devis et factures
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1. Ajouter la colonne deleted_at sur la table devis
ALTER TABLE devis ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Ajouter la colonne deleted_at sur la table factures
ALTER TABLE factures ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Index pour accélérer les requêtes (filtre sur deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_devis_deleted_at ON devis (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_factures_deleted_at ON factures (deleted_at) WHERE deleted_at IS NOT NULL;
