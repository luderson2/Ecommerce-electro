# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexte projet

Boutique e-commerce d'électroménagers (stage étudiant). Interface claire, SEO propre, sécurité correcte sur les flux paiement/admin, code maintenable.

## Stack

- **Framework**: Next.js 16.2.4, App Router
- **Base de données**: Supabase PostgreSQL
- **Auth**: Supabase Auth + `@supabase/ssr`
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Validation**: Zod v4
- **Paiement**: Stripe Checkout + webhook signé
- **Courriels**: Resend
- **SMS**: Twilio
- **Langage**: TypeScript strict

## Commandes

```bash
npm run dev          # Démarrer en développement (webpack, pas Turbopack)
npm run dev:clean    # Vider .next/ puis démarrer
npm run build        # Build production
npm run lint         # ESLint
npx tsc --noEmit     # Vérification TypeScript sans émettre
npm audit --omit=dev # Audit sécurité dépendances
```

Ces quatre commandes doivent passer avant toute remise ou mise en production :
```bash
npm run lint && npx tsc --noEmit && npm run build && npm audit --omit=dev
```

## Architecture — points clés

### Trois clients Supabase — ne pas confondre

| Fichier | Contexte | Clé |
|---|---|---|
| `lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers | anon |
| `lib/supabase/client.ts` | Composants React client uniquement, via `useMemo` | anon |
| `lib/supabase/admin.ts` | Serveur uniquement — **jamais côté client** | service_role |

`createAdminClient()` est utilisé exclusivement dans `lib/payments/orders.ts` et `app/api/stripe/webhook/route.ts` pour confirmer les commandes avec des droits élevés.

### Auth — double chemin

- **Server Actions** (`lib/actions/auth.ts`) : utilisent `supabase.auth.getUser()` directement. C'est la source de vérité pour toutes les mutations.
- **`contexts/auth-context.tsx`** : context React client uniquement. Expose `user`, `isLoading`, `login`, `logout`. Alimenté par un listener `onAuthStateChange`. Ne jamais l'utiliser dans des Server Components ou des Server Actions.

Le middleware (`lib/supabase/middleware.ts`) protège les routes `/compte`, `/admin`, `/panier`, `/favoris`, `/checkout` et redirige vers `/connexion?next=<path>` si non authentifié.

### Flux checkout complet

```
1. Client → POST /api/checkout/session
   └─ createCheckoutSessionForUser() : déduplique product_ids, recalcule prix depuis DB,
      crée order (status=en_attente), crée session Stripe avec metadata.order_id + metadata.user_id
      
2. Stripe → redirect success_url → /compte/checkout/success?session_id=...&order_id=...
   └─ GET /api/checkout/session-status (auth + vérif ownership via orders)
   └─ POST /api/checkout/confirm → confirmOrderForUser()
      └─ confirmerCommandePayeeDepuisSession() → RPC confirmer_commande_payee
         → retourne boolean (true=confirmé, false=déjà payé — évite double email)

3. Stripe → webhook POST /api/stripe/webhook (chemin de secours)
   └─ Déduplication via table stripe_webhook_events (insert + catch code 23505)
   └─ confirmerCommandePayeeDepuisSession() (même fonction que le chemin client)
```

Le panier est vidé après confirmation : **uniquement les product_ids commandés** (pas tout le panier).

### Server Actions vs Route Handlers

- **Server Actions** (`lib/actions/`) : toutes les mutations UI (CRUD produits, commandes, SAV, auth). Utilisées avec `useFormState` / `useActionState`.
- **Route Handlers** (`app/api/`) : utilisés uniquement quand un Server Action ne peut pas convenir : webhook Stripe (corps brut nécessaire), et endpoints checkout appelés en `fetch` côté client depuis la page success.

### Guard admin

Toutes les Server Actions admin commencent par :
```ts
const { supabase, erreur } = await verifierAdmin()
if (!supabase) return { error: erreur }
```
`verifierAdmin()` (`lib/actions/_guard.ts`) vérifie authentification + rôle (`admin` | `employee`) et retourne directement le client Supabase pour éviter une double instanciation. Les pages admin sont aussi protégées par `app/admin/layout.tsx`.

## Sécurité paiement

- Les prix sont toujours recalculés depuis Supabase — ne jamais faire confiance aux données panier client (prix, nom, image, total).
- `confirmerCommandePayeeDepuisSession()` vérifie : `stripe_session_id`, `metadata.order_id`, `metadata.user_id`, montant Stripe, devise, statut payé.
- Le webhook vérifie `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent`.
- La décrémentation de stock est atomique via RPC `confirmer_commande_payee` (verrou `FOR UPDATE`).
- `/api/checkout/session-status` requiert authentification + vérification ownership via `orders.stripe_session_id`.

## RPC Supabase

- `get_user_email(user_id)` : retourne l'email d'un utilisateur (depuis auth.users).
- `remplacer_pack_products(p_pack_id, p_product_ids)` : remplace les produits d'un pack. `SECURITY DEFINER`, contrôle de rôle interne.
- `confirmer_commande_payee(p_order_id, p_stripe_session_id, p_payment_intent_id)` : confirme commande + décrémente stock. Retourne `boolean` (`true` = vient d'être confirmé, `false` = déjà payé). Utiliser ce retour pour ne pas renvoyer l'email de confirmation sur un retry.

`types/database.ts` est **manuel** — mettre à jour `Database.public.Functions` lors de tout changement de signature RPC.

## Conventions

- **Zod v4** : `error:` au lieu de `invalid_type_error:`.
- **Apostrophes JSX** : `&apos;` dans le texte JSX.
- **Pages admin dynamiques** : conserver `export const dynamic = "force-dynamic"`.
- **JSON-LD** : utiliser `JSON.stringify(data).replace(/</g, "\\u003c")` pour éviter le XSS via les valeurs produits.
- **Redirect après `next`** : valider que `next` commence par `/`, ne commence pas par `//`, et ne contient pas `://`.
- **Marque** : **ÉlectroMétropolitain** — ne pas utiliser l'ancien nom `ElectroShop`.
- **Pas de Co-Authored-By** dans les commits.

## Règle anti-boucle infinie client

```ts
// ✅ Correct
const supabase = useMemo(() => createClient(), [])

// ❌ Provoque une boucle infinie (nouvelle instance à chaque render)
const supabase = createClient()
```

Toujours réinitialiser les états de chargement même sur early return :
```ts
const fetchData = useCallback(async () => {
  if (!user?.id) { setIsLoading(false); return }
  try {
    // fetch
  } finally {
    setIsLoading(false)
  }
}, [user, supabase])
```

## SEO

- Pages produits : JSON-LD `Product` + `BreadcrumbList`.
- Pages catégories : JSON-LD `ItemList`.
- Accueil : JSON-LD `Store`.
- Packs : `/packs/[slug]` (pas l'UUID). Catégories : `/categories/[slug]`.
- Pages de recherche : `noindex`.
- Image manquante : `public/placeholder.svg`.

## Branches

- `main` : production
- `dev` : développement actif
