import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthState } from '../types';

// Debug environment variables
console.log('🌍 Environment check:');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, role?: 'admin' | 'user') => Promise<{ error: any | null, user: any | null }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<{ error: any | null }>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true, // 🔥 FIXED: Set to true initially
  });

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    // Helper function to get user profile
    const getUserProfile = async (userId: string) => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { profile, profileError };
    };

    // Helper function to set authenticated user
    const setAuthenticatedUser = async (session: any) => {
      if (!session?.user || !isMounted) return;
      
      console.log('👤 Setting authenticated user...');
      const { profile, profileError } = await getUserProfile(session.user.id);
      
      if (!profileError && profile) {
        console.log('✅ User profile loaded successfully');
        setState({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            role: profile.role,
            created_at: profile.created_at,
          },
          session,
          loading: false,
        });
      } else {
        console.error('❌ Error getting profile:', profileError);
        setState({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    // Set up auth state listener first (this is more reliable)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'Has session' : 'No session');
      
      if (event === 'SIGNED_IN' && session) {
        await setAuthenticatedUser(session);
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('🚪 User signed out or no session');
        if (isMounted) {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token refreshed');
        await setAuthenticatedUser(session);
      }
    });

    // Try to get initial session, but don't block on it
    const getInitialSession = async () => {
      console.log('🔍 Getting initial session...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (isMounted) {
            setState(prev => ({ ...prev, loading: false }));
          }
          return;
        }
        
        if (session?.user) {
          console.log('📦 Initial session found');
          await setAuthenticatedUser(session);
        } else {
          console.log('🚫 No initial session');
          if (isMounted) {
            setState({
              user: null,
              session: null,
              loading: false,
            });
          }
        }
      } catch (error) {
        console.error('💥 Error getting initial session:', error);
        // Don't fail completely, the auth listener will handle state changes
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Set a fallback timeout to ensure loading doesn't hang forever
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        console.log('⏰ Fallback timeout - setting loading to false');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 5000);

    getInitialSession();

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    try {
      if (!email || !password) {
        return { error: new Error('Email and password are required') };
      }
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
      } else {
        console.log('✅ Sign in successful');
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Error signing in:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    console.log('📝 Attempting sign up for:', email);
    try {
      if (!email || !password) {
        return { error: new Error('Email and password are required'), user: null };
      }
      
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        return { error, user: null };
      }
      
      if (data?.user) {
        console.log('👤 User created, creating profile...');
        // Create user profile with role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              email: email.trim().toLowerCase(), 
              role 
            }
          ]);
        
        if (profileError) {
          console.error('❌ Error creating user profile:', profileError);
          return { error: profileError, user: null };
        }
        
        console.log('✅ Sign up successful');
        return { error: null, user: data.user };
      }
      
      return { error: new Error('User creation failed'), user: null };
    } catch (error) {
      console.error('💥 Error signing up:', error);
      return { error, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    console.log('🚪 Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
      } else {
        console.log('✅ Sign out successful');
      }
    } catch (error) {
      console.error('💥 Error signing out:', error);
    }
  };

  // Update user data
  const updateUser = async (data: Partial<User>) => {
    try {
      if (!state.user?.id) {
        return { error: new Error('User not authenticated') };
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);
      
      if (!error) {
        setState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...data } : null,
        }));
      }
      
      return { error };
    } catch (error) {
      console.error('Error updating user:', error);
      return { error };
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};