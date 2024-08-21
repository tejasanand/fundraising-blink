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
      notes: {
        Row: {
          id: number
          title: string | null
          amount: number | null
          display_name: string | null
        }
        Insert: {
          id?: number
          title?: string | null
          amount?: number | null
          display_name?: string | null
        }
        Update: {
          id?: number
          title?: string | null
          amount?: number | null
          display_name?: string | null
        }
      }
      'fundraising-blink': {
        Row: {
          id: string
          image_url: string
          title: string
          destination_wallet: string
        }
        Insert: {
          id?: string
          image_url: string
          title: string
          destination_wallet: string
        }
        Update: {
          id?: string
          image_url?: string
          title?: string
          destination_wallet?: string
        }
      }
      [key: `blink_${string}`]: {
        Row: {
          id: number
          title: string | null
          amount: number | null
          display_name: string | null
          image_url: string
          destination_wallet: string
        }
        Insert: {
          id?: number
          title?: string | null
          amount?: number | null
          display_name?: string | null
          image_url: string
          destination_wallet: string
        }
        Update: {
          id?: number
          title?: string | null
          amount?: number | null
          display_name?: string | null
          image_url?: string
          destination_wallet?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_blink_table: {
        Args: {
          table_name: string;
          p_image_url: string;
          p_title: string;
          p_destination_wallet: string;
          p_campaign_id: string;
        };
        Returns: void;
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