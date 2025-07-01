import React from 'react';
import { MapPin, Compass, Gift, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
  const { preferences } = useAuthStore();
  const animationsEnabled = preferences?.animations_enabled ?? true;

  const navItems = [
    { id: 'compass', label: 'Compass', icon: Compass, color: 'emerald' },
    { id: 'memory', label: 'Memory', icon: MapPin, color: 'pink' },
    { id: 'rewards', label: 'Rewards', icon: Gift, color: 'amber' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      emerald: isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500',
      pink: isActive ? 'text-pink-600 bg-pink-50' : 'text-gray-500',
      amber: isActive ? 'text-amber-600 bg-amber-50' : 'text-gray-500',
      gray: isActive ? 'text-gray-700 bg-gray-100' : 'text-gray-500',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative flex flex-col items-center p-3 rounded-2xl transition-all ${
                getColorClasses(item.color, isActive)
              }`}
            >
              {animationsEnabled && isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl bg-current opacity-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};