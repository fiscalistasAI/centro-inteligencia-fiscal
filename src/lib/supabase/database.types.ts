/**
 * Tipos de la base de datos.
 *
 * Escritos a mano para reflejar `supabase/migrations/0001_init.sql`.
 * Cuando el proyecto de Supabase esté enlazado, regenerarlos con:
 *
 *   supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 *
 * (Los errores de tipo `never` al consultar tablas casi siempre significan
 * que este archivo quedó desfasado del esquema real.)
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type DeclarationStatus =
  | "processing"
  | "review_required"
  | "completed"
  | "failed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          legal_name: string;
          trade_name: string | null;
          rfc: string;
          tax_regime: string | null;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          legal_name: string;
          trade_name?: string | null;
          rfc: string;
          tax_regime?: string | null;
          is_demo?: boolean;
        };
        Update: {
          legal_name?: string;
          trade_name?: string | null;
          rfc?: string;
          tax_regime?: string | null;
        };
        Relationships: [];
      };
      declarations: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          document_type: string | null;
          declaration_type: string | null;
          period_type: string | null;
          year: number | null;
          month: number | null;
          filing_date: string | null;
          operation_number: string | null;
          file_path: string | null;
          file_name: string | null;
          file_size: number | null;
          status: DeclarationStatus;
          error_message: string | null;
          rfc_extracted: string | null;
          rfc_matches: boolean | null;
          raw_extraction: Json | null;
          confidence: Json | null;
          notes: string | null;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          document_type?: string | null;
          declaration_type?: string | null;
          period_type?: string | null;
          year?: number | null;
          month?: number | null;
          filing_date?: string | null;
          operation_number?: string | null;
          file_path?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          status?: DeclarationStatus;
          error_message?: string | null;
          rfc_extracted?: string | null;
          rfc_matches?: boolean | null;
          raw_extraction?: Json | null;
          confidence?: Json | null;
          notes?: string | null;
          is_demo?: boolean;
        };
        Update: {
          document_type?: string | null;
          declaration_type?: string | null;
          period_type?: string | null;
          year?: number | null;
          month?: number | null;
          filing_date?: string | null;
          operation_number?: string | null;
          status?: DeclarationStatus;
          error_message?: string | null;
          rfc_extracted?: string | null;
          rfc_matches?: boolean | null;
          raw_extraction?: Json | null;
          confidence?: Json | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "declarations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      declaration_tax_data: {
        Row: {
          id: string;
          declaration_id: string;
          user_id: string;
          isr_tax_due: number | null;
          isr_withholdings: number | null;
          isr_payments: number | null;
          iva_charged: number | null;
          iva_creditable: number | null;
          iva_withholdings: number | null;
          iva_due: number | null;
          iva_balance_favor: number | null;
          amount_due: number | null;
          amount_paid: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          declaration_id: string;
          user_id: string;
          isr_tax_due?: number | null;
          isr_withholdings?: number | null;
          isr_payments?: number | null;
          iva_charged?: number | null;
          iva_creditable?: number | null;
          iva_withholdings?: number | null;
          iva_due?: number | null;
          iva_balance_favor?: number | null;
          amount_due?: number | null;
          amount_paid?: number | null;
        };
        Update: {
          isr_tax_due?: number | null;
          isr_withholdings?: number | null;
          isr_payments?: number | null;
          iva_charged?: number | null;
          iva_creditable?: number | null;
          iva_withholdings?: number | null;
          iva_due?: number | null;
          iva_balance_favor?: number | null;
          amount_due?: number | null;
          amount_paid?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "declaration_tax_data_declaration_id_fkey";
            columns: ["declaration_id"];
            isOneToOne: true;
            referencedRelation: "declarations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      declaration_status: DeclarationStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};

export type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
export type DeclarationRow = Database["public"]["Tables"]["declarations"]["Row"];
export type TaxDataRow = Database["public"]["Tables"]["declaration_tax_data"]["Row"];
