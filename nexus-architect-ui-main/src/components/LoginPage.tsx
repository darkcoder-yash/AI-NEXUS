import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Zap, Loader2, ShieldAlert, UserPlus, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { nexusWS, WebSocketEventTypes, useAppStoreOut } from '@/lib/websocket';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { loginDemo, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isConnected = useAppStoreOut((state) => state.isConnected);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/nexus');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!nexusWS) return;
    if (!nexusWS.isConnected()) {
      nexusWS.connect();
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setError('Verification email sent. Please check your inbox.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        if (nexusWS && isConnected) {
          nexusWS.send(WebSocketEventTypes.AUTH, { email, password });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setLoading(true);
    if (nexusWS && isConnected) {
      nexusWS.send(WebSocketEventTypes.AUTH, { token: 'STRESS_TEST_TOKEN' });
    }
    loginDemo();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse [animation-delay:2s]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4 z-10"
      >
        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-2xl shadow-teal-500/5 overflow-hidden"
            >
              <img src="/logo.png" alt="Nexus AI Logo" className="w-12 h-12 object-contain logo-glow" onError={(e) => e.currentTarget.style.display = 'none'} />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white">NEXUS <span className="text-teal-400">AI</span></h1>
              <p className="text-[10px] text-teal-500 uppercase tracking-[0.5em] font-bold mt-3">Quantum Operating Layer</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

          {/* Mode Toggle */}
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isSignUp ? 'bg-teal-500 text-teal-950' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign_In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSignUp ? 'bg-teal-500 text-teal-950' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign_Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black ml-1">Authentication_ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@nexus.core"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-teal-500/50 focus:bg-white/[0.08] transition-all placeholder:text-slate-700 font-bold text-white shadow-inner"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black ml-1">Access_Cipher</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-teal-500/50 focus:bg-white/[0.08] transition-all placeholder:text-slate-700 font-bold text-white shadow-inner pr-14"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-teal-400 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-widest text-center">
                <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-teal-500 text-teal-950 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-teal-400 shadow-2xl shadow-teal-500/20 transition-all disabled:opacity-20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Initialize_Account' : 'Initialize_Core'}
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full mt-6 py-4 rounded-2xl border border-white/5 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 hover:text-slate-300 transition-all disabled:opacity-20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-teal-500" /> demo_bypass_link
          </button>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-black opacity-50">Private Neural Architecture v0.1</p>
        </div>
      </motion.div>
    </div>
  );
}
