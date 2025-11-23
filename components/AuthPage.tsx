
import React, { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  initialView: 'LOGIN' | 'SIGNUP';
  onLogin: () => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialView, onLogin, onBack }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-30"></div>
         <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-secondary/20 blur-[120px] rounded-full mix-blend-screen opacity-30"></div>
      </div>

      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6">
                <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
                {view === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400">
                {view === 'LOGIN' ? 'Enter your credentials to access the terminal.' : 'Join thousands of traders using AI to win.'}
            </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="trader@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-6"
                >
                    {isLoading ? (
                        <>
                           <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           Authenticating...
                        </>
                    ) : (
                        <>
                           {view === 'LOGIN' ? 'Sign In' : 'Get Started'} <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                    {view === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button 
                        onClick={() => setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                        className="text-primary font-bold hover:underline"
                    >
                        {view === 'LOGIN' ? 'Sign Up Free' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
        
        <div className="text-center mt-8 text-xs text-gray-600">
            By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
