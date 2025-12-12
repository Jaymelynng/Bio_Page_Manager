export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_knowledge: {
        Row: {
          content: string
          created_at: string | null
          gym_id: string
          id: string
          is_active: boolean | null
          kind: string
          priority: number | null
          question: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          gym_id: string
          id?: string
          is_active?: boolean | null
          kind: string
          priority?: number | null
          question?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          gym_id?: string
          id?: string
          is_active?: boolean | null
          kind?: string
          priority?: number | null
          question?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      attribution_events: {
        Row: {
          created_at: string | null
          event_type: string
          gym_id: string
          id: string
          metadata: Json | null
          session_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          gym_id: string
          id?: string
          metadata?: Json | null
          session_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          gym_id?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attribution_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_links: {
        Row: {
          brand_id: string
          category_id: string
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          title: string
          url: string
        }
        Insert: {
          brand_id: string
          category_id: string
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          title: string
          url: string
        }
        Update: {
          brand_id?: string
          category_id?: string
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_links_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "link_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_stats: {
        Row: {
          brand_id: string
          conversion_rate: number
          id: string
          last_updated: string
          total_clicks: number
          total_links: number
        }
        Insert: {
          brand_id: string
          conversion_rate?: number
          id?: string
          last_updated?: string
          total_clicks?: number
          total_links?: number
        }
        Update: {
          brand_id?: string
          conversion_rate?: number
          id?: string
          last_updated?: string
          total_clicks?: number
          total_links?: number
        }
        Relationships: [
          {
            foreignKeyName: "brand_stats_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          address: string | null
          city: string | null
          color: string
          color_secondary: string | null
          color_tertiary: string | null
          created_at: string
          description: string | null
          directions_url: string | null
          email: string | null
          facebook_url: string | null
          handle: string
          hero_video_url: string | null
          id: string
          instagram_url: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          parent_portal_url: string | null
          phone: string | null
          primary_cta_text: string | null
          primary_cta_url: string | null
          rating: number | null
          rating_count: number | null
          short_code: string | null
          state: string | null
          tagline: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          color: string
          color_secondary?: string | null
          color_tertiary?: string | null
          created_at?: string
          description?: string | null
          directions_url?: string | null
          email?: string | null
          facebook_url?: string | null
          handle: string
          hero_video_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          parent_portal_url?: string | null
          phone?: string | null
          primary_cta_text?: string | null
          primary_cta_url?: string | null
          rating?: number | null
          rating_count?: number | null
          short_code?: string | null
          state?: string | null
          tagline?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          color?: string
          color_secondary?: string | null
          color_tertiary?: string | null
          created_at?: string
          description?: string | null
          directions_url?: string | null
          email?: string | null
          facebook_url?: string | null
          handle?: string
          hero_video_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          parent_portal_url?: string | null
          phone?: string | null
          primary_cta_text?: string | null
          primary_cta_url?: string | null
          rating?: number | null
          rating_count?: number | null
          short_code?: string | null
          state?: string | null
          tagline?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          campaign: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          medium: string
          name: string
          short_code: string | null
          source: string
        }
        Insert: {
          campaign: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          medium: string
          name: string
          short_code?: string | null
          source: string
        }
        Update: {
          campaign?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          medium?: string
          name?: string
          short_code?: string | null
          source?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          actions: Json | null
          chat_session_id: string
          content: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          actions?: Json | null
          chat_session_id: string
          content: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          actions?: Json | null
          chat_session_id?: string
          content?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          completed_at: string | null
          gym_id: string
          id: string
          lead_captured: boolean | null
          messages_count: number | null
          session_id: string
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          gym_id: string
          id?: string
          lead_captured?: boolean | null
          messages_count?: number | null
          session_id: string
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          gym_id?: string
          id?: string
          lead_captured?: boolean | null
          messages_count?: number | null
          session_id?: string
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          activecampaign_contact_id: string | null
          activecampaign_synced: boolean | null
          child_age: string | null
          created_at: string | null
          email: string | null
          gym_id: string
          id: string
          interest: string | null
          name: string
          notes: string | null
          phone: string | null
          session_id: string | null
          source: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          activecampaign_contact_id?: string | null
          activecampaign_synced?: boolean | null
          child_age?: string | null
          created_at?: string | null
          email?: string | null
          gym_id: string
          id?: string
          interest?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          session_id?: string | null
          source: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          activecampaign_contact_id?: string | null
          activecampaign_synced?: boolean | null
          child_age?: string | null
          created_at?: string | null
          email?: string | null
          gym_id?: string
          id?: string
          interest?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          session_id?: string | null
          source?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      link_analytics: {
        Row: {
          brand_link_id: string
          clicked_at: string
          id: string
          ip_address: string | null
          kind: string | null
          label: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          brand_link_id: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          kind?: string | null
          label?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          brand_link_id?: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          kind?: string | null
          label?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_analytics_brand_link_id_fkey"
            columns: ["brand_link_id"]
            isOneToOne: false
            referencedRelation: "brand_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      link_categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          is_active: boolean
          name: Database["public"]["Enums"]["link_category_name"]
        }
        Insert: {
          created_at?: string
          display_order: number
          icon: string
          id?: string
          is_active?: boolean
          name: Database["public"]["Enums"]["link_category_name"]
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name?: Database["public"]["Enums"]["link_category_name"]
        }
        Relationships: []
      }
      login_pins: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          is_admin: boolean | null
          last_login_at: string | null
          name: string
          pin: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          last_login_at?: string | null
          name: string
          pin: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          last_login_at?: string | null
          name?: string
          pin?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_pins_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          gym_id: string | null
          id: string
          ip_address: string | null
          last_activity_at: string | null
          referrer: string | null
          started_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          gym_id?: string | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          referrer?: string | null
          started_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          gym_id?: string | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          referrer?: string | null
          started_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      link_category_name:
        | "Contact & Info"
        | "Social Media"
        | "Class Schedules"
        | "Membership"
        | "Featured Content"
        | "Classes & Programs"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      link_category_name: [
        "Contact & Info",
        "Social Media",
        "Class Schedules",
        "Membership",
        "Featured Content",
        "Classes & Programs",
      ],
    },
  },
} as const
