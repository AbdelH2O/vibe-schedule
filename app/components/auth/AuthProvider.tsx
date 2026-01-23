'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseProvider } from '@/lib/sync/supabaseProvider';
import { getSyncEngine } from '@/lib/sync/SyncEngine';
import type { User, Session } from '@supabase/supabase-js';
import type { AppState, SyncStatus } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: (clearData?: boolean) => Promise<void>;
  cloudData: Partial<AppState> | null;
  isLoadingCloudData: boolean;
  refreshCloudData: () => Promise<void>;
  syncStatus: SyncStatus;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  onCloudDataLoaded?: (data: Partial<AppState>) => void;
  onSignOut?: (clearData: boolean) => void;
}

export function AuthProvider({
  children,
  onCloudDataLoaded,
  onSignOut,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudData, setCloudData] = useState<Partial<AppState> | null>(null);
  const [isLoadingCloudData, setIsLoadingCloudData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  const supabase = createClient();
  const provider = getSupabaseProvider();
  const syncEngineRef = useRef(getSyncEngine());

  // Fetch cloud data on authentication
  const fetchCloudData = useCallback(async (userId: string) => {
    setIsLoadingCloudData(true);
    try {
      provider.setUserId(userId);
      await provider.registerDevice();
      const data = await provider.fetchAllUserData();
      setCloudData(data);
      onCloudDataLoaded?.(data);

      // Start sync engine after data is loaded
      syncEngineRef.current.setCallbacks({
        onStatusChange: (status) => setSyncStatus(status),
      });
      syncEngineRef.current.connect(userId);
    } catch (error) {
      console.error('Failed to fetch cloud data:', error);
    } finally {
      setIsLoadingCloudData(false);
    }
  }, [provider, onCloudDataLoaded]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[AUTH PROVIDER] Initializing auth...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        console.log('[AUTH PROVIDER] getSession result:', {
          hasSession: !!currentSession,
          userEmail: currentSession?.user?.email || null,
          error: error?.message || null
        });
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchCloudData(currentSession.user.id);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[AUTH PROVIDER] Auth state change:', {
          event,
          userEmail: newSession?.user?.email || null
        });
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await fetchCloudData(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          provider.setUserId(null);
          setCloudData(null);
          // Disconnect sync engine on sign out
          syncEngineRef.current.disconnect();
          setSyncStatus('offline');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      // Cleanup sync engine on unmount
      syncEngineRef.current.disconnect();
    };
  }, [supabase, fetchCloudData, provider]);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(
    async (email: string) => {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        return { error: error ? new Error(error.message) : null };
      } catch (error) {
        return { error: error as Error };
      }
    },
    [supabase]
  );

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase]);

  // Sign out
  const signOut = useCallback(
    async (clearData = false) => {
      try {
        await supabase.auth.signOut();
        onSignOut?.(clearData);
      } catch (error) {
        console.error('Failed to sign out:', error);
      }
    },
    [supabase, onSignOut]
  );

  // Refresh cloud data manually
  const refreshCloudData = useCallback(async () => {
    if (user) {
      await fetchCloudData(user.id);
    }
  }, [user, fetchCloudData]);

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    cloudData,
    isLoadingCloudData,
    refreshCloudData,
    syncStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
