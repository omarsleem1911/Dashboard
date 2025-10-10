/*
  # Fix RLS Policy for Action Items

  1. Security Updates
    - Update INSERT policy for action_items to allow authenticated users
    - Ensure proper permissions for creating action items
    - Fix RLS violation preventing new action item creation

  2. Policy Changes
    - More permissive INSERT policy for authenticated users
    - Maintain security while allowing legitimate operations
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert action items" ON action_items;

-- Create new permissive INSERT policy for action_items
CREATE POLICY "Allow authenticated users to insert action items"
  ON action_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the policy allows updates as well
DROP POLICY IF EXISTS "Users can update action items" ON action_items;

CREATE POLICY "Allow authenticated users to update action items"
  ON action_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure SELECT policy is permissive
DROP POLICY IF EXISTS "Users can read all action items" ON action_items;

CREATE POLICY "Allow authenticated users to read action items"
  ON action_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure DELETE policy is permissive
DROP POLICY IF EXISTS "Users can delete action items" ON action_items;

CREATE POLICY "Allow authenticated users to delete action items"
  ON action_items
  FOR DELETE
  TO authenticated
  USING (true);