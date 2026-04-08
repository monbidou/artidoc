-- ============================================
-- ARTIDOC — FIX RLS FINAL
-- Exécuter dans Supabase SQL Editor
-- DROP toutes les policies existantes, réactive RLS,
-- recrée des policies strictes auth.uid() = user_id
-- ============================================

-- ============================================
-- ÉTAPE 1 : DROP toutes les policies existantes
-- ============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;


-- ============================================
-- ÉTAPE 2 : ENABLE RLS sur toutes les tables
-- ============================================

ALTER TABLE entreprises              ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE chantiers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis_lignes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture_lignes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements                ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_interventions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE achats                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                ENABLE ROW LEVEL SECURITY;
ALTER TABLE relances                 ENABLE ROW LEVEL SECURITY;

-- FORCE RLS même pour le propriétaire de la table (sécurité maximale)
ALTER TABLE entreprises              FORCE ROW LEVEL SECURITY;
ALTER TABLE clients                  FORCE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs             FORCE ROW LEVEL SECURITY;
ALTER TABLE intervenants             FORCE ROW LEVEL SECURITY;
ALTER TABLE prestations              FORCE ROW LEVEL SECURITY;
ALTER TABLE chantiers                FORCE ROW LEVEL SECURITY;
ALTER TABLE devis                    FORCE ROW LEVEL SECURITY;
ALTER TABLE devis_lignes             FORCE ROW LEVEL SECURITY;
ALTER TABLE factures                 FORCE ROW LEVEL SECURITY;
ALTER TABLE facture_lignes           FORCE ROW LEVEL SECURITY;
ALTER TABLE paiements                FORCE ROW LEVEL SECURITY;
ALTER TABLE planning_interventions   FORCE ROW LEVEL SECURITY;
ALTER TABLE achats                   FORCE ROW LEVEL SECURITY;
ALTER TABLE documents                FORCE ROW LEVEL SECURITY;
ALTER TABLE relances                 FORCE ROW LEVEL SECURITY;


-- ============================================
-- ÉTAPE 3 : Policies pour tables avec user_id direct
-- Pattern : SELECT/INSERT/UPDATE/DELETE filtrés par auth.uid() = user_id
-- ============================================

-- entreprises (pas de DELETE — une seule par user)
CREATE POLICY "entreprises_select" ON entreprises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "entreprises_insert" ON entreprises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entreprises_update" ON entreprises FOR UPDATE USING (auth.uid() = user_id);

-- clients
CREATE POLICY "clients_select" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (auth.uid() = user_id);

-- fournisseurs
CREATE POLICY "fournisseurs_select" ON fournisseurs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fournisseurs_insert" ON fournisseurs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fournisseurs_update" ON fournisseurs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "fournisseurs_delete" ON fournisseurs FOR DELETE USING (auth.uid() = user_id);

-- intervenants
CREATE POLICY "intervenants_select" ON intervenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "intervenants_insert" ON intervenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "intervenants_update" ON intervenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "intervenants_delete" ON intervenants FOR DELETE USING (auth.uid() = user_id);

-- prestations
CREATE POLICY "prestations_select" ON prestations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prestations_insert" ON prestations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prestations_update" ON prestations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prestations_delete" ON prestations FOR DELETE USING (auth.uid() = user_id);

-- chantiers
CREATE POLICY "chantiers_select" ON chantiers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chantiers_insert" ON chantiers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chantiers_update" ON chantiers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "chantiers_delete" ON chantiers FOR DELETE USING (auth.uid() = user_id);

-- devis
CREATE POLICY "devis_select" ON devis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "devis_insert" ON devis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "devis_update" ON devis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "devis_delete" ON devis FOR DELETE USING (auth.uid() = user_id);

-- factures
CREATE POLICY "factures_select" ON factures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "factures_insert" ON factures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "factures_update" ON factures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "factures_delete" ON factures FOR DELETE USING (auth.uid() = user_id);

-- paiements
CREATE POLICY "paiements_select" ON paiements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "paiements_insert" ON paiements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "paiements_update" ON paiements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "paiements_delete" ON paiements FOR DELETE USING (auth.uid() = user_id);

-- planning_interventions
CREATE POLICY "planning_select" ON planning_interventions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "planning_insert" ON planning_interventions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "planning_update" ON planning_interventions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "planning_delete" ON planning_interventions FOR DELETE USING (auth.uid() = user_id);

-- achats
CREATE POLICY "achats_select" ON achats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achats_insert" ON achats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "achats_update" ON achats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "achats_delete" ON achats FOR DELETE USING (auth.uid() = user_id);

-- documents
CREATE POLICY "documents_select" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (auth.uid() = user_id);

-- relances
CREATE POLICY "relances_select" ON relances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "relances_insert" ON relances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "relances_update" ON relances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "relances_delete" ON relances FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- ÉTAPE 4 : Policies pour tables enfants (pas de user_id direct)
-- Sécurisées via le parent
-- ============================================

-- devis_lignes → sécurisé via devis.user_id
CREATE POLICY "devis_lignes_select" ON devis_lignes FOR SELECT
  USING (devis_id IN (SELECT id FROM devis WHERE user_id = auth.uid()));
CREATE POLICY "devis_lignes_insert" ON devis_lignes FOR INSERT
  WITH CHECK (devis_id IN (SELECT id FROM devis WHERE user_id = auth.uid()));
CREATE POLICY "devis_lignes_update" ON devis_lignes FOR UPDATE
  USING (devis_id IN (SELECT id FROM devis WHERE user_id = auth.uid()));
CREATE POLICY "devis_lignes_delete" ON devis_lignes FOR DELETE
  USING (devis_id IN (SELECT id FROM devis WHERE user_id = auth.uid()));

-- facture_lignes → sécurisé via factures.user_id
CREATE POLICY "facture_lignes_select" ON facture_lignes FOR SELECT
  USING (facture_id IN (SELECT id FROM factures WHERE user_id = auth.uid()));
CREATE POLICY "facture_lignes_insert" ON facture_lignes FOR INSERT
  WITH CHECK (facture_id IN (SELECT id FROM factures WHERE user_id = auth.uid()));
CREATE POLICY "facture_lignes_update" ON facture_lignes FOR UPDATE
  USING (facture_id IN (SELECT id FROM factures WHERE user_id = auth.uid()));
CREATE POLICY "facture_lignes_delete" ON facture_lignes FOR DELETE
  USING (facture_id IN (SELECT id FROM factures WHERE user_id = auth.uid()));


-- ============================================
-- ÉTAPE 5 : Bypass RLS pour le service_role (triggers, admin)
-- Le service_role key bypass RLS par défaut dans Supabase,
-- mais FORCE ROW LEVEL SECURITY l'empêche.
-- On ajoute des policies explicites pour le service_role.
-- ============================================

-- Le handle_new_user trigger utilise SECURITY DEFINER,
-- donc il s'exécute en tant que propriétaire de la fonction (postgres)
-- et bypass naturellement le RLS. Aucune policy supplémentaire nécessaire.


-- ============================================
-- VÉRIFICATION : affiche le nombre de policies par table
-- ============================================
SELECT tablename, COUNT(*) as policies_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
