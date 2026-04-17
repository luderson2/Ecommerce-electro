# Plan configuration production - ÉlectroMétropolitain

Ce document liste les éléments à configurer avant une mise en production.

## 1. Variables d'environnement

Configurer ces variables sur l'hébergeur de production:

```env
NEXT_PUBLIC_SITE_URL=https://ton-domaine.com

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@ton-domaine.com
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` est strictement serveur. Ne jamais l'utiliser dans un composant client.
- `NEXT_PUBLIC_SITE_URL` doit être l'URL canonique publique du site, sans slash final.
- Utiliser les clés live Stripe uniquement en production.

## 2. Supabase

Appliquer les migrations SQL:

- `20260414_remplacer_pack_products.sql`
- `20260417_confirmer_commande_payee.sql`

Vérifier ensuite:

- Les packs actifs ont tous un `slug` unique.
- Les produits actifs ont tous un `slug` unique.
- Les catégories ont toutes un `slug` unique.
- Les politiques RLS protègent les tables client: `profiles`, `cart_items`, `wishlist`, `orders`, `order_items`, `service_requests`.
- Les politiques RLS protègent les tables admin: `products`, `categories`, `packs`, `discounts`, `deliveries`.
- Le bucket storage `products` limite les uploads aux administrateurs/employés.

## 3. Stripe

Créer un endpoint webhook:

```text
https://ton-domaine.com/api/stripe/webhook
```

Événement requis:

```text
checkout.session.completed
```

Copier le signing secret dans:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Tester le flux complet:

1. Créer une commande.
2. Payer via Stripe Checkout.
3. Vérifier que le webhook marque la commande `payee`.
4. Vérifier que le stock est décrémenté.
5. Vérifier que le panier client est vidé au retour success.

En local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 4. Resend

Configurer:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Recommandé:

- Vérifier un domaine d'envoi.
- Utiliser une adresse du type `noreply@ton-domaine.com`.
- Tester une demande SAV et vérifier la réception du courriel.

## 5. SEO

Vérifier en production:

- `https://ton-domaine.com/robots.txt`
- `https://ton-domaine.com/sitemap.xml`
- Les pages produits ont un canonical propre.
- Les pages catégories sont accessibles via `/categories/[slug]`.
- Les packs sont accessibles via `/packs/[slug]`.
- Les pages privées `/admin` et `/compte` ne sont pas indexables.
- Les pages de recherche sont `noindex`.

À faire si possible:

- Ajouter une vraie image Open Graph de marque à la place de `public/placeholder.svg`.
- Soumettre le sitemap dans Google Search Console.
- Configurer un domaine définitif dans `NEXT_PUBLIC_SITE_URL`.

## 6. UI/UX

Checklist avant démonstration:

- Le logo et la marque affichent bien `ÉlectroMétropolitain`.
- Les accents français s'affichent correctement.
- La recherche de la navbar retourne des produits.
- Le bouton panier fonctionne sur:
  - cartes produit
  - fiches produit
  - pages pack
- Les liens du footer ne retournent pas de 404.
- Le site reste utilisable sur mobile.

## 7. Commandes de validation

Avant livraison:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

État attendu: aucune erreur, aucune vulnérabilité connue.
