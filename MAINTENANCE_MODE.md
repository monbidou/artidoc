# Mode Maintenance Nexartis — Guide d'utilisation

Ce document explique comment **mettre Nexartis en maintenance** (et le réactiver) sans toucher au code, juste depuis l'interface Vercel.

---

## Comment ça marche en 30 secondes

- Tu actives une variable d'environnement `MAINTENANCE_MODE=true` dans Vercel.
- Tous les visiteurs (y compris tes clients existants) voient une page propre **"Maintenance en cours"** avec le code HTTP **503** (le bon code, qui protège ton référencement Google).
- **Toi seul** peux accéder normalement au site en visitant une URL secrète une seule fois.

---

## 1. Configuration initiale (à faire UNE SEULE FOIS)

Dans Vercel, va dans **Settings → Environment Variables** et ajoute ces 3 variables :

| Variable | Valeur | À quoi ça sert |
|---|---|---|
| `MAINTENANCE_MODE` | `false` | Interrupteur principal. Mets `true` pour activer la maintenance. |
| `MAINTENANCE_BYPASS_SECRET` | `WJIKp_8bWXyiCzO0XjgiVAYLBH2NPx7YDCONivfnJf0` | Mot de passe pour TOI seul, pour bypasser la maintenance. **Garde-le secret.** Tu peux régénérer cette valeur quand tu veux. |
| `NEXT_PUBLIC_MAINTENANCE_RETURN` | `vendredi 22 mai à 18h` *(exemple)* | Texte affiché aux visiteurs pour savoir quand le service revient. Tu peux changer ça à tout moment. |

> **Note** : la valeur de `MAINTENANCE_BYPASS_SECRET` proposée ci-dessus a été générée aléatoirement pour toi. Tu peux la garder telle quelle ou la régénérer.
>
> **Très important** : applique ces variables à TOUS les environnements (`Production`, `Preview`, `Development`) dans Vercel pour éviter les surprises.

Après avoir ajouté les variables, clique sur **"Redeploy"** dans l'onglet Deployments → trois petits points → "Redeploy" sur la dernière build. Cela prend ~2 minutes.

---

## 2. Activer le mode maintenance

Quand tu veux mettre le site en pause :

1. Va sur Vercel → Settings → Environment Variables
2. Édite la variable `MAINTENANCE_MODE` : change sa valeur de `false` à **`true`**
3. Sauvegarde
4. Va dans l'onglet **Deployments** → clique sur les trois petits points de la dernière build → **"Redeploy"**
5. Attends ~2 minutes que le déploiement finisse
6. Vérifie en ouvrant **https://nexartis.fr en navigation privée** (pour ne pas être confondu avec ton compte connecté) : tu dois voir la page de maintenance.

---

## 3. Bypasser la maintenance (toi, l'admin)

Une fois la maintenance activée, tu n'as plus accès au site comme tout le monde. Pour pouvoir continuer à tester pendant que tu corriges les bugs :

