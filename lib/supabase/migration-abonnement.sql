-- ============================================
-- MIGRATION : Gestion abonnements Nexartis
-- À exécuter dans Supabase > SQL Editor
-- ============================================

-- Ajouter les colonnes d'abonnement à la table entreprises
ALTER TABLE entreprises
  ADD COLUMN IF NOT EXISTS abonnement_type TEXT DEFAULT 'trial'
    CHECK (abonnement_type IN ('trial', 'lifetime', 'actif', 'suspendu')),
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS abonnement_expire_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes_admin TEXT;

-- Pour les utilisateurs déjà existants, définir trial_started_at = created_at
UPDATE entreprises
SET trial_started_at = created_at
WHERE trial_started_at IS NULL;

-- Vue admin (accessible uniquement via service role côté serveur)
-- Elle expose les infos nécessaires pour le panneau admin
CREATE OR REPLACE VIEW admin_users_view AS
SELECT
  e.id,
  e.user_id,
  e.nom AS entreprise_nom,
  e.email,
  e.telephone,
  e.metier,
  e.ville,
  e.abonnement_type,
  e.trial_started_at,
  e.abonnement_expire_at,
  e.notes_admin,
  e.created_at,
  u.email AS auth_email,
  u.last_sign_in_at,
  u.email_confirmed_at
FROM entreprises e
JOIN auth.users u ON u.id = e.user_id
ORDER BY e.created_at DESC;
