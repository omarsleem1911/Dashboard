export interface Client {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  deploymentEngineer: string;
  deploymentEngineerSlack: string;
  project: string;
  status: 'planning' | 'development' | 'testing' | 'staging' | 'production' | 'maintenance';
  team: string;
  lastDeployment: string;
  nextMilestone: string;
  logo: string;
  industry: string;
  website: string;
}

export interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastCheck: string;
  responseTime: number;
  uptime: number;
  endpoint: string;
  description: string;
}

export interface EPSData {
  timestamp: string;
  eventsPerSecond: number;
  totalEvents: number;
  errorRate: number;
}

export interface ClientDetails extends Client {
  healthChecks: HealthCheck[];
  epsData: EPSData[];
  deploymentHistory: {
    date: string;
    version: string;
    status: 'success' | 'failed' | 'rollback';
    deployedBy: string;
  }[];
  infrastructure: {
    servers: number;
    databases: number;
    loadBalancers: number;
    cdnEndpoints: number;
  };
}

export interface DailyUpdateTicket {
  id: string;
  client_id: string;
  client_name: string;
  date: string; // YYYY-MM-DD
  category: 'COLLECTORS' | 'MISSING_LOGS';
  informed: boolean;
  email_subject?: string;
  reason_code?: 'ON_LEAVE' | 'AWAITING_APPROVAL' | 'CLIENT_MAINTENANCE' | 'NO_CHANGE' | 'OTHER';
  reason_text?: string;
  notes?: string;
  engineer_name: string;
  engineer_id: string;
  affected_count: number;
  snapshot_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminPanelData {
  client_id: string;
  client_name: string;
  collectors_status: 'DONE' | 'PENDING' | 'NOT_INFORMED';
  missing_logs_status: 'DONE' | 'PENDING' | 'NOT_INFORMED';
  engineer_name: string;
  last_update_time?: string;
  collectors_ticket?: DailyUpdateTicket;
  missing_logs_ticket?: DailyUpdateTicket;
}

export interface StatusCounts {
  device: {
    approved: number;
    pending: number;
    decommissioned: number;
    unmanaged: number;
  };
  windowsAgent: {
    runningActive: number;
    runningInactive: number;
    registered: number;
    disconnected: number;
    stopped: number;
  };
  lastUpdated?: string;
}