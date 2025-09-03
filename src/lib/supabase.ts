import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          filename: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          content?: string
          created_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          content: string
          embedding: number[]
          chunk_index: number
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          embedding: number[]
          chunk_index: number
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          embedding?: number[]
          chunk_index?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          document_id: string
          content: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}