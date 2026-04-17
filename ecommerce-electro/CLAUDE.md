# Contexte projet - ÉlectroMétropolitain

Ce projet est une boutique e-commerce d'électroménagers pour un stage étudiant. Le résultat doit rester crédible pour un commerce réel: interface claire, SEO propre, sécurité correcte sur les flux paiement/admin, et code maintenable.

## Stack

- **Framework**: Next.js 16.2.4, App Router, Turbopack
- **Base de données**: Supabase PostgreSQL
- **Auth**: Supabase Auth + `@supabase/ssr`
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod v4
- **Paiement**: Stripe Checkout + webhook signé
- **Courriels**: Resend
- **Langage**: TypeScript strict

## Structure du projet

```text
app/
  (front-office)/          Pages publiques
    page.tsx               Accueil + JSON-LD Store
    catalogue/             Catalogue + fiches produits
    categories/[slug]/     Pages catégories SEO
    packs/[slug]/          Pages packs SEO
    recherche/             Recherche produits noindex
    conditions/            Page légale
    confidentialite/       Page légale
    livraison-retours/     Page service
    garantie/              Page service
  (auth)/                  Connexion / inscription
  (client)/compte/         Profil, panier, checkout, commandes, SAV, wishlist
  admin/                   Dashboard admin protégé
  api/stripe/webhook/      Webhook Stripe signé
  robots.ts                Robots SEO
  sitemap.ts               Sitemap dynamique
components/
  admin/                   Formulaires et composants admin
  layout/                  Navbar, Footer
  packs/                   PackActions, PackCard
  produits/                ProductCard, ProductActions, catalogue
  ui/                      Composants shadcn/ui
contexts/
  auth-context.tsx         Session utilisateur client
  cart-context.tsx         Panier / wishlist
lib/
  actions/                 Server Actions par domaine
  payments/orders.ts       Confirmation sécurisée des commandes payées
  supabase/                Clients Supabase client/server/admin
  validations/             Schémas Zod
supabase/migrations/       RPC et migrations SQL
types/
  database.ts              Types Supabase manuels
  index.ts                 Types métier
```

## Règles de sécurité

- Les actions admin doivent passer par `verifierAdmin()` dans `lib/actions/_guard.ts`.
- Les pages admin doivent rester protégées par `app/admin/layout.tsx`.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client.
- Le client admin Supabase dans `lib/supabase/admin.ts` doit rester serveur uniquement.
- Les prix de checkout doivent toujours être recalculés depuis Supabase.
- Ne jamais faire confiance aux données panier client pour le prix, le nom produit, l'image ou le total.
- La confirmation de commande doit passer par `confirmerCommandePayeeDepuisSession()` et vérifier:
  - `stripe_session_id`
  - `metadata.order_id`
  - `metadata.user_id`
  - montant Stripe
  - devise
  - statut payé
- Le webhook Stripe doit vérifier `STRIPE_WEBHOOK_SECRET`.
- La décrémentation de stock doit rester atomique via RPC `confirmer_commande_payee`.

## RPC Supabase

- `get_user_email(user_id)`: retourne l'email d'un utilisateur.
- `remplacer_pack_products(p_pack_id, p_product_ids)`: remplace les produits d'un pack. Fonction `SECURITY DEFINER`, `search_path` fixé, exécution limitée aux utilisateurs authentifiés avec contrôle de rôle admin/employee dans la fonction.
- `confirmer_commande_payee(p_order_id, p_stripe_session_id, p_payment_intent_id)`: confirme une commande et décrémente le stock en transaction.

## SEO et UI/UX

- La marque publique est **ÉlectroMétropolitain**. Éviter l'ancien nom `ElectroShop`.
- Les pages publiques doivent avoir des titres et descriptions cohérents.
- Les pages produits utilisent JSON-LD `Product` et `BreadcrumbList`.
- Les pages catégories utilisent JSON-LD `ItemList`.
- L'accueil utilise JSON-LD `Store`.
- Les packs publics utilisent `/packs/[slug]`, pas l'UUID.
- Les catégories SEO utilisent `/categories/[slug]`.
- Les pages de recherche sont `noindex`.
- Les liens internes doivent utiliser `next/link`.
- Les boutons icônes doivent avoir un `aria-label`.
- Éviter les placeholders cassés ou emojis mojibake. Utiliser `public/placeholder.svg` quand aucune image produit n'existe.
- Le bouton "Ajouter au panier" doit être fonctionnel sur les cartes, les fiches produits et les packs.

## Conventions importantes

- **Server Actions**: fichiers séparés par domaine dans `lib/actions/`.
- **Pages admin dynamiques**: conserver `export const dynamic = "force-dynamic"` sur les pages admin.
- **Types Supabase**: `types/database.ts` est manuel. Mettre à jour les fonctions RPC dans `Database.public.Functions`.
- **Zod v4**: utiliser `error:` au lieu de `invalid_type_error:`.
- **Apostrophes JSX**: utiliser `&apos;` dans le texte JSX.
- **Pas de Co-Authored-By** dans les commits.

## Règle anti-boucle infinie client

Toujours memoïser le client Supabase dans les composants React:

```ts
const supabase = useMemo(() => createClient(), [])
```

Éviter:

```ts
const supabase = createClient()
```

Toujours réinitialiser les états de chargement, même sur early return:

```ts
const fetchData = useCallback(async () => {
  if (!user?.id) {
    setIsLoading(false)
    return
  }

  try {
    // fetch
  } finally {
    setIsLoading(false)
  }
}, [user, supabase])
```

## Validation avant livraison

Exécuter:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Ces commandes doivent rester vertes avant une remise ou une mise en production.

## Branches

- `main`: production
- `dev`: développement actif
