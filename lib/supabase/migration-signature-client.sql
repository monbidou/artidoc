-- ============================================
-- MIGRATION: Signature électronique client
-- Date: 2026-04-13
-- Description: Ajoute le token de signature publique
--   et la signature dessinée du client sur le devis
-- ============================================

-- Token unique pour la page publique de signature (UUID v4)
ALTER TABLE devis ADD COLUMN IF NOT EXISTS signature_token UUID DEFAULT gen_random_uuid();

-- Signature dessinée par le client (image base64 du canvas)
ALTER TABLE devis ADD COLUMN IF NOT EXISTS client_signature_base64 TEXT;

-- Index unique sur le token pour lookup rapide
CREATE UNIQUE INDEX IF NOT EXISTS idx_devis_signature_token ON devis(signature_token) WHERE signature_token IS NOT NULL;

-- S'assurer que les devis existants ont un token (pour qu'on puisse envoyer
-- un lien de signature même pour les devis déjà envoyés)
UPDATE devis SET signature_token = gen_random_uuid() WHERE signature_token IS NULL;
