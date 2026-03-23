import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session) {
        // Redirect to dashboard (in this project, it seems to be /nexus)
        window.location.href = '/nexus';
      } else if (error) {
        console.error('Auth error:', error.message);
        window.location.href = '/login';
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-teal-500 font-bold uppercase tracking-widest text-xs">Authenticating_Session...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
