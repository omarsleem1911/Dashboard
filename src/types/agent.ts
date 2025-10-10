export interface Agent {
  id: string;
  client_id: string;
  hostname: string;
  ip_address: string;
  agent_status: 'Active' | 'Disconnected' | 'Disabled' | 'Decommissioned';
  event_types: string[];
  last_heartbeat: string;
  agent_version?: string;
  os_info?: string;
  subnet?: string;
  vlan?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentService {
  id: string;
  agent_id: string;
  service_name: string;
  service_type: 'log_forwarder' | 'discovery' | 'forensics' | 'monitoring' | 'scanner';
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentDiagnostic {
  id: string;
  agent_id: string;
  diagnostic_type: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: Record<string, any>;
  created_at: string;
}

export interface ForensicsSession {
  id: string;
  agent_id: string;
  session_token: string;
  status: 'active' | 'closed' | 'timeout';
  started_by?: string;
  started_at: string;
  ended_at?: string;
  session_data: Record<string, any>;
}

export interface NetworkNode {
  id: string;
  client_id: string;
  discovered_by_agent_id?: string;
  discovered_ip: string;
  discovered_hostname?: string;
  subnet?: string;
  vlan?: string;
  node_type?: string;
  is_managed: boolean;
  last_seen: string;
  created_at: string;
}

export interface AgentStatusSummary {
  total: number;
  active: number;
  disconnected: number;
  disabled: number;
  decommissioned: number;
}
