# Checklist Manuelle - Avant mise en prod

## Objectif

Ce fichier liste uniquement ce que **toi, en tant qu'humain**, tu dois faire manuellement apres les changements de code.

Le code est en place pour :
- email de confirmation de commande
- email de mise a jour SAV
- sitemap `/reparation`
- JSON-LD des packs
- image OpenGraph par defaut

Ce qu'il reste, c'est surtout :
- configurer les services externes
- remplir les vraies variables d'environnement
- faire les tests finaux

---

## 1. `.env.local` a completer

Ouvre `.env.local` et verifie / complete ces variables.

### Supabase

Obligatoire :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Pourquoi :
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont necessaires au site
- `SUPABASE_SERVICE_ROLE_KEY` est indispensable pour les traitements serveur admin
- sans `SUPABASE_SERVICE_ROLE_KEY`, la feature `/reparation` ne pourra pas inserer dans `demandes_reparation`

### Stripe

Obligatoire :

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Pourquoi :
- le checkout a besoin des cles Stripe
- le webhook `/api/stripe/webhook` doit etre signe correctement
- sans `STRIPE_WEBHOOK_SECRET`, la confirmation de commande ne sera pas fiable

### Resend

Obligatoire pour les emails :

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Pourquoi :
- l'email de confirmation commande utilise Resend
- l'email de mise a jour SAV utilise aussi Resend

Attention :
- `RESEND_FROM_EMAIL` doit etre un expéditeur valide dans Resend
- idealement un domaine verifie, pas juste une adresse arbitraire

### Twilio

Obligatoire pour la feature reparation :

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
OWNER_PHONE=
```

Pourquoi :
- `TWILIO_FROM_NUMBER` = numero Twilio qui envoie le SMS
- `OWNER_PHONE` = ton numero qui doit recevoir l'alerte SMS

### URL du site

```env
NEXT_PUBLIC_SITE_URL=
```

En local :

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En production :
- remplace par l'URL finale du site, par exemple `https://ton-domaine.com`

---

## 2. Ce que tu dois configurer sur chaque service

### Supabase

Tu dois :
- verifier que le projet Supabase pointe bien vers la bonne base
- verifier que les migrations sont appliquees
- recuperer la vraie `SUPABASE_SERVICE_ROLE_KEY`
- la mettre dans `.env.local`

A verifier particulierement :
- la table `demandes_reparation` existe
- la fonction RPC `confirmer_commande_payee` existe
- la fonction RPC `get_user_email` existe

### Stripe

Tu dois :
- verifier que tu utilises les bonnes cles test ou prod
- configurer le webhook Stripe
- faire pointer l'evenement `checkout.session.completed` vers :

```text
/api/stripe/webhook
```

En local :
- lancer `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- recuperer le `whsec_...`
- le coller dans `STRIPE_WEBHOOK_SECRET`

### Resend

Tu dois :
- creer / verifier la cle API Resend
- verifier le domaine ou l'adresse expediteur
- mettre `RESEND_API_KEY` et `RESEND_FROM_EMAIL` dans `.env.local`

Sans ca :
- pas de mail de confirmation commande
- pas de mail de mise a jour SAV

### Twilio

Tu dois :
- recuperer `TWILIO_ACCOUNT_SID`
- recuperer `TWILIO_AUTH_TOKEN`
- acheter / verifier un numero Twilio
- mettre ce numero dans `TWILIO_FROM_NUMBER`
- mettre ton numero dans `OWNER_PHONE`

Sans ca :
- la feature `/reparation` peut etre bloquee
- ou l'insertion peut marcher sans SMS si la config est incomplete

---

## 3. Tests manuels obligatoires

## A. Test commande -> email

But :
- verifier qu'une commande payee envoie bien un email client

Ce que tu fais :
1. demarre le projet localement
2. verifie que Stripe et Resend sont configures
3. passe une commande test en mode Stripe test
4. termine le paiement
5. verifie que le webhook Stripe passe bien
6. verifie que l'email arrive dans la boite du client test

Tu dois confirmer :
- la commande passe en `payee`
- le mail est bien recu
- le mail contient numero de commande, recap, total, adresse

## B. Test SAV -> email

But :
- verifier qu'un changement de statut SAV envoie bien un mail

Ce que tu fais :
1. cree ou utilise une demande SAV existante
2. ouvre `/admin/sav/[id]`
3. change le statut
4. enregistre
5. verifie que le client recoit l'email

Tu dois confirmer :
- le statut change bien en base
- le mail arrive
- le lien du mail mene bien a `/compte/sav/[id]`

## C. Test reparation -> SMS

But :
- verifier que le formulaire `/reparation` fonctionne de bout en bout

Ce que tu fais :
1. verifie que `SUPABASE_SERVICE_ROLE_KEY` est presente
2. verifie que Twilio est configure
3. ouvre `/reparation`
4. soumets un formulaire valide
5. verifie :
   - insertion dans Supabase
   - SMS recu sur `OWNER_PHONE`
   - affichage dans `/admin/reparations`
   - changement de statut fonctionnel

Tu dois confirmer :
- la demande existe dans `demandes_reparation`
- le SMS est bien recu
- l'admin voit la demande

## D. Test rate-limit reparation

But :
- verifier la protection anti-abus

Ce que tu fais :
1. soumets 3 demandes sur une courte periode
2. soumets une 4e demande dans les 10 minutes

Resultat attendu :
- la 4e doit etre refusee

## E. Test honeypot reparation

But :
- verifier le rejet silencieux des bots

Ce que tu fais :
1. ouvre le formulaire `/reparation`
2. via DevTools, remplis le champ cache `website`
3. soumets

Resultat attendu :
- pas d'erreur visible
- pas de ligne ajoutee en base
- pas de SMS envoye

## F. Test SEO

But :
- verifier les ajouts SEO faits dans cette passe

Ce que tu fais :
1. ouvre `http://localhost:3000/sitemap.xml`
2. verifie que `/reparation` est present
3. ouvre une page pack `/packs/[slug]`
4. verifie dans le HTML rendu qu'il y a bien un script `application/ld+json`
5. teste idealement la page avec Google Rich Results Test
6. verifie aussi le rendu OpenGraph avec un apercu de partage si possible

