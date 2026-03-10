import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AppStateProvider } from './hooks/useAppState';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleEnter = useCallback(() => setShowDashboard(true), []);
  const handleBack = useCallback(() => setShowDashboard(false), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showDashboard) return;
      // Don't trigger shortcuts when typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          document.querySelector('.play-btn')?.click();
          break;
        case 'ArrowRight':
          if (!e.metaKey && !e.ctrlKey) {
            document.querySelector('.ctrl-btn[title="Next"]')?.click();
          }
          break;
        case 'ArrowLeft':
          if (!e.metaKey && !e.ctrlKey) {
            document.querySelector('.ctrl-btn[title="Previous"]')?.click();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDashboard]);

  return (
    <AppStateProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(20, 20, 25, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
          },
        }}
      />
      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <LandingPage key="landing" onEnter={handleEnter} />
        ) : (
          <Dashboard key="dashboard" onBack={handleBack} />
        )}
      </AnimatePresence>
    </AppStateProvider>
  );
}

export default App;
