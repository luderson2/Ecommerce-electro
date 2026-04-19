export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          address_street: string | null;
          address_apartment: string | null;
          address_city: string | null;
          address_province: string | null;
          address_postal_code: string | null;
          address_country: string | null;
          role: "client" | "admin" | "employee";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
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
          specs: Record<string, string>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at" | "updated_at" | "specs"
        > & { specs?: Record<string, string> };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: "en_attente" | "payee" | "en_preparation" | "livraison" | "livree" | "annulee";
          total_amount: number;
          subtotal: number | null;
          tax: number | null;
          shipping: number | null;
          stripe_payment_id: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          shipping_address_street: string | null;
          shipping_address_apartment: string | null;
          shipping_address_city: string | null;
          shipping_address_province: string | null;
          shipping_address_postal_code: string | null;
          shipping_address_country: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          product_name: string | null;
          product_image: string | null;
          product_slug: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      deliveries: {
        Row: {
          id: string;
          order_id: string;
          status: "planifiee" | "en_transit" | "livree" | "echec";
          scheduled_date: string | null;
          delivered_at: string | null;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["deliveries"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["deliveries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      service_requests: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          subject: string;
          description: string;
          status: "ouvert" | "en_cours" | "resolu" | "ferme";
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["service_requests"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["service_requests"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "service_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      demandes_reparation: {
        Row: {
          id: string;
          nom: string;
          telephone: string;
          appareil: string;
          description: string;
          statut: "nouveau" | "contacte" | "en_cours" | "termine" | "annule";
          ip_hash: string | null;
          user_agent: string | null;
          notes_admin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["demandes_reparation"]["Row"],
          "id" | "created_at" | "updated_at" | "statut" | "ip_hash" | "user_agent" | "notes_admin"
        > & {
          statut?: Database["public"]["Tables"]["demandes_reparation"]["Row"]["statut"];
          ip_hash?: string | null;
          user_agent?: string | null;
          notes_admin?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["demandes_reparation"]["Insert"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          product_name: string;
          product_price: number;
          product_image: string | null;
          quantity: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["cart_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          product_name: string | null;
          product_price: number | null;
          product_image: string | null;
          product_slug: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wishlist"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["wishlist"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "wishlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      packs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["packs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["packs"]["Insert"]>;
        Relationships: [];
      };
      pack_products: {
        Row: { pack_id: string; product_id: string };
        Insert: Database["public"]["Tables"]["pack_products"]["Row"];
        Update: Partial<Database["public"]["Tables"]["pack_products"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "pack_products_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "packs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pack_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_categories: {
        Row: { product_id: string; category_id: string };
        Insert: Database["public"]["Tables"]["product_categories"]["Row"];
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_accessories: {
        Row: { product_id: string; accessory_id: string };
        Insert: Database["public"]["Tables"]["product_accessories"]["Row"];
        Update: Partial<Database["public"]["Tables"]["product_accessories"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "product_accessories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_accessories_accessory_id_fkey";
            columns: ["accessory_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
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
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["discounts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["discounts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "discounts_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discounts_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "packs";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_user_email: {
        Args: { user_id: string };
        Returns: string;
      };
      remplacer_pack_products: {
        Args: { p_pack_id: string; p_product_ids: string[] };
        Returns: void;
      };
      confirmer_commande_payee: {
        Args: {
          p_order_id: string;
          p_stripe_session_id: string;
          p_payment_intent_id: string | null;
        };
        Returns: void;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
