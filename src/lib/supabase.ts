import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          name: string;
          nickname: string | null;
          neurotype_tags: string[];
          brain_bucks_balance: number;
          streak_count: number;
          last_activity_date: string;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          name: string;
          nickname?: string | null;
          neurotype_tags?: string[];
          brain_bucks_balance?: number;
          streak_count?: number;
          last_activity_date?: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          name?: string;
          nickname?: string | null;
          neurotype_tags?: string[];
          brain_bucks_balance?: number;
          streak_count?: number;
          last_activity_date?: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          animations_enabled: boolean;
          theme_mode: string;
          reminder_frequency: string;
          sound_enabled: boolean;
          high_contrast: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          animations_enabled?: boolean;
          theme_mode?: string;
          reminder_frequency?: string;
          sound_enabled?: boolean;
          high_contrast?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          animations_enabled?: boolean;
          theme_mode?: string;
          reminder_frequency?: string;
          sound_enabled?: boolean;
          high_contrast?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      memory_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string | null;
          entry_date: string;
          tags: string[];
          emotional_tone: string | null;
          memory_type: string;
          voice_note_url: string | null;
          image_url: string | null;
          has_reminder: boolean;
          reminder_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string | null;
          entry_date: string;
          tags?: string[];
          emotional_tone?: string | null;
          memory_type?: string;
          voice_note_url?: string | null;
          image_url?: string | null;
          has_reminder?: boolean;
          reminder_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          entry_date?: string;
          tags?: string[];
          emotional_tone?: string | null;
          memory_type?: string;
          voice_note_url?: string | null;
          image_url?: string | null;
          has_reminder?: boolean;
          reminder_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority_level: number;
          is_completed: boolean;
          due_date: string | null;
          completed_at: string | null;
          minutes_late: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority_level?: number;
          is_completed?: boolean;
          due_date?: string | null;
          completed_at?: string | null;
          minutes_late?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          priority_level?: number;
          is_completed?: boolean;
          due_date?: string | null;
          completed_at?: string | null;
          minutes_late?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      anchors: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          anchor_type: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          anchor_type?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          anchor_type?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          reminder_minutes: number;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          event_date: string;
          location?: string | null;
          reminder_minutes?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          location?: string | null;
          reminder_minutes?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      regroup_tools: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string | null;
          tool_type: string;
          instructions: string | null;
          duration_minutes: number;
          is_favorite: boolean;
          is_global: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description?: string | null;
          tool_type?: string;
          instructions?: string | null;
          duration_minutes?: number;
          is_favorite?: boolean;
          is_global?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          description?: string | null;
          tool_type?: string;
          instructions?: string | null;
          duration_minutes?: number;
          is_favorite?: boolean;
          is_global?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      brain_bucks_ledger: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          amount: number;
          description: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          amount: number;
          description?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          amount?: number;
          description?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
      };
      brain_buck_rewards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          cost: number;
          category: string;
          is_redeemed: boolean;
          redeemed_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          cost: number;
          category?: string;
          is_redeemed?: boolean;
          redeemed_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          cost?: number;
          category?: string;
          is_redeemed?: boolean;
          redeemed_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_name: string;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_name?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_name?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};