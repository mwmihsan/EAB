import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, role?: 'admin' | 'user') => Promise<{ error: any | null, user: any | null }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<{ error: any | null }>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  // Initialize auth state
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile with role
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error && profile) {
            setState({
              user: {
                id: session.user.id,
                email: session.user.email!,
                role: profile.role,
                created_at: profile.created_at,
              },
              session,
              loading: false,
            });
          } else {
            setState({
              user: null,
              session: null,
              loading: false,
            });
          }
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setState({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Get user profile with role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!error && profile) {
          setState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              role: profile.role,
              created_at: profile.created_at,
            },
            session,
            loading: false,
          });
        }
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
        });
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (!error && data.user) {
        // Create user profile with role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              email, 
              role 
            }
          ]);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: profileError, user: null };
        }
        
        return { error: null, user: data.user };
      }
      
      return { error, user: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update user data
  const updateUser = async (data: Partial<User>) => {
    try {
      if (!state.user) {
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

  const contextValue = {
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