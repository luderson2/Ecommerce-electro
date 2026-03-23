# Projet E-Commerce Électroménager — Stage DEC

## Description
Plateforme B2C complète pour la vente, gestion de livraison et service après-vente d'un magasin d'électroménagers québécois.

## Stack Technologique
- **Frontend** : Next.js 16 + TypeScript
- **UI** : Shadcn/ui (new-york) + Tailwind v4 + Lucide React
- **Backend/DB** : Supabase (PostgreSQL + RLS + Auth SSR)
- **Paiements** : Stripe (`2026-02-25.clover`)
- **Déploiement** : Vercel
- **Validation** : Zod
- **Emails** : Resend

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
| `/catalogue` | ✅ Supabase SSR | Filtres URL params, sidebar responsive |
| `/catalogue/[slug]` | ✅ Supabase SSR | Images, catégories, produits similaires |
| `/packs` | ✅ Supabase SSR | Total calculé depuis pack_products |
| `/packs/[id]` | ✅ Supabase SSR | Param = id (packs sans slug en BD) |
| `/comparateur` | ✅ Supabase client | Champs disponibles : marque, prix, stock, description |
| `/categories/[slug]` | 🔲 À faire | |
| `/recherche` | 🔲 À faire | |

### Compte Client (🔒 Auth requise)
| Route | État |
|---|---|
| `/compte/panier` | 🔲 À faire |
| `/compte/wishlist` | 🔲 À faire |
| `/compte/commandes` | 🔲 À faire |
| `/compte/commandes/[id]` | 🔲 À faire |
| `/compte/sav` | 🔲 À faire |
| `/compte/profil` | 🔲 À faire |

### Auth
| Route | État |
|---|---|
| `/connexion` | ✅ Server Action |
| `/inscription` | 🔲 À faire |

### Back-Office (🔒 Admin/Employé)
| Route | État |
|---|---|
| `/admin` | ✅ Dashboard |
| `/admin/produits` | ✅ Liste + CRUD |
| `/admin/commandes` | ✅ Liste + détail |
| `/admin/categories` | 🔲 Page existante (à vérifier) |
| `/admin/clients` | 🔲 Page existante (à vérifier) |
| `/admin/livraisons` | 🔲 Page existante (à vérifier) |
| `/admin/packs` | 🔲 Page existante (à vérifier) |
| `/admin/rabais` | 🔲 Page existante (à vérifier) |
| `/admin/sav` | 🔲 Page existante (à vérifier) |

## Base de Données — Supabase (tables actives)

### Utilisateurs
- `profiles` — id, full_name, phone, address, role (`client`/`admin`/`employee`)

### Produits
- `products` — id, name, slug, description, price, brand, stock, is_active
  - ⚠️ Pas de `category_id` direct → liaison via `product_categories`
  - ⚠️ Pas de `specs`, `rating`, `reviewCount`, `originalPrice`
- `categories` — id, name, slug, description
- `product_categories` — product_id, category_id (jonction many-to-many)
- `product_images` — id, product_id, url, sort_order
- `product_accessories` — product_id, accessory_id

### Commandes
- `orders` — id, user_id, status, total_amount, stripe_payment_id
- `order_items` — id, order_id, product_id, quantity, unit_price

### Livraison
- `deliveries` — id, order_id, status, scheduled_date, delivered_at, notes

### SAV
- `service_requests` — id, user_id, order_id, subject, description, status

### Fonctionnalités Client
- `wishlist` — id, user_id, product_id
- `stock_alerts` — id, product_id, email, notified_at

### Packs & Rabais
- `packs` — id, name, description, price, is_active ⚠️ **pas de slug**
- `pack_products` — pack_id, product_id
- `discounts` — id, product_id, pack_id, discount_type, value, starts_at, ends_at, is_active

## Structure des Dossiers (état nettoyé)
```
ecommerce-electro/
├── app/
│   ├── layout.tsx                    ← Root layout UNIQUEMENT (html, body)
│   ├── globals.css                   ← Palette + Tailwind v4 (seul CSS valide)
│   ├── (front-office)/
│   │   ├── layout.tsx                ← Navbar + main + Footer (sans html/body)
│   │   ├── page.tsx
│   │   ├── catalogue/
│   │   ├── packs/
│   │   ├── comparateur/
│   │   └── categories/
│   ├── (auth)/
│   ├── (client)/compte/
│   └── admin/
├── components/
│   ├── layout/                       ← Navbar.tsx, Footer.tsx (ElectroMétropolitain)
│   ├── produits/                     ← ProductCard, CatalogueFilters, TriSelect, FiltresMobile
│   ├── home/                         ← Hero, Categories, FeaturedProducts, TrustBar
│   ├── packs/                        ← PackCard
│   ├── comparateur/                  ← Comparateur
│   ├── admin/                        ← AdminSidebar, ProduitForm, StatCard
│   └── ui/                           ← Shadcn (ne pas modifier)
├── lib/
│   ├── supabase/client.ts            ← Browser client
│   ├── supabase/server.ts            ← Server (RSC)
│   ├── supabase/middleware.ts        ← Session refresh
│   ├── stripe.ts
│   ├── utils.ts                      ← cn(), formatPrix(), slugify(), calculerEconomie()
│   └── validations/                  ← auth.ts, product.ts, order.ts
└── types/
    ├── index.ts
    └── database.ts
```

## Points d'attention
- `middleware.ts` supprimé — routes `/compte` et `/admin` non protégées → **à recréer**
- Filtre catégorie catalogue : passer par `product_categories` (junction), pas par `category_id`
- Lien vers un pack : utiliser `id` comme paramètre URL (pas de slug sur `packs`)
- CSS : `app/globals.css` est le seul globals.css valide du projet

## Compte admin de test
- Email : `admin@electrometropolitain.ca`
- Mot de passe : `Admin1234!`

## Prochaines étapes
1. Recréer `middleware.ts` (protection /compte + /admin)
2. Page `/inscription` + gestion session complète
3. Panier (state management côté client)
4. Checkout Stripe
5. Pages compte client (profil, commandes, SAV, wishlist)
6. Compléter / vérifier les pages admin restantes
