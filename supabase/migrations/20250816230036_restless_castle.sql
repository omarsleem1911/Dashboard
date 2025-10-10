/*
  # Fix Meeting Schema Issues

  1. Schema Updates
    - Fix any missing columns or constraints
    - Ensure proper foreign key relationships
    - Add missing indexes

  2. RLS Policy Updates
    - Ensure all operations are properly allowed
    - Fix any restrictive policies

  3. Function Updates
    - Update RPC function to handle edge cases
*/

-- First, let's check and fix the action_items table structure
DO $$
BEGIN
  -- Ensure action_items table has all required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'action_items' AND column_name = 'action_group_id'
  ) THEN
    ALTER TABLE action_items ADD COLUMN action_group_id uuid REFERENCES action_groups(id) ON DELETE CASCADE;
  END IF;

  -- Ensure proper status constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'action_items_status_check'
  ) THEN
    ALTER TABLE action_items ADD CONSTRAINT action_items_status_check 
    CHECK (status IN ('Pending Client side', 'Pending COR Side', 'In progress', 'Completed'));
  END IF;
END $$;

-- Update RLS policies to be more permissive for debugging
DROP POLICY IF EXISTS "Users can insert action items" ON action_items;
DROP POLICY IF EXISTS "Users can update action items" ON action_items;
DROP POLICY IF EXISTS "Users can delete action items" ON action_items;
DROP POLICY IF EXISTS "Users can read all action items" ON action_items;

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

CREATE POLICY "Users can read all action items"
  ON action_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Update meeting policies to allow deletion
DROP POLICY IF EXISTS "Users can delete meetings" ON meetings;
CREATE POLICY "Users can delete meetings"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (true);

-- Update action group policies
DROP POLICY IF EXISTS "Users can delete action groups" ON action_groups;
CREATE POLICY "Users can delete action groups"
  ON action_groups
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a more robust RPC function for creating meetings with action groups
CREATE OR REPLACE FUNCTION create_meeting_with_action_group(
  meeting_data jsonb,
  create_action_group boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_meeting meetings%ROWTYPE;
  new_action_group action_groups%ROWTYPE;
  result jsonb;
BEGIN
  -- Insert the meeting
  INSERT INTO meetings (
    date,
    subject,
    purpose,
    summary,
    summary_mail_sent,
    summary_mail_reason,
    thread_closed,
    next_meeting_dependencies,
    client_id
  )
  VALUES (
    (meeting_data->>'date')::date,
    meeting_data->>'subject',
    meeting_data->>'purpose',
    meeting_data->>'summary',
    COALESCE((meeting_data->>'summary_mail_sent')::boolean, true),
    meeting_data->>'summary_mail_reason',
    COALESCE((meeting_data->>'thread_closed')::boolean, true),
    meeting_data->>'next_meeting_dependencies',
    CASE 
      WHEN meeting_data->>'client_id' IS NOT NULL 
      THEN (meeting_data->>'client_id')::integer 
      ELSE NULL 
    END
  )
  RETURNING * INTO new_meeting;

  -- Create result object
  result := jsonb_build_object(
    'meeting', row_to_json(new_meeting)
  );

  -- Optionally create an action group
  IF create_action_group THEN
    INSERT INTO action_groups (
      subject,
      owner,
      meeting_id,
      client_id
    )
    VALUES (
      COALESCE(meeting_data->>'subject', 'Action Items'),
      meeting_data->>'owner',
      new_meeting.id,
      CASE 
        WHEN meeting_data->>'client_id' IS NOT NULL 
        THEN (meeting_data->>'client_id')::integer 
        ELSE NULL 
      END
    )
    RETURNING * INTO new_action_group;

    result := result || jsonb_build_object(
      'action_group', row_to_json(new_action_group)
    );
  END IF;

  RETURN result;
END;
$$;