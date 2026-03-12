// Types auto-générés par Supabase CLI (placeholder — remplacer par `npx supabase gen types typescript`)
// Pour générer : npx supabase gen types typescript --project-id <votre-project-id> > types/database.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          address: string | null;
          role: "client" | "admin" | "employee";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          brand: string;
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total_amount: number;
          stripe_payment_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      deliveries: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          scheduled_date: string | null;
          delivered_at: string | null;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["deliveries"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["deliveries"]["Insert"]>;
      };
      service_requests: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          subject: string;
          description: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["service_requests"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["service_requests"]["Insert"]
        >;
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wishlist"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["wishlist"]["Insert"]>;
      };
      stock_alerts: {
        Row: {
          id: string;
          product_id: string;
          email: string;
          notified_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["stock_alerts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["stock_alerts"]["Insert"]>;
      };
      packs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["packs"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["packs"]["Insert"]>;
      };
      pack_products: {
        Row: { pack_id: string; product_id: string };
        Insert: Database["public"]["Tables"]["pack_products"]["Row"];
        Update: Partial<Database["public"]["Tables"]["pack_products"]["Row"]>;
      };
      product_categories: {
        Row: { product_id: string; category_id: string };
        Insert: Database["public"]["Tables"]["product_categories"]["Row"];
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Row"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["product_images"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
      };
      product_accessories: {
        Row: { product_id: string; accessory_id: string };
        Insert: Database["public"]["Tables"]["product_accessories"]["Row"];
        Update: Partial<Database["public"]["Tables"]["product_accessories"]["Row"]>;
      };
      discounts: {
        Row: {
          id: string;
          product_id: string | null;
          pack_id: string | null;
          discount_type: "percentage" | "fixed";
          value: number;
          starts_at: string | null;
          ends_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["discounts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["discounts"]["Insert"]>;
      };
    };
  };
};
