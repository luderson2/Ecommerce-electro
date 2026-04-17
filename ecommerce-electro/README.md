# ÉlectroMétropolitain

Application e-commerce d'électroménagers réalisée dans le cadre d'un stage étudiant. Le site couvre le catalogue public, les fiches produits, les packs, le panier, le paiement Stripe, l'espace client et un tableau de bord admin connecté à Supabase.

## Stack

- Next.js 16.2.4, App Router, Turbopack
- React 19
- TypeScript strict
- Supabase PostgreSQL + Supabase Auth + `@supabase/ssr`
- Stripe Checkout + webhook signé
- Tailwind CSS + shadcn/ui
- Zod v4
- Resend pour les courriels SAV

## Fonctionnalités principales

- Catalogue public avec filtres, tri, recherche et fiches produits.
- Pages catégories SEO: `/categories/[slug]`.
- Pages packs SEO: `/packs/[slug]`.
- Panier, wishlist, checkout et confirmation Stripe.
- Webhook Stripe `checkout.session.completed` pour confirmer les commandes côté serveur.
- Décrément du stock via RPC Supabase transactionnelle.
- Espace client: profil, commandes, wishlist, SAV.
- Dashboard admin: produits, catégories, packs, rabais, commandes, livraisons, SAV, clients.
- SEO technique: metadata enrichie, `robots.txt`, `sitemap.xml`, JSON-LD Product, Breadcrumb, ItemList et Store.
- Pages légales: conditions, confidentialité, livraison-retours, garantie.

## Démarrage local

```bash
npm install
npm run dev
```

Le site est disponible sur `http://localhost:3000`.

## Scripts

```bash
npm run dev       # serveur de développement
npm run build     # build production
npm run start     # lancer le build
npm run lint      # ESLint
npx tsc --noEmit  # vérification TypeScript
npm audit --omit=dev
```

## Variables d'environnement

Créer un fichier `.env.local` à partir de `.env.local.example`, puis configurer au minimum:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

Important: `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais être exposée côté client. Elle est utilisée uniquement côté serveur pour le webhook Stripe et la confirmation sécurisée des commandes.

## Stripe

Le paiement utilise Stripe Checkout. La confirmation de commande ne dépend pas seulement du retour navigateur: elle est traitée par le webhook signé.

Endpoint webhook:

```text
/api/stripe/webhook
```

Événement requis:

```text
checkout.session.completed
```

Pour tester en local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier le `whsec_...` généré dans `STRIPE_WEBHOOK_SECRET`.

## Supabase

Les types Supabase sont maintenus manuellement dans `types/database.ts`.

Migrations importantes:

- `20260414_remplacer_pack_products.sql`: remplace atomiquement les produits d'un pack avec contrôle de rôle admin/employee.
- `20260417_confirmer_commande_payee.sql`: confirme une commande payée, vérifie la session Stripe et décrémente le stock en transaction.

Avant de tester un paiement réel, appliquer les migrations Supabase.

## SEO

Le projet inclut:

- `app/sitemap.ts`
- `app/robots.ts`
- metadata globale dans `app/layout.tsx`
- canonical sur catalogue, produits, packs et catégories
- JSON-LD:
  - `Store` sur l'accueil
  - `Product` et `BreadcrumbList` sur les fiches produits
  - `ItemList` sur les catégories

Les pages privées `/admin`, `/compte` et `/api` sont exclues dans `robots.ts`.

## Validation actuelle

Les contrôles suivants doivent rester verts avant livraison:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

État au dernier passage: build OK, lint OK, TypeScript OK, audit OK.
