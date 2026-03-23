import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, ShieldAlert, Eye, EyeOff, Mail, Lock, Chrome, ArrowLeft, Globe, Zap, Fingerprint } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { isAuthenticated, initialized } = useAuthStore();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized && isAuthenticated) navigate('/nexus');
  }, [isAuthenticated, initialized, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      if (authMethod === 'otp') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectUrl }
        });
        if (otpError) throw otpError;
        setMessage('Access link transmitted. Check your inbox.');
      } else {
        if (isSignUp) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectUrl }
          });
          if (signUpError) throw signUpError;
          setMessage('Account initialized. Verify via email.');
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
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
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col lg:flex-row bg-[#020617] selection:bg-indigo-500/30 font-sans overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* LEFT PANEL: Professional Branding */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-center p-16 overflow-hidden border-r border-white/5 bg-slate-950/50 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-50" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl mb-10 flex items-center justify-center shadow-2xl backdrop-blur-md group">
            <img src="/logo.png" alt="Nexus" className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <h1 className="text-5xl font-bold text-white tracking-tight leading-[1.1] mb-8">
            The Future of <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Autonomous</span> <br />
            Intelligence.
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed mb-12 max-w-md font-medium opacity-70">
            Securely orchestrate and scale your AI infrastructure with our next-generation operating layer.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: Fingerprint, label: "Quantum Security", desc: "End-to-end neural encryption" },
              { icon: Globe, label: "Edge Mesh", desc: "Sub-5ms global latency" },
              { icon: Zap, label: "Auto-Scaling", desc: "Elastic compute allocation" }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="mt-1 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                  <feature.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{feature.label}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL: Refined Auth Card */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[460px] relative z-20"
        >
          <div className="backdrop-blur-2xl bg-white/[0.01] border border-white/[0.08] p-10 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            {/* Inner Glow Effect */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {isSignUp ? 'Initialize Profile' : 'System Access'}
                </h2>
                <p className="text-slate-500 mt-3 text-sm font-medium">
                  Authentication required for secure node access.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {authMethod === null ? (
                  <motion.div 
                    key="selector"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <button 
                      onClick={signInWithGoogle}
                      className="w-full h-14 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl flex items-center justify-center gap-4 font-semibold text-slate-200 transition-all active:scale-[0.98] group/btn"
                    >
                      <Chrome className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-5 py-4">
                      <div className="h-px bg-white/[0.05] flex-1" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Secure Gateway</span>
                      <div className="h-px bg-white/[0.05] flex-1" />
                    </div>

                    <button 
                      onClick={() => setAuthMethod('password')}
                      className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center gap-4 font-bold text-sm transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20"
                    >
                      <Lock className="w-4 h-4" />
                      Access with Cipher
                    </button>

                    <button 
                      onClick={() => setAuthMethod('otp')}
                      className="w-full h-14 border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center gap-4 font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      <Mail className="w-4 h-4" />
                      Email Magic Link
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button 
                      onClick={() => setAuthMethod(null)}
                      className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 mb-8 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Return to Gateway
                    </button>

                    <form onSubmit={handleAuth} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Authentication ID</label>
                        <div className="relative group/input">
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="operator@nexus.core" 
                            className="w-full h-14 bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-5 text-sm text-white outline-none transition-all placeholder:text-slate-700 font-medium" 
                            required 
                          />
                          <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                      </div>

                      {authMethod === 'password' && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Cipher</label>
                          <div className="relative group/input">
                            <input 
                              type={showPassword ? 'text' : 'password'} 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              placeholder="••••••••" 
                              className="w-full h-14 bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-5 text-sm text-white outline-none transition-all placeholder:text-slate-700 pr-14 font-medium" 
                              required 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors">
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold text-center mt-2 flex items-center justify-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> {error}
                      </div>}
                      {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-bold text-center mt-2 flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" /> {message}
                      </div>}

                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center gap-4 font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{authMethod === 'otp' ? 'Transmit Link' : (isSignUp ? 'Initialize Core' : 'Access Dashboard')} <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 text-center border-t border-white/[0.05] pt-8">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setAuthMethod(null); }} 
                  className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.2em] transition-all"
                >
                  {isSignUp ? "Already Authenticated? Sign In" : "New Operator? Request Credentials"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <button className="text-[9px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors">Privacy_Protocol</button>
            <button className="text-[9px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors">Terms_of_Service</button>
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">© 2024 Nexus_Systems</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
