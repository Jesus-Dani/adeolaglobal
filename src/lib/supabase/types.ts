// Hand-written to match supabase/migrations/20260816220000_phase1_core_schema.sql
// and 20260817120000_phase2_cart_wishlist_search.sql. Regenerate/replace with
// `supabase gen types typescript` once the project is CLI-linked — see
// supabase/migrations for the source of truth in the meantime.
//
// Every table needs `Relationships: []` and the schema needs `Views` /
// `Functions` / `Enums` / `CompositeTypes` keys — @supabase/postgrest-js's
// `GenericTable`/`GenericSchema` constraints require them structurally, even
// though we don't use any of them. Omitting them doesn't error at the
// `Database` type's own definition site — it silently breaks row-type
// inference everywhere `.from(...)` is called instead (was masked in
// products.ts by an `as` cast until cart/wishlist queries without a cast
// surfaced it as `never`).

export type ProductStatus = "draft" | "active" | "archived";
export type ProfileRole = "customer" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["profiles"]["Row"], "id">> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          base_price: number;
          cost_price: number | null;
          images: string[];
          status: ProductStatus;
          is_bestseller: boolean;
          is_new: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          category_id: string;
          name: string;
          slug: string;
          base_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string | null;
          colour: string | null;
          material: string | null;
          style: string | null;
          sku: string;
          price_override: number | null;
          stock_count: number;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_variants"]["Row"]> & {
          product_id: string;
          sku: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      carts: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["carts"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["carts"]["Row"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cart_items"]["Row"]> & {
          cart_id: string;
          variant_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["wishlists"]["Row"]> & {
          user_id: string;
          product_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlists"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type Wishlist = Database["public"]["Tables"]["wishlists"]["Row"];

/** What storefront queries actually select — never includes cost_price (admin-only column). */
export type PublicProduct = Omit<Product, "cost_price">;
