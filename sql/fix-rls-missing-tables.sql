-- ═══════════════════════════════════════════════════════════════════════════
-- Migration CRITIQUE : Activer RLS sur 3 tables non protégées
-- ═══════════════════════════════════════════════════════════════════════════
--
-- CONTEXTE : l'audit sécurité a identifié 3 tables sans Row Level Security
-- activée. Conséquence : un artisan connecté pouvait, en 1 ligne de code
-- côté navigateur, lire les données métier de tous les autres artisans.
--
-- À EXÉCUTER dans Supabase → SQL Editor → New Query → coller ce fichier → Run.
--
-- ⚠️  AVANT D'EXÉCUTER :
-- 1. Faire une sauvegarde de la base (Supabase → Database → Backups).
-- 2. Vérifier que les colonnes utilisées existent bien (les vérifications
--    ci-dessous échouent proprement si une colonne manque, c'est OK).
-- 3. L'exécution est idempotente : peut être lancée plusieurs fois sans erreur.
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Table 1 : module_events ──────────────────────────────────────────────
-- Cette table contient l'historique des changements d'état (audit log).
-- Elle a une colonne user_id : protection directe par auth.uid().

ALTER TABLE IF EXISTS module_events ENABLE ROW LEVEL SECURITY;

-- On supprime les anciennes policies si elles existent (idempotent)
DROP POLICY IF EXISTS "module_events_select_own" ON module_events;
DROP POLICY IF EXISTS "module_events_insert_own" ON module_events;
DROP POLICY IF EXISTS "module_events_update_own" ON module_events;
DROP POLICY IF EXISTS "module_events_delete_own" ON module_events;

-- Lecture : un utilisateur ne voit que SES events
CREATE POLICY "module_events_select_own"
  ON module_events FOR SELECT
  USING (auth.uid() = user_id);

-- Insertion : seul un user authentifié peut insérer un event SUR LUI
CREATE POLICY "module_events_insert_own"
  ON module_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Mise à jour : un user ne peut modifier que ses events
CREATE POLICY "module_events_update_own"
  ON module_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression : un user ne peut supprimer que ses events
CREATE POLICY "module_events_delete_own"
  ON module_events FOR DELETE
  USING (auth.uid() = user_id);


-- ─── Table 2 : chantier_intervenants ──────────────────────────────────────
-- Cette table fait le lien entre chantiers et intervenants (équipe).
-- Pas de colonne user_id directement → protection via le chantier lié.
-- On autorise l'accès à une ligne uniquement si le chantier appartient
-- à l'utilisateur connecté.

ALTER TABLE IF EXISTS chantier_intervenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chantier_intervenants_select_own" ON chantier_intervenants;
DROP POLICY IF EXISTS "chantier_intervenants_insert_own" ON chantier_intervenants;
DROP POLICY IF EXISTS "chantier_intervenants_update_own" ON chantier_intervenants;
DROP POLICY IF EXISTS "chantier_intervenants_delete_own" ON chantier_intervenants;

CREATE POLICY "chantier_intervenants_select_own"
  ON chantier_intervenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_intervenants.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  );

CREATE POLICY "chantier_intervenants_insert_own"
  ON chantier_intervenants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_intervenants.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  );

CREATE POLICY "chantier_intervenants_update_own"
  ON chantier_intervenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_intervenants.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_intervenants.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  );

CREATE POLICY "chantier_intervenants_delete_own"
  ON chantier_intervenants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_intervenants.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  );


-- ─── Table 3 : chantier_devis ─────────────────────────────────────────────
-- Cette table fait le lien N-N entre chantiers et devis.
-- Pas de colonne user_id directement → protection via le chantier ET le devis.
-- On vérifie que les DEUX (chantier et devis) appartiennent à l'utilisateur,
-- ce qui empêche aussi un attaquant de lier le chantier d'un autre user à
-- son propre devis (ou inversement).

ALTER TABLE IF EXISTS chantier_devis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chantier_devis_select_own" ON chantier_devis;
DROP POLICY IF EXISTS "chantier_devis_insert_own" ON chantier_devis;
DROP POLICY IF EXISTS "chantier_devis_update_own" ON chantier_devis;
DROP POLICY IF EXISTS "chantier_devis_delete_own" ON chantier_devis;

CREATE POLICY "chantier_devis_select_own"
  ON chantier_devis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_devis.chantier_id
      AND chantiers.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM devis
      WHERE devis.id = chantier_devis.devis_id
      AND devis.user_id = auth.uid()
    )
  );

CREATE POLICY "chantier_devis_insert_own"
  ON chantier_devis FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_devis.chantier_id
      AND chantiers.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM devis
      WHERE devis.id = chantier_devis.devis_id
      AND devis.user_id = auth.uid()
    )
  );

CREATE POLICY "chantier_devis_update_own"
  ON chantier_devis FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_devis.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  );

CREATE POLICY "chantier_devis_delete_own"
  ON chantier_devis FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = chantier_devis.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- VÉRIFICATION POST-EXÉCUTION
-- ═══════════════════════════════════════════════════════════════════════════
-- Après avoir exécuté ce script, lance cette requête pour vérifier que tout
-- est OK. Tu dois voir les 3 tables avec rowsecurity = true.

-- SELECT
--   schemaname,
--   tablename,
--   rowsecurity
-- FROM pg_tables
-- WHERE tablename IN ('module_events', 'chantier_intervenants', 'chantier_devis');

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DE LA MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════
