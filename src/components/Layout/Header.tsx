import React from 'react';
import { Brain, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBrainBucksStore } from '../../store/brainBucksStore';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { profile, signOut, preferences } = useAuthStore();
  const { balance } = useBrainBucksStore();
  const animationsEnabled = preferences?.animations_enabled ?? true;

  const MotionDiv = animationsEnabled ? motion.div : 'div';

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <MotionDiv
          {...(animationsEnabled && {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.6 }
          })}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Rememory
            </h1>
            <p className="text-sm text-gray-600">
              Welcome back, {profile?.nickname || profile?.name}
            </p>
          </div>
        </MotionDiv>

        <div className="flex items-center space-x-4">
          <MotionDiv
            {...(animationsEnabled && {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, delay: 0.2 }
            })}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 rounded-full border border-purple-200"
          >
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-700">{balance}</span>
            <span className="text-sm text-purple-600">Brain Bucks</span>
          </MotionDiv>

          <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <button 
            onClick={signOut}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};