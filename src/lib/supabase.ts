import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test connection function
export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  console.log('📡 URL:', supabaseUrl);
  console.log('🗝️ Key:', supabaseAnonKey?.substring(0, 20) + '...');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic connection test');
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Basic connection failed:', error);
      return false;
    }
    console.log('✅ Basic connection successful');
    
    // Test 2: Auth session
    console.log('Test 2: Auth session test');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return false;
    }
    console.log('✅ Session check successful:', sessionData.session ? 'Has session' : 'No session');
    
    return true;
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    return false;
  }
};

// Helper function to check if user has admin role
export const isAdmin = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;

    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Run connection test in development
if (import.meta.env.DEV) {
  testSupabaseConnection();
}
