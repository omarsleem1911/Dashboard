/*
  # Meeting Tracking Schema

  1. New Tables
    - `meetings`
      - `id` (uuid, primary key)
      - `date` (date)
      - `subject` (text)
      - `purpose` (text, optional)
      - `summary` (text, optional)
      - `summary_mail_sent` (boolean)
      - `summary_mail_reason` (text, optional)
      - `thread_closed` (boolean)
      - `next_meeting_dependencies` (text, optional)
      - `client_id` (integer, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `action_groups`
      - `id` (uuid, primary key)
      - `subject` (text)
      - `owner` (text, optional)
      - `meeting_id` (uuid, optional foreign key)
      - `client_id` (integer, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `action_items`
      - `id` (uuid, primary key)
      - `action_group_id` (uuid, foreign key)
      - `item` (text)
      - `due_date` (date, optional)
      - `status` (text, check constraint)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Add RPC function for atomic meeting creation

  3. Functions
    - `create_meeting_with_action_group` RPC for atomic operations
*/

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  subject text NOT NULL,
  purpose text DEFAULT '',
  summary text DEFAULT '',
  summary_mail_sent boolean DEFAULT true,
  summary_mail_reason text DEFAULT '',
  thread_closed boolean DEFAULT true,
  next_meeting_dependencies text DEFAULT '',
  client_id integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create action_groups table
CREATE TABLE IF NOT EXISTS action_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  owner text DEFAULT '',
  meeting_id uuid REFERENCES meetings(id) ON DELETE SET NULL,
  client_id integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_group_id uuid NOT NULL REFERENCES action_groups(id) ON DELETE CASCADE,
  item text NOT NULL,
  due_date date,
  status text DEFAULT 'Pending COR Side' CHECK (status IN ('Pending Client side', 'Pending COR Side', 'In progress', 'Completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
CREATE POLICY "Users can read all meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert meetings"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update meetings"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete meetings"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for action_groups
CREATE POLICY "Users can read all action groups"
  ON action_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert action groups"
  ON action_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update action groups"
  ON action_groups
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete action groups"
  ON action_groups
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for action_items
CREATE POLICY "Users can read all action items"
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
  USING (true);

CREATE POLICY "Users can delete action items"
  ON action_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_action_groups_meeting_id ON action_groups(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_groups_client_id ON action_groups(client_id);
CREATE INDEX IF NOT EXISTS idx_action_items_group_id ON action_items(action_group_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);

-- RPC function to create meeting with automatic action group
CREATE OR REPLACE FUNCTION create_meeting_with_action_group(
  meeting_data jsonb,
  create_action_group boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_meeting_id uuid;
  new_group_id uuid;
  result jsonb;
BEGIN
  -- Insert meeting
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
    COALESCE(meeting_data->>'purpose', ''),
    COALESCE(meeting_data->>'summary', ''),
    COALESCE((meeting_data->>'summary_mail_sent')::boolean, true),
    COALESCE(meeting_data->>'summary_mail_reason', ''),
    COALESCE((meeting_data->>'thread_closed')::boolean, true),
    COALESCE(meeting_data->>'next_meeting_dependencies', ''),
    COALESCE((meeting_data->>'client_id')::integer, null)
  )
  RETURNING id INTO new_meeting_id;

  -- Create action group if requested
  IF create_action_group THEN
    INSERT INTO action_groups (
      subject,
      meeting_id,
      client_id
    )
    VALUES (
      meeting_data->>'subject',
      new_meeting_id,
      COALESCE((meeting_data->>'client_id')::integer, null)
    )
    RETURNING id INTO new_group_id;
  END IF;

  -- Return result
  result := jsonb_build_object(
    'meeting_id', new_meeting_id,
    'action_group_id', new_group_id
  );

  RETURN result;
END;
$$;

-- Update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_meetings_updated_at') THEN
    CREATE TRIGGER update_meetings_updated_at
      BEFORE UPDATE ON meetings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_action_groups_updated_at') THEN
    CREATE TRIGGER update_action_groups_updated_at
      BEFORE UPDATE ON action_groups
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_action_items_updated_at') THEN
    CREATE TRIGGER update_action_items_updated_at
      BEFORE UPDATE ON action_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;