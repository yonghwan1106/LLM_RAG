import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export { pool as db }

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: number
          title: string
          content: string
          source: string | null
          metadata: any | null
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          source?: string | null
          metadata?: any | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          source?: string | null
          metadata?: any | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: number
          session_id: string
          user_id: string | null
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          session_id: string
          user_id?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          session_id?: string
          user_id?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: number
          session_id: string
          role: 'user' | 'assistant'
          content: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: number
          session_id: string
          role: 'user' | 'assistant'
          content: string
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: number
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          metadata?: any | null
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
          id: number
          title: string
          content: string
          source: string | null
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