1. Ouvre dans ton navigateur (PAS en navigation privée — il faut que les cookies persistent) :
   ```
   https://nexartis.fr/api/maintenance-bypass?secret=WJIKp_8bWXyiCzO0XjgiVAYLBH2NPx7YDCONivfnJf0
   ```
   *(remplace `WJIKp_...` par la valeur exacte de ta variable `MAINTENANCE_BYPASS_SECRET` si tu l'as changée)*

2. Le site va te rediriger automatiquement vers `/dashboard` après avoir posé un cookie sur ton navigateur.

3. Ce cookie est valable **7 jours**. Tu accèdes désormais au site normalement, comme si la maintenance n'existait pas.

Si tu changes d'ordinateur ou de navigateur, il suffit de re-visiter l'URL ci-dessus pour récupérer le bypass.

### Révoquer le bypass (perdre l'accès admin)

Visite :
```
https://nexartis.fr/api/maintenance-bypass?action=clear
```
Le cookie est supprimé, tu vois à nouveau la page de maintenance comme tout le monde.

---

## 4. Désactiver le mode maintenance (remettre le site en ligne)

Quand tes corrections sont prêtes et que tu veux rendre le site accessible à tous :

1. Vercel → Settings → Environment Variables
2. Édite `MAINTENANCE_MODE` : remets sa valeur à **`false`**
3. Sauvegarde
4. Redéploie depuis l'onglet Deployments (trois petits points → Redeploy)
5. Le site est de nouveau accessible à tous, ton cookie de bypass devient inutile.

---

## 5. Personnaliser le message de la page de maintenance

Tu peux changer la date de retour estimée affichée sur la page en éditant la variable `NEXT_PUBLIC_MAINTENANCE_RETURN` dans Vercel. Exemples :
- `dans quelques heures`
- `vendredi 22 mai à 18h`
- `lundi prochain dès 9h`
- `très prochainement`

Après changement, fais un Redeploy. La nouvelle date apparaît immédiatement.

Tu peux aussi changer le texte plus profond directement dans le fichier `app/maintenance/page.tsx` puis pousser sur Git → Vercel redéploiera tout seul.

---

## 6. Ce qui reste accessible pendant la maintenance

- La page `/maintenance` (forcément)
- L'URL secrète de bypass `/api/maintenance-bypass`
- Le webhook Stripe `/api/stripe/webhook` (pour ne pas perdre les notifications de paiement de Stripe pendant la maintenance — Stripe les retransmettrait de toute façon mais c'est plus propre)
- Les assets statiques (images, polices, favicon)

**Tout le reste** (dashboard, API, landing pages publiques, signature en ligne, etc.) est redirigé vers `/maintenance` avec le code 503.

---

## 7. Schéma rapide

```
Maintenance OFF (état normal)
  ↓
  Tout le monde accède normalement.

Maintenance ON
  ↓
  Visiteur lambda → page /maintenance (503 Service Unavailable)
  Toi (avec cookie bypass) → accès normal au dashboard
  Stripe (webhook) → autorisé
  Page maintenance + URL bypass → toujours accessibles
```

---

## 8. FAQ rapides

**Q. Et le SEO Google ?**
R. Le code 503 + l'en-tête `Retry-After: 3600` indiquent à Google "je suis temporairement indisponible, repasse dans 1h". Google ne va PAS désindexer ton site. C'est exactement la procédure recommandée par Google pour les maintenances.

**Q. Et mes clients existants qui paient ?**
R. Ils verront la page de maintenance comme tout le monde. Tu devras leur prolonger leur abonnement de la durée de l'indisponibilité (manuellement dans Supabase, ou en leur offrant un avoir). C'est le geste commercial correct.

**Q. Et les webhooks Stripe pendant ce temps ?**
R. Ils continuent de fonctionner (route explicitement autorisée). Donc si un client paie via le Customer Portal Stripe, son abonnement sera bien activé dans ta base.

**Q. Si je me trompe et que je perds mon accès admin ?**
R. Tu peux toujours te re-bypasser via l'URL secrète (`?secret=...`). Garde le secret en lieu sûr (gestionnaire de mots de passe).

**Q. Combien de temps puis-je rester en maintenance ?**
R. Quelques jours sans problème SEO. Au-delà d'une semaine, Google peut commencer à se poser des questions. Tente de ne pas dépasser 5-7 jours.

---

## 9. Vérifier que la maintenance fonctionne (avant de l'utiliser pour de vrai)

Pour tester maintenant sans impacter tes clients :

1. Mets `MAINTENANCE_MODE=true` dans Vercel UNIQUEMENT pour l'environnement **Preview** (pas Production).
2. Pousse n'importe quel commit sur une branche `test-maintenance` par exemple.
3. Visite l'URL Preview générée par Vercel.
4. Tu dois voir la page de maintenance.
5. Visite l'URL Preview + `/api/maintenance-bypass?secret=...` → tu dois récupérer ton accès.

Quand tu es satisfait, tu peux activer pour de vrai en Production.

---

*Document généré le 20 mai 2026. Conserve-le précieusement.*
