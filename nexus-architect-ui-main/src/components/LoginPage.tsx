import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Loader2, ShieldAlert, UserPlus, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [useOtp, setUseOtp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/nexus');
  }, [isAuthenticated, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (useOtp) {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (authError) throw authError;
        setMessage('Access link transmitted. Check your neural interface.');
      } else {
        if (isSignUp) {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) throw signUpError;
          setMessage('Account initialization started. Verify your email.');
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] mx-4 z-10"
      >
        <div className="bg-white border border-slate-200 p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/5 flex items-center justify-center border border-teal-500/10 shadow-sm overflow-hidden">
              <img src="/logo.png" alt="Nexus AI Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">NEXUS <span className="text-teal-600">AI</span></h1>
              <p className="text-[10px] text-teal-600 uppercase tracking-[0.5em] font-bold mt-3">Quantum Operating Layer</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-10" />

          {/* Google Auth */}
          <button 
            onClick={signInWithGoogle}
            className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 mb-6 shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Sign_In_With_Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">or_use_cipher</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="flex p-1 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
            <button onClick={() => setUseOtp(true)} className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${useOtp ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}>Magic_Link</button>
            <button onClick={() => setUseOtp(false)} className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${!useOtp ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}>Password</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-1">Authentication_ID</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@nexus.core" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-900 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 outline-none transition-all" required />
            </div>

            {!useOtp && (
              <div className="space-y-3">
                <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-1">Access_Cipher</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-900 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 outline-none transition-all pr-14" required={!useOtp} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {error && <div className="text-red-500 font-bold text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2"><ShieldAlert className="w-3 h-3" /> {error}</div>}
            {message && <div className="text-teal-600 font-bold text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2"><Zap className="w-3 h-3" /> {message}</div>}

            <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 active:scale-[0.98]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{useOtp ? 'Send_Magic_Link' : (isSignUp ? 'Initialize_Account' : 'Initialize_Core')} <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          {!useOtp && (
            <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-6 text-[8px] text-slate-400 uppercase tracking-widest hover:text-teal-600 font-bold transition-colors">
              {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
