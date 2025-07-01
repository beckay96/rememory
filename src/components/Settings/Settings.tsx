import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Volume2, VolumeX, Sparkles, Crown, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { profile, preferences, updatePreferences } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const animationsEnabled = preferences?.animations_enabled ?? true;
  const MotionDiv = animationsEnabled ? motion.div : 'div';

  const handlePreferenceChange = async (key: string, value: any) => {
    setIsLoading(true);
    try {
      await updatePreferences({ [key]: value });
      
      if (key === 'animations_enabled') {
        toast.success(value ? 'Animations enabled' : 'Animations disabled');
      } else if (key === 'theme_mode') {
        toast.success(`Switched to ${value} mode`);
      }
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = profile?.subscription_status === 'active';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-24">
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 }
        })}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
        <p className="text-gray-600">
          Customize your Rememory experience
        </p>
      </MotionDiv>

      {/* User Info */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.1 }
        })}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{profile?.name}</p>
          </div>
          
          {profile?.nickname && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
              <p className="text-gray-900">{profile.nickname}</p>
            </div>
          )}
          
          {profile?.neurotype_tags && profile.neurotype_tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Neurotype</label>
              <div className="flex flex-wrap gap-2">
                {profile.neurotype_tags.map(tag => (
                  <span key={tag} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subscription Status */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className={`w-5 h-5 ${isPremium ? 'text-amber-500' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-800">
                {isPremium ? 'Brain Boost Premium' : 'Free Plan'}
              </span>
            </div>
            
            {!isPremium && (
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all">
                Upgrade for $4.99/mo
              </button>
            )}
          </div>
          
          {isPremium && (
            <p className="text-sm text-gray-600 mt-2">
              Thank you for supporting neurodivergent creators! 💜
            </p>
          )}
        </div>
      </MotionDiv>

      {/* Accessibility Settings */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.2 }
        })}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Accessibility</h2>
        
        <div className="space-y-6">
          {/* Animations Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-800">Animations</h3>
                <p className="text-sm text-gray-600">Smooth transitions and movement</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePreferenceChange('animations_enabled', !preferences?.animations_enabled)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences?.animations_enabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences?.animations_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preferences?.theme_mode === 'dark' ? (
                <Moon className="w-5 h-5 text-indigo-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <h3 className="font-medium text-gray-800">Theme</h3>
                <p className="text-sm text-gray-600">Light or dark mode</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePreferenceChange('theme_mode', preferences?.theme_mode === 'light' ? 'dark' : 'light')}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences?.theme_mode === 'dark' ? 'bg-indigo-600' : 'bg-amber-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences?.theme_mode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preferences?.sound_enabled ? (
                <Volume2 className="w-5 h-5 text-green-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium text-gray-800">Sound Effects</h3>
                <p className="text-sm text-gray-600">Audio feedback for actions</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePreferenceChange('sound_enabled', !preferences?.sound_enabled)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences?.sound_enabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences?.sound_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-800">High Contrast</h3>
                <p className="text-sm text-gray-600">Enhanced visibility</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePreferenceChange('high_contrast', !preferences?.high_contrast)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences?.high_contrast ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences?.high_contrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </MotionDiv>

      {/* Premium Features Preview */}
      {!isPremium && (
        <MotionDiv
          {...(animationsEnabled && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.3 }
          })}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-800">Premium Features</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Unlimited custom rewards</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>AI memory assistant (coming soon)</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Premium visual themes</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Support a neurodivergent creator</span>
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
            Upgrade to Brain Boost Premium
          </button>
        </MotionDiv>
      )}

      {/* Support Message */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, delay: 0.5 }
        })}
        className="text-center"
      >
        <p className="text-gray-500 italic text-sm">
          Built with love by a neurodivergent mum, for everyone who needs a gentle compass 💜
        </p>
      </MotionDiv>
    </div>
  );
};