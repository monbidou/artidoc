-- Création de la table materiel pour la gestion du parc matériel
CREATE TABLE IF NOT EXISTS materiel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  designation text NOT NULL,
  categorie text, -- 'electroportatif', 'echafaudage', 'vehicule', 'epi', 'gros_outillage', 'autre'
  numero_serie text, -- ou immat pour véhicule
  valeur_achat numeric(10,2),
  date_achat date,
  etat text, -- 'neuf', 'bon', 'use', 'hs'
  localisation text, -- 'depot', 'chantier_X', 'employe_Y', texte libre
  -- Finance / crédit
  mode_acquisition text, -- 'comptant', 'credit', 'leasing', 'lld'
  credit_montant_total numeric(10,2),
  credit_mensualite numeric(10,2),
  credit_duree_mois integer,
  credit_date_fin date,
  credit_banque text,
  -- Assurance
  assurance_mensualite numeric(10,2),
  assurance_compagnie text,
  assurance_numero_police text,
  assurance_echeance date,
  -- Entretien / révision
  prochaine_revision date,
  entretien_budget_annuel numeric(10,2),
  -- Amortissement comptable
  duree_amortissement_annees integer,
  -- Notes
  notes text,
  -- Meta
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE materiel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_read_own" ON materiel FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_write_own" ON materiel FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
