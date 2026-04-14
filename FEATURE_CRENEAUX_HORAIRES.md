# Feature: Créneaux Horaires Personnalisés — Planning

**Date:** 14 avril 2026  
**Statut:** Implémenté et prêt pour test

## Résumé de la Feature

Permet de créer **plusieurs interventions sur la même journée pour le même artisan** avec des **créneaux horaires précis** (ex: 08:00-10:30, 10:45-13:00, 14:00-17:00).

## Fichiers Modifiés

### 1. Migration SQL
**File:** `lib/supabase/migration-creneaux-horaires.sql`

- Ajoute 2 colonnes à la table `planning_interventions`:
  - `heure_debut time` — Heure de début pour créneaux personnalisés
  - `heure_fin time` — Heure de fin pour créneaux personnalisés
- Rétrocompatible: anciennes interventions (journée/matin/après-midi) restent valides
- À exécuter via la console Supabase SQL

### 2. Page Planning
**File:** `app/dashboard/planning/page.tsx`

#### Type mise à jour
- `type Creneau = 'matin' | 'apres_midi' | 'journee' | 'creneau'`

#### State ajouté
- `mHeureDebut: string` — Heure début du créneau personnalisé (par défaut "08:00")
- `mHeureFin: string` — Heure fin du créneau personnalisé (par défaut "17:00")
- `mConflitWarning: string | null` — Message d'avertissement conflit (ne bloque pas)

#### Fonction de détection de conflits
`checkCreneauConflits(ivId, dateStr, heureDebut, heureFin)` — Détecte les chevauchements avec:
- Interventions type journée (08:00-17:00)
- Interventions demi-journée (matin ou après-midi)
- Autres créneaux personnalisés
- Retourne message d'avertissement (non-bloquant)

#### Modale "Nouvelle intervention"
- **3 radio buttons implicites via le select "Créneau":**
  - "Journée entière" (8h-17h) — Comportement actuel
  - "Demi-journée matin" (8h-12h) — Comportement actuel
  - "Demi-journée après-midi" (13h-17h) — Comportement actuel
  - **"Créneau personnalisé"** — Affiche 2 champs `<input type="time">` (heure début + heure fin)
  
- **Validation:**
  - Si créneau personnalisé: fin > début (sinon affiche erreur)
  - Si conflit détecté: affiche warning jaune (avertissement, ne bloque pas)
  - Permet quand même la création

#### Rendu Grille Planning
- **Journée entière:** 1 grosse carte pleine hauteur (inchangé)
- **Demi-journée:** Moitié de la case (inchangé)
- **Créneau personnalisé:** Petite carte empilée, hauteur proportionnelle à la durée
  - Hauteur = (durée_minutes / 480_min_journée) × 60px
  - Affiche horaire en gros en haut (ex: "08:00–10:30")
  - Couleurs statut conservées (bleu clair pour planifié, vert pour terminé, etc.)
  - Gap entre cartes créneaux: `gap-0.5`

#### Panneau Détail (Intervention Detail)
- Affiche "Créneau personnalisé" avec heures: "08:00 – 10:30" en bleu

## Instructions de Test

### 1. Appliquer la Migration SQL
```sql
-- Copier le contenu de lib/supabase/migration-creneaux-horaires.sql
-- Exécuter dans la console SQL de Supabase
```

### 2. Tester via Interface Web

#### Test 1: Créer une intervention journée (sans changement)
1. Aller sur `nexartis.fr/dashboard/planning`
2. Cliquer "Nouvelle intervention"
3. Sélectionner intervenant, date, "Journée entière"
4. Créer → Doit apparaître normalement en grille (1 carte pleine)

#### Test 2: Créer un créneau personnalisé
1. Cliquer "Nouvelle intervention"
2. Sélectionner intervenant, date, "Créneau personnalisé"
3. Encadré bleu apparaît avec 2 champs horaires (08:00 et 17:00)
4. Modifier à 08:00 - 10:30, créer
5. Vérifier grille: doit afficher "08:00–10:30" avec hauteur ~ 26px

#### Test 3: Créer 3 créneaux même jour
1. Créer créneau 1: 08:00 - 10:30 chantier A
2. Créer créneau 2: 10:45 - 13:00 chantier B
3. Créer créneau 3: 14:00 - 17:00 chantier C
4. Vérifier grille: 3 cartes empilées avec bon espacement et hauteurs proportionnelles

