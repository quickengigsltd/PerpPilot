
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';

export type AppView = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'APP';

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
