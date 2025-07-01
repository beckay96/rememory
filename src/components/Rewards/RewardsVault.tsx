import React, { useState, useEffect } from 'react';
import { Gift, Plus, Lock, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useBrainBucksStore } from '../../store/brainBucksStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Reward {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  category: string;
  is_redeemed: boolean;
  is_active: boolean;
}

export const RewardsVault: React.FC = () => {
  const { profile, preferences } = useAuthStore();
  const { balance, deductBrainBucks } = useBrainBucksStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showAddReward, setShowAddReward] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    cost: 10,
    category: 'treat',
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const animationsEnabled = preferences?.animations_enabled ?? true;
  const MotionDiv = animationsEnabled ? motion.div : 'div';

  const categories = [
    { value: 'treat', label: 'Treats', color: 'pink' },
    { value: 'activity', label: 'Activities', color: 'blue' },
    { value: 'rest', label: 'Rest & Recovery', color: 'green' },
    { value: 'social', label: 'Social', color: 'purple' },
  ];

  const suggestedRewards = [
    { title: 'Watch a show', cost: 10, category: 'activity' },
    { title: 'Order a treat', cost: 50, category: 'treat' },
    { title: 'Nap without guilt', cost: 15, category: 'rest' },
    { title: 'Swap a chore', cost: 30, category: 'activity' },
    { title: 'Call a friend', cost: 20, category: 'social' },
    { title: 'Bath with candles', cost: 25, category: 'rest' },
  ];

  useEffect(() => {
    if (profile) {
      loadRewards();
    }
  }, [profile]);

  const loadRewards = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('brain_buck_rewards')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('cost', { ascending: true });

    if (error) {
      toast.error('Error loading rewards');
    } else {
      setRewards(data || []);
    }
    setIsLoading(false);
  };

  const addReward = async () => {
    if (!profile || !newReward.title.trim()) return;

    const { error } = await supabase
      .from('brain_buck_rewards')
      .insert([{
        user_id: profile.id,
        title: newReward.title.trim(),
        description: newReward.description.trim() || null,
        cost: newReward.cost,
        category: newReward.category,
      }]);

    if (error) {
      toast.error('Error adding reward');
    } else {
      setNewReward({
        title: '',
        description: '',
        cost: 10,
        category: 'treat',
      });
      setShowAddReward(false);
      loadRewards();
      toast.success('Reward added to your vault!');
    }
  };

  const addSuggestedReward = async (suggested: typeof suggestedRewards[0]) => {
    if (!profile) return;

    const { error } = await supabase
      .from('brain_buck_rewards')
      .insert([{
        user_id: profile.id,
        title: suggested.title,
        cost: suggested.cost,
        category: suggested.category,
      }]);

    if (error) {
      toast.error('Error adding reward');
    } else {
      loadRewards();
      toast.success('Reward added!');
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (balance < reward.cost) {
      toast.error('Not enough Brain Bucks!');
      return;
    }

    const { error } = await supabase
      .from('brain_buck_rewards')
      .update({ 
        is_redeemed: true,
        redeemed_at: new Date().toISOString()
      })
      .eq('id', reward.id);

    if (error) {
      toast.error('Error redeeming reward');
    } else {
      await deductBrainBucks(reward.cost, 'reward_redeemed', `Redeemed: ${reward.title}`);
      loadRewards();
      
      // Show celebration
      toast.success(`🎉 Enjoy your ${reward.title}!`, {
        duration: 4000,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border') => {
    const colorMap = {
      pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    };
    
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.gray[variant];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 }
        })}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Rewards Vault
          </h1>
        </div>
        <p className="text-gray-600">
          Your personal collection of earned treats and activities
        </p>
      </MotionDiv>

      {/* Balance Display */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5, delay: 0.2 }
        })}
        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center border border-amber-200"
      >
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
          <span className="text-2xl font-bold text-amber-700">{balance}</span>
          <span className="text-amber-600 font-medium">Brain Bucks Available</span>
        </div>
        <p className="text-amber-600 text-sm">Ready to treat yourself?</p>
      </MotionDiv>

      {/* Add Reward */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.3 }
        })}
      >
        <button
          onClick={() => setShowAddReward(!showAddReward)}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center space-x-3"
        >
          <Plus className="w-5 h-5" />
          <span>Create Custom Reward</span>
        </button>
      </MotionDiv>

      {/* Add Reward Form */}
      <AnimatePresence>
        {showAddReward && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Your Reward</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Title
                </label>
                <input
                  type="text"
                  value={newReward.title}
                  onChange={(e) => setNewReward(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="What will you treat yourself to?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20 resize-none"
                  placeholder="Any special details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost (Brain Bucks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newReward.cost}
                    onChange={(e) => setNewReward(prev => ({ ...prev, cost: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={addReward}
                  className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                >
                  Add Reward
                </button>
                <button
                  onClick={() => setShowAddReward(false)}
                  className="text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Rewards */}
      {rewards.length === 0 && !showAddReward && (
        <MotionDiv
          {...(animationsEnabled && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.4 }
          })}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Suggested Rewards</h2>
          <p className="text-gray-600 mb-6">Get started with these ideas, or create your own!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedRewards.map((suggested, index) => (
              <MotionDiv
                key={suggested.title}
                {...(animationsEnabled && {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.3, delay: index * 0.1 }
                })}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{suggested.title}</h3>
                    <p className="text-sm text-gray-600">{suggested.cost} Brain Bucks</p>
                  </div>
                  <button
                    onClick={() => addSuggestedReward(suggested)}
                    className="bg-amber-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-amber-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>
      )}

      {/* Rewards Grid */}
      {rewards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, index) => {
            const color = getCategoryColor(reward.category);
            const canAfford = balance >= reward.cost;
            
            return (
              <MotionDiv
                key={reward.id}
                {...(animationsEnabled && {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.5, delay: index * 0.1 }
                })}
                className={`relative bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                  canAfford ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {!canAfford && (
                  <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center z-10">
                    <div className="bg-gray-100 rounded-full p-3">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{reward.title}</h3>
                      {reward.description && (
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full ${getColorClasses(color, 'bg')} ${getColorClasses(color, 'text')}`}>
                      <span className="text-xs font-medium">
                        {categories.find(c => c.value === reward.category)?.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-amber-700">{reward.cost}</span>
                      <span className="text-sm text-gray-600">BB</span>
                    </div>
                    
                    <button
                      onClick={() => redeemReward(reward)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                        canAfford
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem' : 'Locked'}
                    </button>
                  </div>
                </div>
              </MotionDiv>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && rewards.length === 0 && !showAddReward && (
        <MotionDiv
          {...(animationsEnabled && {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5 }
          })}
          className="text-center py-12"
        >
          <Gift className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Vault Awaits</h3>
          <p className="text-gray-600">Create rewards that motivate and nurture you.</p>
        </MotionDiv>
      )}

      {/* Affirming message */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, delay: 0.7 }
        })}
        className="text-center"
      >
        <p className="text-gray-500 italic">
          "You've earned these moments of joy. You deserve to be kind to yourself."
        </p>
      </MotionDiv>
    </div>
  );
};