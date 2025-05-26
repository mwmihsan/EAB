/*
  # Fix Profile Creation RLS Policy

  Allow users to create their own profile during signup to fix the 
  "new row violates row-level security policy" error.
*/

-- Add policy to allow users to create their own profile during signup
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Optional: Allow first user to become admin automatically
-- Remove this if you don't want the first registered user to be admin
CREATE POLICY "Allow first user registration as admin"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    NOT EXISTS (SELECT 1 FROM profiles LIMIT 1)
  );