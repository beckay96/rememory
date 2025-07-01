import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  nickname: string | null;
  neurotype_tags: string[];
  brain_bucks_balance: number;
  streak_count: number;
  subscription_status: string;
}

interface UserPreferences {
  animations_enabled: boolean;
  theme_mode: string;
  reminder_frequency: string;
  sound_enabled: boolean;
  high_contrast: boolean;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { name: string; nickname?: string; neurotype_tags: string[] }) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  preferences: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signUp: async (email: string, password: string, userData) => {
    // Sign up the user with metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          nickname: userData.nickname || null,
          neurotype_tags: userData.neurotype_tags,
        }
      }
    });
    
    if (error) throw error;
    
    // The trigger function will handle creating the profile and preferences
    // But let's also manually create them as a fallback
    if (data.user) {
      // Wait a moment for the trigger to potentially complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile was created by trigger
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', data.user.id)
        .single();
      
      if (!existingProfile) {
        // Trigger didn't work, create manually with all required fields
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert([{
            auth_id: data.user.id,
            name: userData.name,
            nickname: userData.nickname || null,
            neurotype_tags: userData.neurotype_tags,
            brain_bucks_balance: 0,
            streak_count: 0,
            last_activity_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for date type
            subscription_status: 'free',
          }])
          .select()
          .single();
        
        if (profileError) throw profileError;

        // Create default preferences
        if (profileData) {
          const { error: prefsError } = await supabase
            .from('user_preferences')
            .insert([{
              user_id: profileData.id,
            }]);
          
          if (prefsError) throw prefsError;
        }
      }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null, preferences: null });
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (profileData) {
      set({ profile: profileData });

      const { data: preferencesData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      if (preferencesData) {
        set({ preferences: preferencesData });
      }
    }
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', profile.id);

    if (error) throw error;

    set({ profile: { ...profile, ...updates } });
  },

  updatePreferences: async (updates) => {
    const { profile, preferences } = get();
    if (!profile || !preferences) return;

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', profile.id);

    if (error) throw error;

    set({ preferences: { ...preferences, ...updates } });
  },
}));