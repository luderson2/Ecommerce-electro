# Projet E-Commerce Électroménager — Stage DEC

## Description
Plateforme B2C complète pour la vente, gestion de livraison et service après-vente d'un magasin d'électroménagers québécois.

## Stack Technologique
- **Frontend** : Next.js 14 + TypeScript
- **UI** : Shadcn/ui + Tailwind CSS (style retail, inspiré Best Buy / Corbeil Électroménagers)
- **Backend/DB** : Supabase (PostgreSQL + RLS + Auth)
- **Paiements** : Stripe
- **Déploiement** : Vercel
- **Validation** : Zod
- **Emails** : Resend

## Architecture des Routes

### Front-Office (Client)
- `/` → Accueil
- `/catalogue` → Liste des produits
- `/catalogue/[slug]` → Fiche produit
- `/categories/[slug]` → Produits par catégorie
- `/packs` → Liste des packs
- `/packs/[slug]` → Détail d'un pack
- `/comparateur` → Comparateur de produits (2-3 produits)
- `/recherche` → Résultats de recherche

### Compte Client (🔒 Auth requise)
- `/compte/panier` → Panier + paiement Stripe
- `/compte/wishlist` → Liste de souhaits
- `/compte/commandes` → Historique des commandes
- `/compte/commandes/[id]` → Détail d'une commande + statut livraison
- `/compte/sav` → Formulaire SAV + historique demandes
- `/compte/profil` → Modifier ses informations

### Auth
- `/connexion`
- `/inscription`

### Back-Office (🔒 Admin/Employé)
- `/admin` → Dashboard (stats, alertes stock)
- `/admin/produits` → Gérer les produits
- `/admin/produits/nouveau` → Créer un produit
- `/admin/produits/[id]` → Modifier un produit
- `/admin/categories` → Gérer les catégories
- `/admin/commandes` → Toutes les commandes
- `/admin/commandes/[id]` → Détail + changer statut
- `/admin/livraisons` → Statuts + dates prévues
- `/admin/packs` → Gérer les packs
- `/admin/rabais` → Gérer les rabais
- `/admin/sav` → Demandes SAV
- `/admin/clients` → Liste des clients

## Base de Données — 15 Tables Supabase

### Utilisateurs
- `profiles` — id, full_name, phone, address, role (client/admin/employee)

### Produits
- `products` — id, name, slug, description, price, brand, stock, is_active
- `categories` — id, name, slug, description
- `product_categories` — product_id, category_id (jonction many-to-many)
- `product_images` — id, product_id, url, sort_order
- `product_accessories` — product_id, accessory_id (self-join cross-selling)

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
- `packs` — id, name, description, price, is_active
- `pack_products` — pack_id, product_id (jonction)
- `discounts` — id, product_id, pack_id, discount_type, value, starts_at, ends_at

## Rôles Utilisateurs
- `client` → accès Front-Office uniquement
- `admin` → accès complet Back-Office
- `employee` → accès livraisons + SAV

## Structure des Dossiers
```
src/
├── app/
│   ├── (front-office)/
│   ├── (auth)/
│   └── admin/
├── components/
│   ├── ui/          ← Shadcn
│   ├── produits/
│   ├── panier/
│   ├── admin/
│   └── layout/
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   └── validations/
└── types/
    └── index.ts
```

## Design
- Style retail professionnel (pas SaaS)
- Inspiré de Best Buy et Corbeil Électroménagers
- Palette : navy blue + blanc + gris + orange accent
- Référence visuelle : maquette Figma AI générée pour la page catalogue
