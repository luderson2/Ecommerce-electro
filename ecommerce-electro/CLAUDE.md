# Contexte projet — ElectroShop

## Stack
- **Framework** : Next.js 16 (App Router, Turbopack)
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth + `@supabase/ssr`
- **Styling** : Tailwind CSS + shadcn/ui
- **Validation** : Zod v4
- **Paiement** : Stripe
- **Langage** : TypeScript strict

## Structure du projet
```
app/
  (front-office)/     ← Pages publiques (catalogue, packs, comparateur, panier…)
  admin/              ← Dashboard admin (protégé)
    page.tsx          ← Dashboard avec stats + graphique CA
    produits/         ← CRUD produits
    categories/       ← CRUD catégories
    packs/            ← CRUD packs
    commandes/        ← Liste + détail commandes
    livraisons/       ← Liste + détail livraisons
    rabais/           ← CRUD rabais (discounts)
    sav/              ← Liste + détail demandes SAV
    clients/          ← Liste clients
components/
  admin/              ← Formulaires admin (CategorieForm, PackForm, ProduitForm, RabaisForm)
  produits/           ← ProductCard, etc.
  comparateur/        ← Comparateur de produits
  ui/                 ← Composants shadcn/ui
lib/
  supabase/           ← client.ts, server.ts, middleware.ts
  actions/            ← Server Actions (categories, commandes, livraisons, packs, produits, rabais, sav)
  validations/        ← Schémas Zod (product, pack, order, auth)
types/
  database.ts         ← Types Supabase manuels (pas auto-générés)
  index.ts            ← Types métier (Product, Order, Pack, Delivery, etc.)
```

## Base de données (tables principales)
- `profiles` — utilisateurs (role: client | admin | employee)
- `products` — produits (slug, brand, stock, is_active)
- `categories` — catégories (slug, parent_id nullable)
- `product_categories` — relation produit ↔ catégorie
- `product_images` — images produits (url, sort_order)
- `product_accessories` — relation produit ↔ accessoire
- `orders` — commandes (status: en_attente | payee | en_preparation | livraison | livree | annulee)
- `order_items` — lignes de commande
- `deliveries` — livraisons (status: planifiee | en_transit | livree | echec)
- `service_requests` — SAV (status: ouvert | en_cours | resolu | ferme)
- `packs` — packs produits (slug, is_active)
- `pack_products` — relation pack ↔ produit
- `discounts` — rabais (discount_type: percentage | fixed, is_active)
- `wishlist` — liste de souhaits
- `stock_alerts` — alertes de stock par email

## Conventions importantes
- **Server Actions** : toutes dans `lib/actions/`, fichiers séparés par domaine
- **`force-dynamic`** : toutes les pages admin ont `export const dynamic = "force-dynamic"` pour éviter le cache
- **`staleTimes: { dynamic: 0 }`** dans `next.config.ts` pour désactiver le router cache client
- **Types Supabase** : `types/database.ts` est écrit manuellement (pas généré par CLI) — inclut `Relationships` pour que les joins fonctionnent avec Supabase v2.99+
- **Zod v4** : utiliser `error:` au lieu de `invalid_type_error:` dans les schemas
- **Navigation** : toujours `<Link>` de `next/link`, jamais `<a>` pour les routes internes
- **Apostrophes dans JSX** : utiliser `&apos;` au lieu de `'`
- **Pas de Co-Authored-By** dans les commits (projet de stage)

## Clients Supabase
- `lib/supabase/server.ts` — pour Server Components et Server Actions
- `lib/supabase/client.ts` — pour Client Components

## Règle anti-boucle infinie (Client Components)

**Toujours** memoïser le client Supabase dans les composants React :
```ts
// ✅ Correct
const supabase = useMemo(() => createClient(), [])

// ❌ Interdit — crée une nouvelle instance à chaque render,
//    ce qui rend les useCallback/useEffect dépendants de `supabase` instables
//    → boucle infinie de rechargement
const supabase = createClient()
```

**Toujours** garantir que les états de chargement se réinitialisent avec `try/catch/finally` :
```ts
// ✅ Correct
const fetchData = useCallback(async () => {
  if (!user?.id) {
    setIsLoading(false)  // ← reset même sur early return
    return
  }
  try {
    // ...fetch...
  } catch (err) {
    console.error(err)
  } finally {
    setIsLoading(false)  // ← toujours appelé
  }
}, [user, supabase])

// ❌ Interdit — early return sans reset → spinner infini
const fetchData = async () => {
  if (!user?.id) return  // ← isLoading reste true pour toujours
  try { ... } finally { setIsLoading(false) }
}
```

## Fonction Supabase RPC
- `get_user_email(user_id)` — retourne l'email d'un utilisateur (SECURITY DEFINER)

## Branches
- `main` — production
- `dev` — développement actif
