export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      deleted_transactions: {
        Row: {
          deleted_at: string
          id: string
          original_id: string
          transaction_data: Json
        }
        Insert: {
          deleted_at?: string
          id?: string
          original_id: string
          transaction_data: Json
        }
        Update: {
          deleted_at?: string
          id?: string
          original_id?: string
          transaction_data?: Json
        }
        Relationships: []
      }
      main_accounts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          company_name: string
          created_at: string
          currency: string
          fiscal_year_start: string | null
          id: string
          theme: string
          updated_at: string | null
        }
        Insert: {
          company_name?: string
          created_at?: string
          currency?: string
          fiscal_year_start?: string | null
          id?: string
          theme?: string
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          currency?: string
          fiscal_year_start?: string | null
          id?: string
          theme?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sub_accounts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          main_account_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          main_account_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          main_account_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_accounts_main_account_id_fkey"
            columns: ["main_account_id"]
            referencedRelation: "main_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          date: string
          description: string
          id: string
          main_account_id: string
          sub_account_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          date: string
          description: string
          id?: string
          main_account_id: string
          sub_account_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          id?: string
          main_account_id?: string
          sub_account_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_main_account_id_fkey"
            columns: ["main_account_id"]
            referencedRelation: "main_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sub_account_id_fkey"
            columns: ["sub_account_id"]
            referencedRelation: "sub_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}