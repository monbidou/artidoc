-- ============================================================
-- Migration : Flag d'envoi du welcome email
-- ============================================================
-- À exécuter une seule fois dans le SQL Editor de Supabase.
-- Ajoute un champ booléen pour tracer l'envoi du mail de bienvenue
-- et éviter les doublons à chaque connexion.
-- ============================================================

ALTER TABLE entreprises
  ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- Marque tous les comptes existants comme "déjà notifiés"
-- pour qu'ils ne reçoivent pas le mail à leur prochaine connexion.
UPDATE entreprises
   SET welcome_email_sent = TRUE
 WHERE welcome_email_sent = FALSE;

-- Vérification (optionnel)
-- SELECT user_id, nom, welcome_email_sent FROM entreprises;
