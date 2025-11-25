
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import HowItWorks from './components/HowItWorks';

export type AppView = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'APP' | 'HOW_IT_WORKS';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('LANDING');

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
  };

  const handleLogin = () => {
    setCurrentView('APP');
  };

  const handleLogout = () => {
    setCurrentView('LANDING');
  };

  return (
    <div className="h-screen w-full">
       {currentView === 'LANDING' && (
         <LandingPage onNavigate={navigateTo} />
       )}
       
       {currentView === 'HOW_IT_WORKS' && (
         <HowItWorks 
            onBack={() => navigateTo('LANDING')} 
            onStart={() => navigateTo('SIGNUP')}
         />
       )}

       {(currentView === 'LOGIN' || currentView === 'SIGNUP') && (
         <AuthPage 
            initialView={currentView} 
            onLogin={handleLogin}
            onBack={() => navigateTo('LANDING')} 
         />
       )}

       {currentView === 'APP' && (
         <Dashboard onLogout={handleLogout} />
       )}
    </div>
  );
}

export default App;
