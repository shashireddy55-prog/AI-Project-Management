import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/LoginPage';
import { GlassShowcase } from './components/GlassShowcase';
import { getSupabaseClient } from '../../utils/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';

type AppView = 'login' | 'glass-showcase';

const supabase = getSupabaseClient();

export default function App() {
  const [view, setView] = useState<AppView>('login');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Set document title
  useEffect(() => {
    document.title = 'Projify AI - AI Project Manager';
  }, []);

  useEffect(() => {
    checkExistingSession();
    
    // Set up Supabase auth state listener for automatic token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        setAccessToken(null);
        setView('login');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed by Supabase');
        if (session?.access_token) {
          setAccessToken(session.access_token);
        }
      } else if (event === 'SIGNED_IN' && session?.access_token) {
        console.log('Signed in, updating token');
        setAccessToken(session.access_token);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkExistingSession = async () => {
    try {
      console.log('Checking for existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        await supabase.auth.signOut();
        setIsCheckingSession(false);
        return;
      }
      
      if (!session?.access_token) {
        console.log('No existing session found');
        setIsCheckingSession(false);
        return;
      }
      
      // Check if token is expired
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      
      if (expiresAt && expiresAt < now) {
        console.log('Session token is expired, attempting refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession?.access_token) {
          console.error('Failed to refresh session:', refreshError);
          await supabase.auth.signOut();
          setIsCheckingSession(false);
          return;
        }
        
        console.log('Session refreshed successfully');
        setAccessToken(refreshedSession.access_token);
        setView('glass-showcase');
      } else {
        console.log('Found valid existing session');
        setAccessToken(session.access_token);
        setView('glass-showcase');
      }
    } catch (error) {
      console.error('Session check error:', error);
      await supabase.auth.signOut();
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    console.log('=== LOGIN SUCCESS ===');
    console.log('Received token (first 30 chars):', token.substring(0, 30) + '...');
    console.log('Token length:', token.length);
    
    // Decode and log token info
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        const now = Math.floor(Date.now() / 1000);
        console.log('Token expires at:', new Date(payload.exp * 1000).toISOString());
        console.log('Time until expiry (seconds):', payload.exp - now);
      }
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
    
    setAccessToken(token);
    // Show glass showcase - the only UI!
    setView('glass-showcase');
    console.log('=== END LOGIN SUCCESS ===');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setView('login');
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 100%)' }}></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-orange" style={{ background: 'linear-gradient(135deg, #14213D 0%, #1a2d52 100%)' }}>
            <Sparkles className="w-8 h-8" style={{ color: '#FCA311' }} />
          </div>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FCA311' }} />
          <p className="text-gray-600">Loading Projify AI...</p>
        </div>
      </div>
    );
  }

  console.log('Current view:', view, 'Access token exists:', !!accessToken);

  return (
    <>
      {view === 'login' ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : view === 'glass-showcase' && accessToken ? (
        <GlassShowcase onLogout={handleLogout} accessToken={accessToken} />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Something went wrong. View: {view}, Token: {accessToken ? 'exists' : 'missing'}</p>
            <button 
              onClick={() => {
                setView('login');
                setAccessToken(null);
                supabase.auth.signOut();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Reset to Login
            </button>
          </div>
        </div>
      )}
      
      <Toaster />
    </>
  );
}