// ─── Rôles ───────────────────────────────────────────────────────────────────
export type Role = "client" | "admin" | "employee";

// ─── Profil utilisateur ───────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: Role;
  created_at: string;
}

// ─── Produit ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  brand: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations joinées
  categories?: Category[];
  images?: ProductImage[];
  accessories?: Product[];
  discount?: Discount;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

// ─── Catégorie ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
}

// ─── Commande ─────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "en_attente"
  | "payee"
  | "en_preparation"
  | "livraison"
  | "livree"
  | "annulee";

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  stripe_payment_id?: string;
  created_at: string;
  items?: OrderItem[];
  delivery?: Delivery;
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

// ─── Livraison ────────────────────────────────────────────────────────────────
export type DeliveryStatus =
  | "planifiee"
  | "en_transit"
  | "livree"
  | "echec";

export interface Delivery {
  id: string;
  order_id: string;
  status: DeliveryStatus;
  scheduled_date?: string;
  delivered_at?: string;
  notes?: string;
}

// ─── SAV ─────────────────────────────────────────────────────────────────────
export type SavStatus = "ouvert" | "en_cours" | "resolu" | "ferme";

export interface ServiceRequest {
  id: string;
  user_id: string;
  order_id?: string;
  subject: string;
  description: string;
  status: SavStatus;
  created_at: string;
  profile?: Profile;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export type ReparationStatus =
  | "nouveau"
  | "contacte"
  | "en_cours"
  | "termine"
  | "annule";

export interface DemandeReparation {
  id: string;
  nom: string;
  telephone: string;
  appareil: string;
  description: string;
  statut: ReparationStatus;
  ip_hash?: string;
  user_agent?: string;
  notes_admin?: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

// ─── Alerte stock ────────────────────────────────────────────────────────────
export interface StockAlert {
  id: string;
  product_id: string;
  email: string;
  notified_at?: string;
}

// ─── Packs ───────────────────────────────────────────────────────────────────
export interface Pack {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  is_active: boolean;
  products?: Product[];
  discount?: Discount;
}

// ─── Rabais ───────────────────────────────────────────────────────────────────
export type DiscountType = "percentage" | "fixed";

export interface Discount {
  id: string;
  product_id?: string;
  pack_id?: string;
  discount_type: DiscountType;
  value: number;
  starts_at?: string;
  ends_at?: string;
}

// ─── Panier (état local) ─────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
