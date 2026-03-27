# Projet E-Commerce Électroménager — Stage DEC

## Description
Plateforme B2C complète pour la vente, gestion de livraison et service après-vente d'un magasin d'électroménagers québécois (ElectroMétropolitain).

## Stack Technologique
- **Framework** : Next.js 16 + TypeScript + React 19
- **UI** : Shadcn/ui (new-york) + Tailwind v4 + Lucide React + Radix UI
- **Backend/DB** : Supabase (PostgreSQL + RLS + Auth SSR)
- **Paiements** : Stripe (`2026-02-25.clover`) — `stripe` + `@stripe/stripe-js`
- **Formulaires** : Zod v4 + react-hook-form + Server Actions (useActionState)
- **Notifications** : sonner (toasts)
- **Emails** : Resend
- **Graphiques** : recharts
- **Utilitaires** : date-fns, embla-carousel-react, next-themes
- **Déploiement** : Vercel

## Palette Design
- Navy blue primaire : `#1a2e5a` → `oklch(0.28 0.09 258)` → classes `bg-primary`, `text-primary`
- Orange accent : `#f47421` → `oklch(0.66 0.19 42)` → classes `bg-accent`, `text-accent`
- Gris surface : `#f4f5f7` → `oklch(0.97 0.002 247)` → classe `bg-surface`
- ⚠️ Toujours utiliser `text-muted-foreground` (jamais `text-muted` qui est quasi-blanc)

## Architecture des Routes

### Front-Office (public)
| Route | État | Notes |
|---|---|---|
| `/` | ✅ Supabase SSR | Produits récents, catégories, packs |
| `/catalogue` | ✅ Supabase SSR | Filtres URL params (catégorie, marque, prix, stock), sidebar responsive |
| `/catalogue/[slug]` | ✅ Supabase SSR | Images, catégories, produits similaires |
| `/packs` | ✅ Supabase SSR | Total calculé depuis pack_products |
| `/packs/[slug]` | ✅ Supabase SSR | Param = id (packs sans slug en BD) |
| `/comparateur` | ✅ Supabase client | Comparaison côté client |
| `/categories/[slug]` | ⚠️ Stub | Implémentation TODO |
| `/recherche` | ⚠️ Stub | Accepte `?q=`, implémentation TODO |

### Compte Client (🔒 Auth requise)
| Route | État |
|---|---|
| `/compte/panier` | ⚠️ Stub |
| `/compte/wishlist` | ⚠️ Stub |
| `/compte/commandes` | ⚠️ Stub |
| `/compte/commandes/[id]` | ⚠️ Minimal |
| `/compte/sav` | ⚠️ Stub |
| `/compte/profil` | ⚠️ Stub |

### Auth
| Route | État |
|---|---|
| `/connexion` | ✅ Server Action (seConnecter → redirect /admin, seDeconnecter) |
| `/inscription` | ⚠️ Stub — formulaire à créer (collègue en charge) |

### Back-Office Admin (🔒 Auth requise via proxy.ts)
| Route | État | Notes |
|---|---|---|
| `/admin` | ✅ Dashboard complet | KPIs (produits, commandes, CA, en attente), tableau 8 dernières commandes, graphique CA 6 mois, alertes stock bas |
| `/admin/produits` | ✅ Liste SSR + CRUD | ProduitForm (création) + ProduitEditForm (édition) |
| `/admin/produits/nouveau` | ✅ Formulaire création | creerProduit Server Action + Zod |
| `/admin/produits/[id]` | ✅ Formulaire édition | SSR pré-rempli |
| `/admin/commandes` | ✅ Liste SSR | Miniatures produit, filtres par statut (pills), lignes cliquables |
| `/admin/commandes/[id]` | ✅ Détail complet | Articles+photos, infos client+courriel, livraison+notes, Stripe link, StatutForm |
| `/admin/packs` | ✅ Liste SSR | Nom, description tronquée, nb produits, prix, badge Actif/Inactif |
| `/admin/packs/nouveau` | ✅ Formulaire création | PackForm + sélecteur produits interactif |
| `/admin/packs/[id]` | ✅ Formulaire édition | Produits pré-sélectionnés |
| `/admin/categories` | ⚠️ Stub | |
| `/admin/clients` | ⚠️ Stub | |
| `/admin/livraisons` | ⚠️ Stub | |
| `/admin/rabais` | ⚠️ Stub | |
| `/admin/sav` | ⚠️ Stub | |

## Base de Données — Supabase (tables actives)

### Utilisateurs
- `profiles` — id, full_name, phone?, address?, role (`client`/`admin`/`employee`)
- Email accessible via la fonction SQL `get_user_email(user_id uuid)` (SECURITY DEFINER)

