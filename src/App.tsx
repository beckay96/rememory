import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { useBrainBucksStore } from './store/brainBucksStore';
import { AuthForm } from './components/Auth/AuthForm';
import { Header } from './components/Layout/Header';
import { CriticalCompass } from './components/CriticalCompass/CriticalCompass';
import { MemoryMap } from './components/MemoryMap/MemoryMap';
import { RewardsVault } from './components/Rewards/RewardsVault';
import { Settings } from './components/Settings/Settings';
import { BottomNav } from './components/Navigation/BottomNav';

function App() {
  const { user, setUser, loadProfile, isLoading } = useAuthStore();
  const { loadBalance } = useBrainBucksStore();
  const [activeView, setActiveView] = useState('compass');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (user) {
      loadProfile().then(() => {
        loadBalance();
      });
    }
  }, [user, loadProfile, loadBalance]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your compass...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthForm />
        <Toaster 
          position="top-center"
          toastOptions={{
            className: 'bg-white/90 backdrop-blur-sm',
            duration: 3000,
          }}
        />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'compass':
        return <CriticalCompass />;
      case 'memory':
        return <MemoryMap />;
      case 'rewards':
        return <RewardsVault />;
      case 'settings':
        return <Settings />;
      default:
        return <CriticalCompass />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
        <Header />
        
        <main className="pt-4 pb-20">
          {renderActiveView()}
        </main>

        <BottomNav activeView={activeView} onViewChange={setActiveView} />
        
        <Toaster 
          position="top-center"
          toastOptions={{
            className: 'bg-white/90 backdrop-blur-sm',
            duration: 3000,
          }}
        />
      </div>
    </Router>
  );
}

export default App;