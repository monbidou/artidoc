-- Migration: Ajouter créneaux horaires précis pour interventions planning
-- Date: 2026-04-14
-- Description: Permet de créer plusieurs interventions sur la même journée avec créneaux horaires spécifiques

-- Ajout de 2 colonnes pour stocker les heures précises
ALTER TABLE planning_interventions
  ADD COLUMN IF NOT EXISTS heure_debut time,
  ADD COLUMN IF NOT EXISTS heure_fin time;

-- Commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN planning_interventions.heure_debut IS 'Heure de début de l''intervention (format HH:MM). Utilisée quand type_periode = ''creneau''';
COMMENT ON COLUMN planning_interventions.heure_fin IS 'Heure de fin de l''intervention (format HH:MM). Utilisée quand type_periode = ''creneau''';

-- Note: La colonne 'creneau' (ou 'type_periode') n'a pas de CHECK constraint
-- donc on peut ajouter la valeur 'creneau' sans migration supplémentaire.
-- Les valeurs acceptées sont désormais: 'journee', 'matin', 'apres_midi', 'creneau'
