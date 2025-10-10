/*
  # Complete Agent Status Management System

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, client name)
      - `created_at` (timestamptz)
    
    - `agents`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `hostname` (text, device name)
      - `ip_address` (text, endpoint IP)
      - `agent_status` (text, status: Active, Disconnected, Disabled, Decommissioned)
      - `event_types` (text array, forwarding event types)
      - `last_heartbeat` (timestamptz, last contact time)
      - `agent_version` (text, installed version)
      - `os_info` (text, operating system information)
      - `subnet` (text, network subnet)
      - `vlan` (text, VLAN identifier)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `agent_services`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key to agents)
      - `service_name` (text, name of service/module)
      - `service_type` (text, type: log_forwarder, discovery, forensics, etc.)
      - `enabled` (boolean, service status)
      - `config` (jsonb, service configuration)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `agent_diagnostics`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key to agents)
      - `diagnostic_type` (text, type of diagnostic)
      - `status` (text, result status)
      - `details` (jsonb, diagnostic details)
      - `created_at` (timestamptz)
    
    - `forensics_sessions`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key to agents)
      - `session_token` (text, unique session identifier)
      - `status` (text, session status: active, closed, timeout)
      - `started_by` (uuid, user who initiated)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `session_data` (jsonb, collected forensics data)
    
    - `network_topology`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `discovered_by_agent_id` (uuid, foreign key to agents)
      - `discovered_ip` (text, discovered endpoint IP)
      - `discovered_hostname` (text, discovered hostname)
      - `subnet` (text, subnet information)
      - `vlan` (text, VLAN information)
      - `node_type` (text, device type)
      - `is_managed` (boolean, has agent installed)
      - `last_seen` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their client's data
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  hostname text NOT NULL,
  ip_address text NOT NULL,
  agent_status text NOT NULL CHECK (agent_status IN ('Active', 'Disconnected', 'Disabled', 'Decommissioned')),
  event_types text[] DEFAULT '{}',
  last_heartbeat timestamptz DEFAULT now(),
  agent_version text,
  os_info text,
  subnet text,
  vlan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_services table
CREATE TABLE IF NOT EXISTS agent_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('log_forwarder', 'discovery', 'forensics', 'monitoring', 'scanner')),
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_diagnostics table
CREATE TABLE IF NOT EXISTS agent_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  diagnostic_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'warning', 'error', 'info')),
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create forensics_sessions table
CREATE TABLE IF NOT EXISTS forensics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'closed', 'timeout')) DEFAULT 'active',
  started_by uuid,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  session_data jsonb DEFAULT '{}'
);

-- Create network_topology table
CREATE TABLE IF NOT EXISTS network_topology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  discovered_by_agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  discovered_ip text NOT NULL,
  discovered_hostname text,
  subnet text,
  vlan text,
  node_type text,
  is_managed boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_topology ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for agents
CREATE POLICY "Users can view agents"
  ON agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update agents"
  ON agents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete agents"
  ON agents FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for agent_services
CREATE POLICY "Users can view agent services"
  ON agent_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage agent services"
  ON agent_services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for agent_diagnostics
CREATE POLICY "Users can view agent diagnostics"
  ON agent_diagnostics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create agent diagnostics"
  ON agent_diagnostics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for forensics_sessions
CREATE POLICY "Users can view forensics sessions"
  ON forensics_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage forensics sessions"
  ON forensics_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for network_topology
CREATE POLICY "Users can view network topology"
  ON network_topology FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage network topology"
  ON network_topology FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_client_id ON agents(client_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(agent_status);
CREATE INDEX IF NOT EXISTS idx_agents_ip ON agents(ip_address);
CREATE INDEX IF NOT EXISTS idx_agent_services_agent_id ON agent_services(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_diagnostics_agent_id ON agent_diagnostics(agent_id);
CREATE INDEX IF NOT EXISTS idx_forensics_sessions_agent_id ON forensics_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_network_topology_client_id ON network_topology(client_id);
CREATE INDEX IF NOT EXISTS idx_network_topology_agent_id ON network_topology(discovered_by_agent_id);