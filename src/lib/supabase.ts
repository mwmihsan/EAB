import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://xdytwpwncbdjambbrsgr.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeXR3cHduY2JkamFtYmJyc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNDU2MDUsImV4cCI6MjA2MzgyMTYwNX0.2ox_DNJVOO_7u-R-7tP8GJR97uztmemb6Ptvzmehno8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
