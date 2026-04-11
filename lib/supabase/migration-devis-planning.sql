-- Migration : Ajouter devis_id à planning_interventions
-- À exécuter dans Supabase SQL Editor

-- 1) Ajouter la colonne devis_id
ALTER TABLE planning_interventions
ADD COLUMN IF NOT EXISTS devis_id UUID REFERENCES devis(id) ON DELETE SET NULL;

-- 2) Index pour performance
CREATE INDEX IF NOT EXISTS idx_planning_devis ON planning_interventions(user_id, devis_id);