#### Test 4: Conflit détecté (warning)
1. Créer journée entière le 15 avril pour intervenant X
2. Tenter créneau 10:00 - 12:00 même jour
3. Doit afficher warning jaune "Conflit détecté: 08h-17h sur [chantier]"
4. Mais création doit être possible (clic sur "Créer")

#### Test 5: Validation heures invalides
1. Sélectionner créneau personnalisé
2. Définir fin (17:00) < début (08:00)
3. Message erreur rouge: "L'heure de fin doit être après l'heure de début"
4. Bouton "Créer" reste inactif

#### Test 6: Drag & Drop sur créneau
1. Créer 2 créneaux pour intervenant A
2. Glisser l'un vers intervenant B, même jour
3. Doit se déplacer (à vérifier: les heures sont-elles conservées?)

#### Test 7: Panel détail
1. Cliquer sur une intervention créneau personnalisé
2. Panel latéral doit afficher:
   - "Créneau: Créneau personnalisé 08:00 – 10:30" en bleu
   - (couleur #5ab4e0 pour les heures)

### 3. Responsive Mobile
- Grille planning doit rester lisible sur mobile (utiliser `sm:hidden` / `hidden sm:block` pattern)
- Créneaux doivent s'empiler vertalement sur mobile aussi

## Base de Données

### Schéma Modifié
```sql
TABLE planning_interventions {
  id uuid PRIMARY KEY,
  intervenant_id uuid,
  chantier_id uuid,
  date_debut timestamp,
  date_fin timestamp,
  creneau varchar — Values: 'journee' | 'matin' | 'apres_midi' | 'creneau'
  heure_debut time,  -- NEW
  heure_fin time,    -- NEW
  statut varchar,
  notes text,
  created_at timestamp
}
```

### Exemple de Données
```sql
-- Journée entière (backward compatible)
INSERT INTO planning_interventions (..., creneau, heure_debut, heure_fin, ...)
VALUES (..., 'journee', '08:00', '17:00', ...);

-- Créneau personnalisé
INSERT INTO planning_interventions (..., creneau, heure_debut, heure_fin, ...)
VALUES (..., 'creneau', '08:00', '10:30', ...);
```

## Notes Techniques

### Logique de Détection de Conflits
Deux créneaux se chevauchent si:
```
NOT (fin1 <= debut2 OR debut1 >= fin2)
```

Pour chaque type:
- Journée: 08:00 - 17:00 (480 minutes)
- Matin: 08:00 - 12:00 (240 minutes)
- Après-midi: 13:00 - 17:00 (240 minutes)
- Creneau: heure_debut - heure_fin (variable)

### Calcul Hauteur Proportionnelle
```js
heightPx = (durationMin / 480) * 60
minHeight = Math.max(40, heightPx)
```
- 480 minutes (journée entière) = 60px
- 120 minutes = 15px (min 40px)
- 240 minutes (demi-journée) = 30px

### Rétrocompatibilité
- Toutes les interventions existantes restent intactes
- Les champs `heure_debut` et `heure_fin` sont `NULL` pour les anciennes interventions
- Le rendu vérifie le type `creneau` avant d'afficher les heures

## Déploiement Checklist

- [ ] Migration SQL appliquée via Supabase console
- [ ] Code modifié: `app/dashboard/planning/page.tsx`
- [ ] Type `Creneau` updated: 'journee' | 'matin' | 'apres_midi' | 'creneau'
- [ ] Test manuel: 3 créneaux même jour visibles
- [ ] Test conflit: warning affiché (non-bloquant)
- [ ] Test mobile: grille responsive
- [ ] Test panel détail: heures affichées
- [ ] Vérifier: anciennes interventions pas cassées

## Limitations Connues

1. **Drag & Drop sur créneau:** Préserve-t-il les heures? À vérifier.
2. **Export PDF Planning:** À adapter si nécessaire pour afficher créneaux.
3. **Vue Annuelle (Heatmap):** Créneaux comptent comme 1 intervention (correct).
4. **Conflits autorisés:** Feature intentionnelle (warning only, pas de blocage).
