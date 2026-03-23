import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Auth Callback] Error:', error.message);
        navigate('/login?error=callback_failed');
        return;
      }

      if (data?.session) {
        // Redirect to dashboard (nexus)
        navigate('/nexus');
      } else {
        // No session found, likely link expired or invalid
        navigate('/login?error=invalid_link');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-teal-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing_Session...</p>
      </div>
    </div>
  );
}
