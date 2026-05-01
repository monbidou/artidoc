# 🚀 Guide d'activation Stripe LIVE — Nexartis

**Pour Jerem · Aucune connaissance technique requise**

Ce guide te fait passer ton paiement Stripe du mode TEST (joue à faire des paiements) au mode LIVE (vrai argent qui arrive sur ton compte). Compte 30 minutes, pas plus.

⚠️ **Avant de commencer** : assure-toi d'avoir sous la main ton SIRET, ton IBAN, ta CNI ou passeport (Stripe les demande pour vérifier ton identité).

---

## 🗺️ Vue d'ensemble — ce qu'on va faire

1. **Activer ton compte Stripe en mode LIVE** (Stripe vérifie ton identité — 5 min)
2. **Créer le Product "Abonnement Nexartis"** (le nom de ton service — 2 min)
3. **Créer le Price 25€/mois récurrent** (le tarif qui sera facturé — 2 min)
4. **Récupérer 4 valeurs secrètes** (clés et identifiants — 5 min)
5. **Créer le webhook** (pour que Stripe prévienne ton site quand un paiement passe — 5 min)
6. **Coller les 4 valeurs dans Vercel** (où ton site est hébergé — 5 min)
7. **Faire un test** (acheter ton propre abonnement avec ta vraie carte, puis te rembourser — 5 min)

---

## ÉTAPE 1️⃣ — Activer ton compte Stripe en mode LIVE

### A. Connecte-toi à Stripe

1. Va sur https://dashboard.stripe.com
2. Connecte-toi avec ton compte
3. **TRÈS IMPORTANT** : en haut à gauche du dashboard, tu vois un toggle "Mode test" / "Mode live". **Vérifie que tu es en MODE TEST** pour le moment (on bascule en LIVE à la fin).

### B. Active ton compte (KYC)

Stripe doit vérifier que tu es bien toi avant de te laisser encaisser de vrais paiements.

1. En haut du dashboard, clique sur **"Activer les paiements"** ou va sur https://dashboard.stripe.com/account/onboarding
2. Remplis les infos demandées :
   - **Activité** : Logiciel SaaS / Application web
   - **Description** : "Logiciel de gestion pour artisans (devis, factures, planning)"
   - **Site web** : `https://nexartis.fr`
   - **Type d'entreprise** : Auto-entrepreneur (ou ce qui te correspond)
   - **SIRET** : ton SIRET
   - **Représentant** : tes infos personnelles
   - **CNI ou passeport** : à uploader
   - **IBAN** : ton compte bancaire pro où Stripe versera tes recettes
3. Clique sur **"Soumettre pour vérification"**

⏱️ **Délai** : Stripe valide entre quelques minutes et 48h. Tu reçois un email quand c'est OK. **Tant que ce n'est pas validé, tu ne peux pas encaisser de vrais paiements.**

---

## ÉTAPE 2️⃣ — Créer le Product "Abonnement Nexartis"

⚠️ **Attention** : il faut créer le Product en **MODE LIVE** (toggle en haut), PAS en mode test.

