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
    loading: false,
  });

  // Initialize auth state
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount

   const getInitialSession = async () => {
  console.log('🔍 Getting initial session...');
  try {
    // Get current session
    console.log('🔗 Testing Supabase connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📦 Session result:', session);
    console.log('❌ Session error:', sessionError);
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (isMounted) {
            setState({
              user: null,
              session: null,
              loading: false,
            });
          }
          return;
        }
        
        if (session?.user) {
          // Get user profile with role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!profileError && profile && isMounted) {
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
            console.error('Error getting profile:', profileError);
            if (isMounted) {
              setState({
                user: null,
                session: null,
                loading: false,
              });
            }
          }
        } else {
          if (isMounted) {
            setState({
              user: null,
              session: null,
              loading: false,
            });
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user && isMounted) {
          // Get user profile with role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!profileError && profile) {
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
            console.error('Error getting profile on auth change:', profileError);
            setState({
              user: null,
              session: null,
              loading: false,
            });
          }
        } else if (isMounted) {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        if (isMounted) {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { error: new Error('Email and password are required') };
      }
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    try {
      if (!email || !password) {
        return { error: new Error('Email and password are required'), user: null };
      }
      
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        return { error, user: null };
      }
      
      if (data?.user) {
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
          console.error('Error creating user profile:', profileError);
          return { error: profileError, user: null };
        }
        
        return { error: null, user: data.user };
      }
      
      return { error: new Error('User creation failed'), user: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
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