### Produits
- `products` — id, name, slug, description?, price, brand, stock, is_active, created_at, updated_at
  - ⚠️ Pas de `category_id` direct → liaison via `product_categories`
  - ⚠️ Pas de `specs`, `rating`, `reviewCount`, `originalPrice`
- `categories` — id, name, slug, description?, parent_id?
- `product_categories` — product_id, category_id (jonction many-to-many)
- `product_images` — id, product_id, url, sort_order
- `product_accessories` — product_id, accessory_id

### Commandes
- `orders` — id, user_id, status, total_amount, stripe_payment_id?, created_at
- `order_items` — id, order_id, product_id, quantity, unit_price

### Livraison
- `deliveries` — id, order_id, status, scheduled_date?, delivered_at?, notes?, created_at

### SAV
- `service_requests` — id, user_id, order_id?, subject, description, status, created_at

### Fonctionnalités Client
- `wishlist` — id, user_id, product_id
- `stock_alerts` — id, product_id, email, notified_at?

### Packs & Rabais
- `packs` — id, name, description?, price, is_active ⚠️ **pas de slug**
- `pack_products` — pack_id, product_id
- `discounts` — id, product_id?, pack_id?, discount_type, value, starts_at?, ends_at?, is_active

### Types TypeScript
- `OrderStatus` : "en_attente" | "payee" | "en_preparation" | "livraison" | "livree" | "annulee"
- `DeliveryStatus` : "planifiee" | "en_transit" | "livree" | "echec"
- `SavStatus` : "ouvert" | "en_cours" | "resolu" | "ferme"

## Structure des Dossiers

```
ecommerce-electro/
├── proxy.ts                          ← Session middleware Next.js 16 (export `proxy`, pas `middleware`)
├── next.config.ts                    ← Images: supabase.co + placehold.co (dangerouslyAllowSVG)
├── app/
│   ├── layout.tsx                    ← Root layout (html, body, lang="fr", suppressHydrationWarning)
│   ├── globals.css                   ← Palette + Tailwind v4
│   ├── (front-office)/
│   │   ├── layout.tsx                ← Navbar + main + Footer
│   │   ├── page.tsx                  ← Home SSR
│   │   ├── catalogue/
│   │   │   ├── page.tsx              ← Liste + filtres URL params
│   │   │   └── [slug]/page.tsx       ← Détail produit SSR
│   │   ├── packs/
│   │   │   ├── page.tsx              ← Liste packs SSR
│   │   │   └── [slug]/page.tsx       ← Détail pack (param = id)
│   │   ├── comparateur/page.tsx      ← Client component
│   │   ├── categories/[slug]/page.tsx← Stub
│   │   └── recherche/page.tsx        ← Stub (?q=)
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── connexion/
│   │   │   ├── page.tsx
│   │   │   └── ConnexionForm.tsx
│   │   └── inscription/page.tsx      ← Stub
│   ├── (client)/
│   │   └── compte/
│   │       ├── panier/page.tsx       ← Stub
│   │       ├── wishlist/page.tsx     ← Stub
│   │       ├── commandes/
│   │       │   ├── page.tsx          ← Stub
│   │       │   └── [id]/page.tsx     ← Minimal
│   │       ├── profil/page.tsx       ← Stub
│   │       └── sav/page.tsx          ← Stub
│   └── admin/
│       ├── layout.tsx                ← AdminSidebar + main (px-8 py-8, w-full)
│       ├── page.tsx                  ← Dashboard SSR complet
│       ├── loading.tsx
│       ├── produits/
│       │   ├── page.tsx
│       │   ├── ProduitsFilters.tsx
│       │   ├── nouveau/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── ProduitEditForm.tsx
│       ├── commandes/
│       │   ├── page.tsx              ← Liste SSR + filtres statut + miniatures
│       │   └── [id]/
│       │       ├── page.tsx          ← Détail complet SSR
│       │       └── StatutForm.tsx    ← Client, useActionState
│       ├── packs/
│       │   ├── page.tsx              ← Liste SSR
│       │   ├── nouveau/page.tsx      ← SSR → PackForm
│       │   └── [id]/page.tsx         ← SSR → PackForm (édition)
│       ├── categories/page.tsx       ← Stub
│       ├── clients/page.tsx          ← Stub
│       ├── livraisons/page.tsx       ← Stub
│       ├── rabais/page.tsx           ← Stub
│       └── sav/page.tsx              ← Stub
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── Hero.tsx                  ← Données hardcodées (à dynamiser)
│   │   ├── Categories.tsx
│   │   └── TrustBar.tsx
│   ├── produits/
│   │   ├── ProductCard.tsx
│   │   ├── CatalogueFilters.tsx
│   │   ├── TriSelect.tsx
│   │   └── FiltresMobile.tsx
│   ├── packs/PackCard.tsx
│   ├── comparateur/Comparateur.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── StatCard.tsx
│   │   ├── ChartCAMensuel.tsx        ← Client, recharts BarChart
│   │   ├── ProduitForm.tsx           ← Client, création produit
│   │   └── PackForm.tsx              ← Client, création/édition pack + sélecteur produits
│   └── ui/                           ← Shadcn/ui (ne pas modifier)
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 ← createClient() RSC/Server Actions (anon key)
│   │   ├── client.ts                 ← createClient() composants client
│   │   └── middleware.ts             ← updateSession() appelé par proxy.ts
│   ├── actions/
│   │   ├── auth.ts                   ← seConnecter(), seDeconnecter()
│   │   ├── produits.ts               ← creerProduit()
│   │   ├── commandes.ts              ← changerStatutCommande()
│   │   └── packs.ts                  ← creerPack(), modifierPack()
│   ├── validations/
│   │   ├── auth.ts                   ← connexionSchema, inscriptionSchema
│   │   ├── product.ts                ← produitSchema, alerteStockSchema
│   │   ├── order.ts                  ← adresseLivraisonSchema, savSchema
│   │   └── pack.ts                   ← packSchema
│   ├── utils.ts                      ← cn(), formatPrix(), slugify(), calculerEconomie()
│   └── stripe.ts
└── types/
    ├── index.ts                      ← Types métier (Role, Product, Order, Pack, etc.)
    └── database.ts                   ← ⚠️ Placeholder — régénérer : npx supabase gen types typescript --project-id qvqzcudgcvzeixtqktzx
```