1. Bascule le toggle en haut sur **"Mode live"** (à côté de ton avatar). Le bandeau orange "Test mode" disparaît.
2. Va dans le menu de gauche : **Catalogue → Produits** (ou directement https://dashboard.stripe.com/products)
3. Clique sur le bouton **"+ Ajouter un produit"** en haut à droite

Remplis le formulaire :

| Champ | Valeur |
|---|---|
| **Nom** | `Abonnement Nexartis` |
| **Description** | `Logiciel de gestion pour artisans : devis, factures, planning, équipe. Toutes fonctionnalités incluses.` |
| **Image** | (optionnel — tu peux uploader le logo Nexartis depuis `/public`) |
| **Modèle de tarification** | **Standard** (un prix fixe) |
| **Type de tarification** | **Récurrent** ⚠️ TRÈS IMPORTANT |
| **Période** | **Mensuel** |
| **Prix** | `25.00` |
| **Devise** | `EUR (€)` |
| **TVA incluse ?** | **NON** (le prix est HT, on collecte la TVA en plus) |

Clique sur **"Enregistrer le produit"**.

---

## ÉTAPE 3️⃣ — Récupérer le Price ID

Une fois le produit créé, Stripe l'affiche avec un **Prix** associé. Ce prix a un identifiant qu'on appelle "Price ID".

1. Sur la page du produit que tu viens de créer, descend jusqu'à la section **"Tarification"**
2. Clique sur les **"⋯"** (trois petits points) à côté du prix `25,00 € / mois`
3. Clique sur **"Copier l'ID"**
4. Tu obtiens quelque chose comme : `price_1QXxYz...` (commence toujours par `price_`)

📝 **Note ce price ID dans un coin**, on en aura besoin à l'étape 6.

---

## ÉTAPE 4️⃣ — Récupérer les clés API

Stripe te donne 2 clés pour que ton site puisse communiquer avec lui :
- Une **clé publique** (peut être visible sur ton site, comme un identifiant)
- Une **clé secrète** (à protéger comme un mot de passe)

1. Va dans **Développeurs → Clés API** (ou https://dashboard.stripe.com/apikeys)
2. **Vérifie que tu es en MODE LIVE** (toggle en haut)
3. Tu vois 2 clés :

| Nom Stripe | Préfixe | À copier ? |
|---|---|---|
| **Clé publiable** | `pk_live_...` | ✅ Oui |
| **Clé secrète** | `sk_live_...` | ✅ Oui (clique sur "Révéler la clé en mode actif") |

📝 **Note ces 2 clés**, on en aura besoin à l'étape 6.

⚠️ **Sécurité** : ne JAMAIS partager ta clé secrète. Si elle fuit, génère-en une nouvelle ("Rotater la clé").

---

## ÉTAPE 5️⃣ — Créer le webhook

Le webhook permet à Stripe de prévenir ton site dès qu'un événement se passe (paiement réussi, abonnement annulé, etc.). Sans ça, ton site ne sait pas quand activer l'accès d'un user qui vient de payer.

1. Va dans **Développeurs → Webhooks** (ou https://dashboard.stripe.com/webhooks)
2. **Vérifie que tu es en MODE LIVE**
3. Clique sur **"+ Ajouter un endpoint"**

Remplis le formulaire :

| Champ | Valeur |
|---|---|
| **URL du endpoint** | `https://nexartis.fr/api/stripe/webhook` |
| **Description** | `Webhook Nexartis — paiements et abonnements` |
| **Version API** | Laisser sur "La plus récente" |

### Sélectionner les événements à écouter

Clique sur **"Sélectionner les événements"** et coche **EXACTEMENT ces 5 événements** :

- ✅ `checkout.session.completed` — quand un user finit de payer
- ✅ `invoice.payment_succeeded` — quand un renouvellement mensuel passe
- ✅ `invoice.payment_failed` — quand un paiement échoue
- ✅ `customer.subscription.deleted` — quand un user annule son abonnement
- ✅ `customer.subscription.updated` — quand l'abonnement change d'état (suspension, etc.)

Clique sur **"Ajouter des événements"** puis **"Ajouter un endpoint"**.

### Récupérer le secret du webhook

Tu arrives sur la page du webhook fraîchement créé. Sous **"Clé secrète de signature"**, clique sur **"Cliquez pour révéler"**.

Tu obtiens quelque chose comme : `whsec_abc123...` (commence par `whsec_`).

📝 **Note ce secret**, on en aura besoin à l'étape 6.

---

## ÉTAPE 6️⃣ — Coller les 4 valeurs dans Vercel

Vercel est l'hébergeur de ton site. C'est lui qui doit connaître les clés Stripe pour pouvoir parler avec Stripe.

### Récap des 4 valeurs que tu dois avoir

| # | Variable | Préfixe | Étape où on l'a obtenue |
|---|---|---|---|
| 1 | `STRIPE_SECRET_KEY` | `sk_live_...` | Étape 4 |
| 2 | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Étape 4 |
| 3 | `STRIPE_PRICE_ID` | `price_...` | Étape 3 |
| 4 | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Étape 5 |

### Configuration dans Vercel

1. Va sur https://vercel.com et connecte-toi
2. Clique sur le projet **"Nexartis"** (ou son équivalent)
3. En haut, va dans l'onglet **"Settings"**
4. Dans le menu de gauche, clique sur **"Environment Variables"**

Pour chacune des 4 variables ci-dessus :

5. Dans le champ **"Key"**, tape le nom EXACT de la variable (ex : `STRIPE_SECRET_KEY`)
6. Dans le champ **"Value"**, colle la valeur correspondante (ex : `sk_live_abc123...`)
7. Dans **"Environments"**, coche **les 3** : ✅ Production, ✅ Preview, ✅ Development
8. Clique sur **"Save"**

⚠️ **Vérifie bien chaque variable** : un caractère manquant et tout casse silencieusement.

### Redéployer

Vercel n'applique les nouvelles variables qu'au prochain déploiement.

1. Toujours dans Vercel, va dans l'onglet **"Deployments"**
2. Sur le dernier déploiement (en haut), clique sur les **"⋯"**
3. Clique sur **"Redeploy"**
4. Coche ✅ **"Use existing Build Cache"** (plus rapide)
5. Clique sur **"Redeploy"**

⏱️ Attends ~2 minutes que ça redéploie.

---

## ÉTAPE 7️⃣ — Tester avec ta vraie carte

C'est l'étape qui te confirme que tout marche. Tu vas acheter ton propre abonnement avec ta vraie CB, puis te rembourser depuis Stripe (Stripe te prélève juste les frais de transaction, ~0.45€).

1. Va sur https://nexartis.fr et connecte-toi avec un compte de test que tu peux supprimer après
2. Va dans **Sidebar → Abonnement**
3. Clique sur **"Souscrire maintenant"**
4. Tu es redirigé vers Stripe Checkout. Saisis :
   - Ta vraie CB
   - Ton SIRET (champ "Numéro fiscal" — Stripe le demande)
5. Clique sur **"S'abonner"**

✅ **Si tout fonctionne** :
- Tu es redirigé vers `nexartis.fr/dashboard/abonnement?success=1`
- Tu vois un message vert "Abonnement activé !"
- Tu reçois un email Stripe de confirmation
- Sur la page abonnement, le badge passe de "Essai" à "Actif"
- Le bouton "Souscrire" est remplacé par "Gérer mon abonnement"

❌ **Si ça plante** :
- Note le message d'erreur exact
- Va dans Stripe → Développeurs → Logs : tu verras la requête qui a échoué
- Va dans Vercel → Logs : tu verras l'erreur côté serveur
- Si tu n'arrives pas à debug : envoie-moi les logs sur Slack/email

### Te rembourser

Une fois que tu as confirmé que tout marche :

1. Sur Stripe → Paiements, retrouve ton paiement de 25€
2. Clique dessus
3. En haut à droite : **"⋯ → Rembourser le paiement"**
4. Confirme le remboursement total

Tu paies juste les frais de transaction Stripe (1,5% + 0,25€ = ~0,63€). Considère ça comme le coût du test.

---

## 🎁 Bonus — Personnaliser le portail Stripe

Le portail Stripe (où l'user va pour gérer son abonnement) peut être personnalisé.

1. Va sur https://dashboard.stripe.com/settings/billing/portal
2. Personnalise :
   - Le logo (ton logo Nexartis)
   - Les couleurs (orange #e87a2a et bleu nuit #0f1a3a)
   - Les fonctionnalités : ✅ Annuler l'abonnement, ✅ Mettre à jour la CB, ✅ Voir les factures
3. Active aussi **"Centre de facturation"** pour que tes clients puissent télécharger leurs factures eux-mêmes

---

## 📋 Checklist finale

Avant de considérer Stripe LIVE comme prêt, vérifie chaque case :

- [ ] Compte Stripe activé en mode LIVE (pas de bandeau orange "Test mode")
- [ ] Product "Abonnement Nexartis" créé avec Price 25€/mois HT
- [ ] Webhook configuré sur `https://nexartis.fr/api/stripe/webhook` avec les 5 événements
- [ ] 4 variables d'environnement dans Vercel : STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET
- [ ] Site redéployé après ajout des variables
- [ ] Test grandeur nature réussi (paiement passé, accès activé, email reçu)
- [ ] Portail Stripe personnalisé avec logo + couleurs Nexartis
- [ ] (Optionnel) Premier paiement remboursé pour libérer la dépense

---

## 🆘 Questions fréquentes

### Mon webhook reçoit "401 Unauthorized" — qu'est-ce qui se passe ?

C'est généralement parce que `STRIPE_WEBHOOK_SECRET` est mal copié. Vérifie qu'il commence bien par `whsec_` et qu'il n'y a pas d'espace avant/après.

### Le user a payé mais son compte n'est pas activé

1. Va dans Stripe → Webhooks → ton webhook → onglet **"Tentatives récentes"**
2. Tu verras chaque événement reçu et la réponse de ton site
3. Si réponse `200` : ton site a bien reçu mais peut-être un bug dans la mise à jour de la BDD. Vérifie les logs Vercel.
4. Si réponse `400` ou `500` : le webhook secret est faux ou le code a planté

### Comment tester un cas particulier (paiement échoué, annulation, etc.) ?

Stripe a des cartes de test dédiées : https://docs.stripe.com/testing
- `4242 4242 4242 4242` : succès
- `4000 0000 0000 0002` : refus
- `4000 0027 6000 3184` : authentification 3D Secure requise

Mais ATTENTION : ces cartes ne marchent qu'en MODE TEST. En mode LIVE, il faut une vraie CB.

### Combien Stripe me prend par paiement ?

En France : **1,5% + 0,25€ HT** par paiement réussi. Sur un abonnement à 25€, ça fait `0,375 + 0,25 = 0,625€` HT par mois et par client. Donc 24,38€ HT te restent.

### Quand est-ce que j'encaisse l'argent sur mon IBAN ?

Stripe verse automatiquement tous les **lundis** (paramétrable). Tu peux aussi déclencher un virement manuel à tout moment depuis le dashboard.

---

## ✅ C'est fini !

Une fois la checklist validée, ton SaaS est officiellement monétisé. Bravo Jerem 🎉

Le fonctionnement automatique :
1. Un user s'inscrit → 14 jours de trial gratuit (pas de CB)
2. Avant la fin du trial : bandeau orange "Essai expire dans X jours"
3. Le user clique "Souscrire" → checkout Stripe → paiement
4. Webhook prévient ton site → compte activé en `actif`
5. Tous les mois, Stripe reprélève automatiquement
6. Si le user veut annuler : bouton "Gérer mon abonnement" → portail Stripe → "Annuler"
7. Si paiement échoue : Stripe retente automatiquement pendant 4 semaines avant de suspendre

Toi tu n'as **rien à faire**. Tout est automatique.
