// Hand-written to match supabase/migrations/20260816220000_phase1_core_schema.sql.
// Regenerate/replace with `supabase gen types typescript` once the project is
// CLI-linked — see supabase/migrations for the source of truth in the meantime.

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
      };
    };
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
