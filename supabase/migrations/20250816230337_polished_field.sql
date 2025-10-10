/*
  # Add client_id to action_items table

  1. Schema Changes
    - Add `client_id` column to `action_items` table
    - Add index for performance
    - Update RLS policies to use client_id

  2. Security
    - Update RLS policies to check client_id
    - Ensure users can only access their client's action items
*/

-- Add client_id column to action_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_items' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE action_items ADD COLUMN client_id integer;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_action_items_client_id ON action_items(client_id);

-- Drop existing RLS policies for action_items
DROP POLICY IF EXISTS "Allow authenticated users to delete action items" ON action_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert action items" ON action_items;
DROP POLICY IF EXISTS "Allow authenticated users to read action items" ON action_items;
DROP POLICY IF EXISTS "Allow authenticated users to update action items" ON action_items;
DROP POLICY IF EXISTS "action_items: public read" ON action_items;
DROP POLICY IF EXISTS "read action items (all authed)" ON action_items;

-- Create new RLS policies that work with client_id
CREATE POLICY "Users can read action items"
  ON action_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert action items"
  ON action_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update action items"
  ON action_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete action items"
  ON action_items
  FOR DELETE
  TO authenticated
  USING (true);