---

## 4. Commandes a relancer avant livraison

Depuis la racine du projet :

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Resultat attendu :
- tout doit etre vert

---

## 5. Ce qui est deja fait cote code

Tu n'as pas besoin de refaire ces changements :

- email de confirmation commande ajoute
- email de mise a jour SAV ajoute
- sitemap `/reparation` ajoute
- JSON-LD pack ajoute
- image OpenGraph par defaut remplacee
- parcours client commandes verifie

---

## 6. Priorite recommandee

Fais les choses dans cet ordre :

1. remplir `.env.local`
2. verifier Supabase
3. verifier Stripe webhook
4. verifier Resend
5. verifier Twilio
6. lancer le projet
7. tester commande -> email
8. tester SAV -> email
9. tester reparation -> SMS
10. tester honeypot + rate-limit
11. relancer lint / tsc / build / audit

---

## 7. Si quelque chose casse

Les causes les plus probables :

- email non recu :
  - `RESEND_API_KEY` invalide
  - `RESEND_FROM_EMAIL` non verifie
  - domaine Resend non configure

- paiement non confirme :
  - `STRIPE_WEBHOOK_SECRET` faux
  - webhook Stripe non configure
  - evenement `checkout.session.completed` absent

- reparation ne marche pas :
  - `SUPABASE_SERVICE_ROLE_KEY` absente
  - variables Twilio absentes
  - numero Twilio invalide
  - `OWNER_PHONE` mal formate

- liens email faux :
  - `NEXT_PUBLIC_SITE_URL` incorrect

---

## 8. Migrations Supabase a appliquer (suite audit 2026-04-22)

Deux nouvelles migrations SQL ont ete ajoutees lors de la passe d'audit et ne sont
**pas encore appliquees** sur ton projet Supabase. Tant qu'elles ne sont pas
appliquees :

- le webhook Stripe renverra `500` des le premier event (table `stripe_webhook_events` absente)
- la RPC `get_user_email` peut rester non securisee (role check manquant)

Fichiers concernes :

```text
supabase/migrations/20260419_get_user_email.sql
supabase/migrations/20260420_stripe_webhook_events.sql
```

### a. Verifier l'etat actuel de `get_user_email`

Avant d'appliquer, verifie si une version existe deja en prod et ce qu'elle fait :

```bash
supabase db dump --schema-only | grep -A 20 "get_user_email"
```

Si la fonction existe deja sans `SECURITY DEFINER` + check de role, la nouvelle
migration l'ecrase proprement (CREATE OR REPLACE). Si elle a une signature
differente, ajuste la migration avant de pousser.

### b. Appliquer les migrations

Option CLI Supabase (recommande) :

```bash
supabase db push
```

Option manuelle (dashboard Supabase > SQL Editor) :
1. ouvre `supabase/migrations/20260419_get_user_email.sql`, colle, execute
2. ouvre `supabase/migrations/20260420_stripe_webhook_events.sql`, colle, execute

### c. Verifier que les deux objets existent

Dans le SQL Editor :

```sql
-- doit retourner 1 ligne
select proname, prosecdef from pg_proc where proname = 'get_user_email';

-- doit retourner la table vide
select count(*) from public.stripe_webhook_events;
```

### d. Tests post-migration

1. **get_user_email securisee** :
   - authentifie-toi comme user A
   - depuis le SQL Editor en session auth, appelle `select public.get_user_email('<uuid_user_B>')`
   - doit renvoyer `null` ou erreur (pas l'email de B)
   - appelle avec ton propre uuid -> doit renvoyer ton email

2. **Dedup webhook Stripe** :
   - depuis le dashboard Stripe (mode test), renvoie un meme event `checkout.session.completed` deja traite (bouton "Resend")
   - verifie dans Supabase que la ligne `stripe_webhook_events` existe avec ce `event_id`
   - verifie qu'il n'y a qu'**une seule** ligne pour ce `event_id` (pas de doublon)
   - verifie que le stock produit n'a pas ete decremente deux fois
   - la reponse HTTP du webhook doit etre `200 { received: true, duplicate: true }` au replay

### e. Rollback si besoin

Si une migration casse quelque chose :

```sql
-- annuler get_user_email (restaure la version precedente manuellement ensuite)
drop function if exists public.get_user_email(uuid);

-- annuler la table dedup
drop table if exists public.stripe_webhook_events;
```
