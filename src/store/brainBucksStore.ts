import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface BrainBucksState {
  balance: number;
  addBrainBucks: (amount: number, action: string, description?: string) => Promise<void>;
  deductBrainBucks: (amount: number, action: string, description?: string) => Promise<void>;
  loadBalance: () => Promise<void>;
}

export const useBrainBucksStore = create<BrainBucksState>((set, get) => ({
  balance: 0,

  loadBalance: async () => {
    const { profile } = useAuthStore.getState();
    if (!profile) return;

    const { data } = await supabase
      .from('users')
      .select('brain_bucks_balance')
      .eq('id', profile.id)
      .single();

    if (data) {
      set({ balance: data.brain_bucks_balance });
    }
  },

  addBrainBucks: async (amount: number, action: string, description?: string) => {
    const { profile } = useAuthStore.getState();
    if (!profile) return;

    // Add to ledger
    const { error: ledgerError } = await supabase
      .from('brain_bucks_ledger')
      .insert([{
        user_id: profile.id,
        action_type: action,
        amount: amount,
        description: description,
      }]);

    if (ledgerError) throw ledgerError;

    // Update user balance
    const newBalance = get().balance + amount;
    const { error: updateError } = await supabase
      .from('users')
      .update({ brain_bucks_balance: newBalance })
      .eq('id', profile.id);

    if (updateError) throw updateError;

    set({ balance: newBalance });
    
    // Show success toast
    toast.success(`+${amount} Brain Bucks! ${description || ''}`, {
      icon: '🧠',
      duration: 3000,
    });
  },

  deductBrainBucks: async (amount: number, action: string, description?: string) => {
    const { profile } = useAuthStore.getState();
    if (!profile) return;

    const currentBalance = get().balance;
    if (currentBalance < amount) {
      toast.error('Not enough Brain Bucks!');
      return;
    }

    // Add to ledger (negative amount)
    const { error: ledgerError } = await supabase
      .from('brain_bucks_ledger')
      .insert([{
        user_id: profile.id,
        action_type: action,
        amount: -amount,
        description: description,
      }]);

    if (ledgerError) throw ledgerError;

    // Update user balance
    const newBalance = currentBalance - amount;
    const { error: updateError } = await supabase
      .from('users')
      .update({ brain_bucks_balance: newBalance })
      .eq('id', profile.id);

    if (updateError) throw updateError;

    set({ balance: newBalance });
    
    // Show deduction message
    if (amount > 0) {
      toast(`-${amount} Brain Bucks. ${description || ''}`, {
        icon: '⏱️',
        duration: 2000,
      });
    }
  },
}));