## Server Actions

| Action | Fichier | Comportement |
|---|---|---|
| `seConnecter()` | auth.ts | Login email/mdp → redirect /admin |
| `seDeconnecter()` | auth.ts | Logout → redirect /connexion |
| `creerProduit()` | produits.ts | Valide produitSchema → insert → redirect /admin/produits |
| `changerStatutCommande()` | commandes.ts | Valide statut → update → revalidatePath |
| `creerPack()` | packs.ts | Valide packSchema → insert packs + pack_products → redirect /admin/packs |
| `modifierPack()` | packs.ts | Valide packSchema → update packs + replace pack_products → redirect /admin/packs |

## Validations Zod

- `produitSchema` : name (min 3), slug, description?, price (>0), brand, stock (≥0), is_active
- `packSchema` : name (min 3), description?, price (>0), is_active
- `connexionSchema` : email, motDePasse (min 8)
- `inscriptionSchema` : nomComplet, email, telephone?, motDePasse, confirmerMotDePasse
- `adresseLivraisonSchema` : prenom, nom, adresse, ville, province, codePostal (CA), telephone
- `savSchema` : typeAppareil, marque, numeroModele, description (min 20), order_id?

## Utilitaires (lib/utils.ts)
- `cn()` — clsx + tailwind-merge
- `formatPrix(montant, devise='CAD')` — Formatage fr-CA / CAD
- `calculerEconomie(prixOriginal, prixPromo)` — { montant, pourcentage }
- `slugify(texte)` — Texte → slug URL-safe

## Points d'attention
- **proxy.ts** — Next.js 16 renomme middleware.ts en proxy.ts avec export `proxy` (pas `middleware`)
- **get_user_email** — Fonction SQL SECURITY DEFINER pour accéder aux emails sans service role key
- **Junction table** — Filtrer par catégorie : passer par `product_categories`, pas par `category_id`
- **Packs sans slug** — Lien vers un pack : utiliser `id` comme paramètre URL
- **text-muted** — Quasi-blanc sur fond blanc → toujours utiliser `text-muted-foreground`
- **types/database.ts** — Placeholder à régénérer avec Supabase CLI
- **Hero.tsx** — Données hardcodées (pas encore connecté à Supabase)
- **OneDrive + Turbopack** — Le projet est dans OneDrive, ce qui corrompt le cache .next. Si le serveur panic, supprimer .next et relancer.

## Supabase
- Project ID : `qvqzcudgcvzeixtqktzx` (ElectroMétropolitain)
- URL : `https://qvqzcudgcvzeixtqktzx.supabase.co`

## Compte admin de test
- Email : `admin@electrometropolitain.ca`
- Mot de passe : `Admin1234!`

## Prochaines étapes (par priorité)
1. **Pages admin restantes** — categories, rabais, livraisons, clients, sav
2. **Panier** — state management côté client (zustand ou context)
3. **Checkout Stripe** — intégration paiement
4. **Pages compte client** — profil, commandes, wishlist, SAV
5. **Page `/inscription`** — formulaire (collègue en charge)
6. **Dynamiser Hero** — remplacer données hardcodées par Supabase
7. **`/categories/[slug]`** et **`/recherche`** — implémenter les stubs
