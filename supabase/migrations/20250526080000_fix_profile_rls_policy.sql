/*
  # Complete Fix for Profile RLS Policy
  
  This completely replaces the problematic INSERT policy for profiles
  to allow both user self-registration and admin user creation.
*/

-- First, drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Admin users can insert profiles" ON profiles;

-- Create a new comprehensive INSERT policy that allows:
-- 1. Users to create their own profile during signup
-- 2. Existing admin users to create other profiles
CREATE POLICY "Allow profile creation"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to create their own profile
    auth.uid() = id 
    OR 
    -- Allow existing admin users to create profiles for others
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Optional: If you want to make the first registered user an admin automatically
-- Uncomment this and comment out the policy above
/*
CREATE POLICY "Allow profile creation with first user as admin"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to create their own profile
    (auth.uid() = id) 
    AND
    (
      -- Either no profiles exist yet (first user becomes admin)
      NOT EXISTS (SELECT 1 FROM profiles LIMIT 1)
      OR 
      -- Or this is a regular user registration
      TRUE
    )
    OR 
    -- Allow existing admin users to create profiles for others
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
*/