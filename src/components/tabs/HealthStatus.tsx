import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Search, Download, ChevronLeft, ChevronRight, Zap, Server, FileText, Search as SearchIcon, ClipboardList, Filter, Eye } from 'lucide-react';
import { ClientDetails, StatusCounts } from '../../types';
import * as XLSX from 'xlsx';

interface HealthStatusProps {
  client: ClientDetails;
}

// Mock data for the new status overview
const mockStatusCounts: StatusCounts = {
  device: {
    approved: 124,
    pending: 18,
    decommissioned: 7,
    unmanaged: 11
  },
  windowsAgent: {
    runningActive: 96,
    runningInactive: 14,
    registered: 132,
    disconnected: 9,
    stopped: 3
  },
  lastUpdated: new Date().toISOString()
};

// Mock data for asset management tables
const mockMissingAssets = [
  { id: 1, assetName: 'SRV-WEB-01', ipAddress: '192.168.1.100', lastSeen: '2025-01-15T10:30:00Z', status: 'Missing' },
  { id: 2, assetName: 'DB-PROD-02', ipAddress: '192.168.1.101', lastSeen: '2025-01-14T15:45:00Z', status: 'Suspected Missing' },
  { id: 3, assetName: 'APP-SRV-03', ipAddress: '192.168.1.102', lastSeen: '2025-01-13T09:20:00Z', status: 'Missing' },
  { id: 4, assetName: 'CACHE-01', ipAddress: '192.168.1.103', lastSeen: '2025-01-16T14:10:00Z', status: 'Suspected Missing' },
  { id: 5, assetName: 'LB-MAIN-01', ipAddress: '192.168.1.104', lastSeen: '2025-01-12T11:30:00Z', status: 'Missing' }
];

const mockCMDBDevices = [
  { id: 1, deviceName: 'SRV-WEB-01', ip: '192.168.1.100', type: 'Web Server', status: 'Active', owner: 'IT Team' },
  { id: 2, deviceName: 'DB-PROD-02', ip: '192.168.1.101', type: 'Database Server', status: 'Active', owner: 'DBA Team' },
  { id: 3, deviceName: 'APP-SRV-03', ip: '192.168.1.102', type: 'Application Server', status: 'Inactive', owner: 'Dev Team' },
  { id: 4, deviceName: 'CACHE-01', ip: '192.168.1.103', type: 'Cache Server', status: 'Active', owner: 'IT Team' },
  { id: 5, deviceName: 'LB-MAIN-01', ip: '192.168.1.104', type: 'Load Balancer', status: 'Maintenance', owner: 'Network Team' },
  { id: 6, deviceName: 'FW-EDGE-01', ip: '192.168.1.105', type: 'Firewall', status: 'Active', owner: 'Security Team' },
  { id: 7, deviceName: 'MON-SRV-01', ip: '192.168.1.106', type: 'Monitoring Server', status: 'Active', owner: 'IT Team' }
];

const mockMissingLogs = [
  { id: 1, hostname: 'SRV-WEB-01', ipAddress: '192.168.1.100', missingLogType: 'Application Logs', severity: 'High', lastDetected: '2025-01-17T08:00:00Z' },
  { id: 2, hostname: 'DB-PROD-02', ipAddress: '192.168.1.101', missingLogType: 'Database Logs', severity: 'Critical', lastDetected: '2025-01-17T07:30:00Z' },
  { id: 3, hostname: 'APP-SRV-03', ipAddress: '192.168.1.102', missingLogType: 'System Logs', severity: 'Medium', lastDetected: '2025-01-17T09:15:00Z' },
  { id: 4, hostname: 'CACHE-01', ipAddress: '192.168.1.103', missingLogType: 'Access Logs', severity: 'Low', lastDetected: '2025-01-17T10:00:00Z' },
  { id: 5, hostname: 'LB-MAIN-01', ipAddress: '192.168.1.104', missingLogType: 'Traffic Logs', severity: 'High', lastDetected: '2025-01-17T06:45:00Z' }
];

// Mock data for Missing Logs Overview
const mockMissingLogsData = {
  summary: {
    totalMissingLogs: 2890,
    affectedDevicesAll: 142,
    totalMissingWithoutPolicy: 1185,
    affectedDevicesNoPolicy: 54,
    lastUpdated: '2025-01-17T18:30:00Z'
  },
  rows: [
    {
      id: 1,
      deviceName: 'FW-BR01',
      ip: '10.10.1.1',
      vendor: 'Fortinet',
      location: 'Brazil',
      missingSince: '2025-01-14T07:20:00Z',
      hasPolicy: true,
      policyName: 'HQ-Core',
      severity: 'High'
    },
    {
      id: 2,
      deviceName: 'SW-US02',
      ip: '10.20.1.5',
      vendor: 'Cisco',
      location: 'United States',
      missingSince: '2025-01-15T14:30:00Z',
      hasPolicy: false,
      policyName: null,
      severity: 'Critical'
    },
    {
      id: 3,
      deviceName: 'RTR-EU03',
      ip: '10.30.1.10',
      vendor: 'Juniper',
      location: 'Germany',
      missingSince: '2025-01-16T09:45:00Z',
      hasPolicy: true,
      policyName: 'EU-Regional',
      severity: 'Medium'
    },
    {
      id: 4,
      deviceName: 'AP-AS04',
      ip: '10.40.1.15',
      vendor: 'Aruba',
      location: 'Singapore',
      missingSince: '2025-01-13T16:10:00Z',
      hasPolicy: false,
      policyName: null,
      severity: 'High'
    },
    {
      id: 5,
      deviceName: 'LB-CA05',
      ip: '10.50.1.20',
      vendor: 'F5',
      location: 'Canada',
      missingSince: '2025-01-12T11:25:00Z',
      hasPolicy: true,
      policyName: 'NA-Core',
      severity: 'Low'
    },
    {
      id: 6,
      deviceName: 'FW-AU06',
      ip: '10.60.1.25',
      vendor: 'Palo Alto',
      location: 'Australia',
      missingSince: '2025-01-17T05:15:00Z',
      hasPolicy: false,
      policyName: null,
      severity: 'Critical'
    },
    {
      id: 7,
      deviceName: 'SW-IN07',
      ip: '10.70.1.30',
      vendor: 'HPE',
      location: 'India',
      missingSince: '2025-01-16T20:40:00Z',
      hasPolicy: true,
      policyName: 'APAC-Regional',
      severity: 'Medium'
    },
    {
      id: 8,
      deviceName: 'RTR-MX08',
      ip: '10.80.1.35',
      vendor: 'Cisco',
      location: 'Mexico',
      missingSince: '2025-01-15T13:55:00Z',
      hasPolicy: false,
      policyName: null,
      severity: 'High'
    }
  ]
};

// Mock data for milestone timeline
const mockInitiatives = [
  {
    id: 'assets-cleanup',
    name: 'Assets Clean Up',
    icon: Server,
    color: 'emerald',
    progress: 75,
    milestones: [
      { month: 'Jun', status: 'delivered', date: '2025-06-15', details: 'Phase 1: Inventory audit completed', beforeCount: 150, afterCount: 124 },
      { month: 'Jul', status: 'delivered', date: '2025-07-20', details: 'Phase 2: Decommissioned legacy systems', beforeCount: 124, afterCount: 98 },
      { month: 'Aug', status: 'delivered', date: '2025-08-10', details: 'Phase 3: Asset tagging standardized', beforeCount: 98, afterCount: 87 },
      { month: 'Sep', status: 'pending', date: '2025-09-30', details: 'Phase 4: Final cleanup and validation', beforeCount: 87, afterCount: 75 },
      { month: 'Oct', status: 'pending', date: '2025-10-15', details: 'Phase 5: Documentation update', beforeCount: 75, afterCount: 70 },
      { month: 'Nov', status: 'pending', date: '2025-11-30', details: 'Phase 6: Process automation', beforeCount: 70, afterCount: 65 }
    ]
  },
  {
    id: 'missing-logs',
    name: 'Missing Logs',
    icon: FileText,
    color: 'amber',
    progress: 60,
    milestones: [
      { month: 'Jun', status: 'delivered', date: '2025-06-30', details: 'Log source identification completed', beforeCount: 45, afterCount: 38 },
      { month: 'Jul', status: 'delivered', date: '2025-07-25', details: 'Critical log sources restored', beforeCount: 38, afterCount: 28 },
      { month: 'Aug', status: 'delivered', date: '2025-08-15', details: 'Monitoring alerts configured', beforeCount: 28, afterCount: 22 },
      { month: 'Sep', status: 'missed', date: '2025-09-20', details: 'Delayed: Resource constraints', reason: 'Team reassigned to critical incident', beforeCount: 22, afterCount: 22 },
      { month: 'Oct', status: 'pending', date: '2025-10-25', details: 'Secondary log sources recovery', beforeCount: 22, afterCount: 15 },
      { month: 'Nov', status: 'pending', date: '2025-11-20', details: 'Log retention policy implementation', beforeCount: 15, afterCount: 8 }
    ]
  },
  {
    id: 'manual-health-check',
    name: 'Manual Health Check',
    icon: SearchIcon,
    color: 'cyan',
    progress: 50,
    milestones: [
      { month: 'Jun', status: 'delivered', date: '2025-06-10', details: 'Health check procedures defined', beforeCount: 0, afterCount: 25 },
      { month: 'Jul', status: 'delivered', date: '2025-07-15', details: 'Initial health assessments completed', beforeCount: 25, afterCount: 50 },
      { month: 'Aug', status: 'delivered', date: '2025-08-20', details: 'Automated health check tools deployed', beforeCount: 50, afterCount: 75 },
      { month: 'Sep', status: 'pending', date: '2025-09-25', details: 'Advanced diagnostics implementation', beforeCount: 75, afterCount: 85 },
      { month: 'Oct', status: 'pending', date: '2025-10-30', details: 'Performance baseline establishment', beforeCount: 85, afterCount: 95 },
      { month: 'Dec', status: 'pending', date: '2025-12-15', details: 'Full automation and reporting', beforeCount: 95, afterCount: 100 }
    ]
  },
  {
    id: 'asset-list-review',
    name: 'Asset List Review',
    icon: ClipboardList,
    color: 'violet',
    progress: 85,
    milestones: [
      { month: 'Jun', status: 'delivered', date: '2025-06-05', details: 'Asset inventory export completed', beforeCount: 200, afterCount: 180 },
      { month: 'Jul', status: 'delivered', date: '2025-07-10', details: 'Duplicate asset removal', beforeCount: 180, afterCount: 160 },
      { month: 'Aug', status: 'delivered', date: '2025-08-05', details: 'Asset categorization updated', beforeCount: 160, afterCount: 145 },
      { month: 'Sep', status: 'delivered', date: '2025-09-10', details: 'Ownership assignment completed', beforeCount: 145, afterCount: 132 },
      { month: 'Oct', status: 'delivered', date: '2025-10-05', details: 'Asset lifecycle status updated', beforeCount: 132, afterCount: 124 },
      { month: 'Nov', status: 'pending', date: '2025-11-15', details: 'Final validation and approval', beforeCount: 124, afterCount: 120 }
    ]
  }
];

const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', progress: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', progress: 'bg-amber-500' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', progress: 'bg-cyan-500' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', progress: 'bg-violet-500' }
};

const HealthStatus: React.FC<HealthStatusProps> = ({ client }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [uptimeRange, setUptimeRange] = useState<'24h' | '7d'>('24h');

  const getHealthSummary = () => {
    const summary = client.healthChecks.reduce((acc, check) => {
      acc[check.status] = (acc[check.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return summary;
  };

  const getOverallUptime = () => {
    const totalUptime = client.healthChecks.reduce((sum, check) => sum + check.uptime, 0);
    return (totalUptime / client.healthChecks.length).toFixed(2);
  };

  const healthSummary = getHealthSummary();
  const overallUptime = getOverallUptime();

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* EPS Metrics Card */}
      <EPSMetricsCard client={client} />
      
      {/* Missing Logs Overview Card */}
      <MissingLogsOverviewCard />
    </div>
  );
};

/* ---------- Status Overview Components ---------- */

function EPSMetricsCard({ client }: { client: ClientDetails }) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');

  // Mock EPS data - in real app this would come from props or API
  const epsMetrics = {
    licensed: 5000,
    used: 3250,
    average: 2890,
    max: 3750
  };

  // Generate mock chart data based on client's existing EPS data
  const chartData = client.epsData.map((point, index) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    used: point.eventsPerSecond,
    average: epsMetrics.average,
    max: Math.max(point.eventsPerSecond * 1.2, epsMetrics.max)
  }));

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-12"></div>
          <h2 className="text-xl font-semibold text-white mx-6 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-[#F4A814]" style={{ filter: 'drop-shadow(0 0 8px rgba(244, 168, 20, 0.4))' }} />
            EPS Metrics
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === '24h' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === '7d' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            7d
          </button>
        </div>
      </div>

      {/* EPS Value Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0E1525] border border-emerald-700/30 rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 text-sm font-medium">Licensed EPS</span>
          </div>
          <div className="text-3xl font-semibold text-emerald-300">
            {epsMetrics.licensed.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0E1525] border border-cyan-700/30 rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300 text-sm font-medium">Used EPS</span>
          </div>
          <div className="text-3xl font-semibold text-cyan-300">
            {epsMetrics.used.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {((epsMetrics.used / epsMetrics.licensed) * 100).toFixed(1)}% of licensed
          </div>
        </div>

        <div className="bg-[#0E1525] border border-amber-700/30 rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300 text-sm font-medium">Average EPS</span>
          </div>
          <div className="text-3xl font-semibold text-amber-300">
            {epsMetrics.average.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {timeRange} period
          </div>
        </div>

        <div className="bg-[#0E1525] border border-violet-700/30 rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400"></span>
            <span className="text-slate-300 text-sm font-medium">Max EPS</span>
          </div>
          <div className="text-3xl font-semibold text-violet-300">
            {epsMetrics.max.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Peak value
          </div>
        </div>
      </div>

      {/* EPS Trend Chart */}
      <div className="bg-[#0E1525] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">EPS Trends</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-cyan-400 rounded"></div>
              <span className="text-slate-300">Used EPS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-amber-400 rounded"></div>
              <span className="text-slate-300">Average EPS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-violet-400 rounded"></div>
              <span className="text-slate-300">Max EPS</span>
            </div>
          </div>
        </div>
        
        {/* Simple SVG Chart */}
        <div className="h-80 w-full">
          <svg className="w-full h-full" viewBox="0 0 900 280">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="90" height="56" patternUnits="userSpaceOnUse">
                <path d="M 90 0 L 0 0 0 56" fill="none" stroke="rgb(148 163 184 / 0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Chart lines */}
            {chartData.length > 1 && (
              <>
                {/* Used EPS line */}
                <polyline
                  fill="none"
                  stroke="rgb(34 211 238)"
                  strokeWidth="3"
                  points={chartData.map((point, index) => 
                    `${(index / (chartData.length - 1)) * 870 + 15},${265 - (point.used / 4000) * 250}`
                  ).join(' ')}
                />
                
                {/* Average EPS line */}
                <polyline
                  fill="none"
                  stroke="rgb(251 191 36)"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  points={chartData.map((point, index) => 
                    `${(index / (chartData.length - 1)) * 870 + 15},${265 - (point.average / 4000) * 250}`
                  ).join(' ')}
                />
                
                {/* Max EPS line */}
                <polyline
                  fill="none"
                  stroke="rgb(139 92 246)"
                  strokeWidth="3"
                  strokeDasharray="3,3"
                  points={chartData.map((point, index) => 
                    `${(index / (chartData.length - 1)) * 870 + 15},${265 - (point.max / 4000) * 250}`
                  ).join(' ')}
                />
                
                {/* Data points */}
                {chartData.map((point, index) => (
                  <circle
                    key={index}
                    cx={(index / (chartData.length - 1)) * 870 + 15}
                    cy={265 - (point.used / 4000) * 250}
                    r="4"
                    fill="rgb(34 211 238)"
                  />
                ))}
              </>
            )}
            
            {/* Y-axis labels */}
            <text x="5" y="20" fill="rgb(148 163 184)" fontSize="14">4000</text>
            <text x="5" y="82" fill="rgb(148 163 184)" fontSize="14">3000</text>
            <text x="5" y="144" fill="rgb(148 163 184)" fontSize="14">2000</text>
            <text x="5" y="206" fill="rgb(148 163 184)" fontSize="14">1000</text>
            <text x="5" y="275" fill="rgb(148 163 184)" fontSize="14">0</text>
            
            {/* X-axis labels */}
            {chartData.map((point, index) => (
              index % 2 === 0 && (
                <text
                  key={index}
                  x={(index / (chartData.length - 1)) * 870 + 15}
                  y="295"
                  fill="rgb(148 163 184)"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {point.time}
                </text>
              )
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------- Missing Logs Overview Card ---------- */

function MissingLogsOverviewCard() {
  const [tableFilter, setTableFilter] = useState<'all' | 'no-policy'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const missingLogsThreshold = 3000;
  const missingWithoutPolicyThreshold = 1500;

  // Filter and sort data
  const filteredRows = mockMissingLogsData.rows.filter(row => {
    // Filter by policy
    if (tableFilter === 'no-policy' && row.hasPolicy) return false;
    
    // Filter by severity
    if (severityFilter !== 'all' && row.severity !== severityFilter) return false;
    
    // Filter by search
    if (searchQuery) {
      const searchText = [row.deviceName, row.ip, row.policyName || ''].join(' ').toLowerCase();
      if (!searchText.includes(searchQuery.toLowerCase())) return false;
    }
    
    return true;
  });

  // Sort data
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    let aValue = (a as any)[key];
    let bValue = (b as any)[key];
    
    // Handle date sorting
    if (key === 'missingSince') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const exportToXlsx = (exportFilter: 'all' | 'no-policy') => {
    const dataToExport = mockMissingLogsData.rows.filter(row => 
      exportFilter === 'all' || !row.hasPolicy
    );
    
    const exportData = dataToExport.map(row => ({
      'Device': row.deviceName,
      'IP': row.ip,
      'Vendor': row.vendor,
      'Location': row.location,
      'Missing Since (ISO)': row.missingSince,
      'Has Policy': row.hasPolicy ? 'Yes' : 'No',
      'Policy Name': row.policyName || '',
      'Severity': row.severity
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Missing Logs');
    
    const today = new Date().toISOString().split('T')[0];
    const filename = exportFilter === 'all' 
      ? `missing-logs_all_${today}.xlsx`
      : `missing-logs_no-policy_${today}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-12"></div>
          <h2 className="text-xl font-semibold text-white mx-6 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#FF2D78]" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 45, 120, 0.4))' }} />
            Missing Logs Overview
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
        </div>
        
        {/* Export Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportToXlsx('all')}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </button>
          <button
            onClick={() => exportToXlsx('no-policy')}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export No Policy</span>
          </button>
        </div>
      </div>

      {/* Speedometer Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Speedometer
          value={mockMissingLogsData.summary.totalMissingLogs}
          threshold={missingLogsThreshold}
          title="All Missing Logs"
          subtitle={`Affected Devices: ${mockMissingLogsData.summary.affectedDevicesAll}`}
          lastUpdated={mockMissingLogsData.summary.lastUpdated}
        />
        <Speedometer
          value={mockMissingLogsData.summary.totalMissingWithoutPolicy}
          threshold={missingWithoutPolicyThreshold}
          title="Missing Logs Without Policy"
          subtitle={`Affected Devices: ${mockMissingLogsData.summary.affectedDevicesNoPolicy}`}
          lastUpdated={mockMissingLogsData.summary.lastUpdated}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mb-8 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-slate-300">Healthy (0-25%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-slate-300">Watch (25-75%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-slate-300">Risk (75%+)</span>
        </div>
      </div>

      {/* Missing Logs Table */}
      <MissingLogsTable
        rows={sortedRows}
        tableFilter={tableFilter}
        setTableFilter={setTableFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
}

/* ---------- Speedometer Component ---------- */

interface SpeedometerProps {
  value: number;
  threshold: number;
  title: string;
  subtitle: string;
  lastUpdated: string;
}

function Speedometer({ value, threshold, title, subtitle, lastUpdated }: SpeedometerProps) {
  const percentage = Math.min((value / threshold) * 100, 100);
  const angle = (percentage / 100) * 180; // 0-180 degrees for semicircle
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage <= 25) return { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' }; // emerald
    if (percentage <= 75) return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }; // amber
    return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }; // red
  };
  
  const { color, glow } = getColor();
  
  return (
    <div className="bg-[#0E1525] border border-white/8 rounded-2xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.35)] relative group">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      </div>
      
      {/* Speedometer SVG */}
      <div className="relative flex justify-center mb-4">
        <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgb(51 65 85)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 251.3} 251.3`}
            style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
          />
          
          {/* Needle */}
          <g transform={`translate(100, 100) rotate(${angle - 90})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-70"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
            />
            <circle
              cx="0"
              cy="0"
              r="4"
              fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
            />
          </g>
          
          {/* Center values */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            className="fill-white text-2xl font-bold"
            style={{ fontSize: '24px' }}
          >
            {value.toLocaleString()}
          </text>
          <text
            x="100"
            y="105"
            textAnchor="middle"
            className="fill-slate-400 text-xs"
            style={{ fontSize: '12px' }}
          >
            {subtitle}
          </text>
        </svg>
      </div>
      
      {/* Percentage indicator */}
      <div className="text-center">
        <div className="text-sm text-slate-400">
          {percentage.toFixed(1)}% of threshold ({threshold.toLocaleString()})
        </div>
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="absolute top-2 right-2 bg-[#111726] border border-white/20 rounded-lg p-3 shadow-xl text-xs">
          <div className="text-white font-medium mb-1">Current: {value.toLocaleString()}</div>
          <div className="text-slate-300 mb-1">Threshold: {threshold.toLocaleString()}</div>
          <div className="text-slate-400">Updated: {new Date(lastUpdated).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Missing Logs Table Component ---------- */

interface MissingLogsTableProps {
  rows: any[];
  tableFilter: 'all' | 'no-policy';
  setTableFilter: (filter: 'all' | 'no-policy') => void;
  severityFilter: string;
  setSeverityFilter: (severity: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

function MissingLogsTable({
  rows,
  tableFilter,
  setTableFilter,
  severityFilter,
  setSeverityFilter,
  searchQuery,
  setSearchQuery,
  onSort,
  sortConfig
}: MissingLogsTableProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-[#0E1525] border border-white/8 rounded-2xl p-6">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white">Missing Logs — Details</h3>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search device/IP/policy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 text-sm"
            />
          </div>
          
          {/* View Filter */}
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value as 'all' | 'no-policy')}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">All Missing</option>
            <option value="no-policy">Missing Without Policy</option>
          </select>
          
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#0E1525]">
            <tr className="border-b border-slate-700/50">
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('deviceName')}
              >
                Device <SortIcon column="deviceName" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('ip')}
              >
                IP <SortIcon column="ip" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('vendor')}
              >
                Vendor <SortIcon column="vendor" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('location')}
              >
                Location <SortIcon column="location" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('missingSince')}
              >
                Missing Since <SortIcon column="missingSince" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('hasPolicy')}
              >
                Has Policy? <SortIcon column="hasPolicy" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('policyName')}
              >
                Policy Name <SortIcon column="policyName" />
              </th>
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('severity')}
              >
                Severity <SortIcon column="severity" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200">
                <td className="py-3 px-4 text-sm text-white font-medium">{row.deviceName}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{row.ip}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{row.vendor}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{row.location}</td>
                <td className="py-3 px-4 text-sm text-slate-300">
                  {new Date(row.missingSince).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    row.hasPolicy 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {row.hasPolicy ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">
                  {row.policyName || '—'}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(row.severity)}`}>
                    {row.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {rows.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No records found</p>
        </div>
      )}
      
      {/* Results Counter */}
      {rows.length > 0 && (
        <div className="mt-4 text-sm text-slate-400 text-center">
          Showing {rows.length} of {mockMissingLogsData.rows.length} records
        </div>
      )}
    </div>
  );
}

/* ---------- Asset Management Tables Component ---------- */

function CMDBDevicesCard() {
  const cmdbColumns: Column[] = [
    { key: 'deviceName', label: 'Device Name' },
    { key: 'ip', label: 'IP Address' },
    { key: 'type', label: 'Type' },
    { 
      key: 'status', 
      label: 'Status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
          status === 'Inactive' ? 'bg-slate-500/20 text-slate-400' :
          'bg-amber-500/20 text-amber-400'
        }`}>
          {status}
        </span>
      )
    },
    { key: 'owner', label: 'Owner' }
  ];

  return (
    <AssetTable
      title="All CMDB Devices"
      data={mockCMDBDevices}
      columns={cmdbColumns}
      exportFileName="cmdb-devices"
    />
  );
}

function MissingLogsCard() {
  const missingLogsColumns: Column[] = [
    { key: 'hostname', label: 'Hostname' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'missingLogType', label: 'Missing Log Type' },
    { 
      key: 'severity', 
      label: 'Severity',
      render: (severity: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
          severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
          severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {severity}
        </span>
      )
    },
    { 
      key: 'lastDetected', 
      label: 'Last Detected',
      render: (timestamp: string) => new Date(timestamp).toLocaleString()
    }
  ];

  return (
    <AssetTable
      title="All Missing Logs"
      data={mockMissingLogs}
      columns={missingLogsColumns}
      exportFileName="missing-logs"
    />
  );
}

function InitiativesTimelineCard() {
  const [hoveredMilestone, setHoveredMilestone] = useState<any>(null);

  const getSummaryStats = () => {
    let totalDelivered = 0;
    let totalPending = 0;
    let totalMissed = 0;
    let totalMilestones = 0;

    mockInitiatives.forEach(initiative => {
      initiative.milestones.forEach(milestone => {
        totalMilestones++;
        if (milestone.status === 'delivered') totalDelivered++;
        else if (milestone.status === 'pending') totalPending++;
        else if (milestone.status === 'missed') totalMissed++;
      });
    });

    const overallCompletion = Math.round((totalDelivered / totalMilestones) * 100);

    return { totalDelivered, totalPending, totalMissed, overallCompletion };
  };

  const stats = getSummaryStats();

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-12"></div>
          <h2 className="text-xl font-semibold text-white mx-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#14D8C4]" style={{ filter: 'drop-shadow(0 0 8px rgba(20, 216, 196, 0.4))' }} />
            Health Status Initiatives
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="w-48"></div> {/* Space for initiative names */}
          {months.map((month) => (
            <div key={month} className="flex-1 text-center">
              <div className="text-sm font-medium text-slate-300">{month} 2025</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Rows */}
      <div className="space-y-6 mb-8">
        {mockInitiatives.map((initiative, initiativeIndex) => {
          const Icon = initiative.icon;
          const colors = colorMap[initiative.color as keyof typeof colorMap];
          
          return (
            <div key={initiative.id} className="relative">
              {/* Initiative Info */}
              <div className="flex items-center mb-3">
                <div className="w-48 flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  <div>
                    <div className={`font-medium ${colors.text}`}>{initiative.name}</div>
                    <div className="w-32 bg-slate-800 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${colors.progress} transition-all duration-1000 ease-out`}
                        style={{ width: `${initiative.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{initiative.progress}% complete</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 flex justify-between items-center relative">
                  {/* Background line */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-0.5 bg-slate-700/50"></div>
                  </div>

                  {months.map((month, monthIndex) => {
                    const milestone = initiative.milestones.find(m => m.month === month);
                    
                    return (
                      <div key={month} className="flex-1 flex justify-center relative">
                        {milestone ? (
                          <div
                            className="relative z-10 cursor-pointer transform hover:scale-110 transition-transform duration-200"
                            onMouseEnter={() => setHoveredMilestone({ ...milestone, initiativeName: initiative.name })}
                            onMouseLeave={() => setHoveredMilestone(null)}
                          >
                            {milestone.status === 'delivered' && (
                              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                            {milestone.status === 'pending' && (
                              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                <Clock className="h-4 w-4 text-white" />
                              </div>
                            )}
                            {milestone.status === 'missed' && (
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                <XCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                            
                            {/* Connecting line to next milestone */}
                            {monthIndex < months.length - 1 && initiative.milestones.find(m => m.month === months[monthIndex + 1]) && (
                              <svg className="absolute left-6 top-3 w-16 h-4 pointer-events-none">
                                <path
                                  d="M 0 0 Q 8 -4 16 0"
                                  stroke={colors.progress.replace('bg-', '#').replace('-500', '')}
                                  strokeWidth="2"
                                  fill="none"
                                  className="opacity-60"
                                />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <div className="w-2 h-2 bg-slate-600 rounded-full opacity-30"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="border-t border-slate-700/50 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0E1525] border border-emerald-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Delivered</span>
            </div>
            <div className="text-2xl font-bold text-emerald-300">{stats.totalDelivered}</div>
          </div>
          
          <div className="bg-[#0E1525] border border-amber-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Pending</span>
            </div>
            <div className="text-2xl font-bold text-amber-300">{stats.totalPending}</div>
          </div>
          
          <div className="bg-[#0E1525] border border-red-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Missed</span>
            </div>
            <div className="text-2xl font-bold text-red-300">1</div>
          </div>
          
          <div className="bg-[#0E1525] border border-cyan-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Overall Progress</span>
            </div>
            <div className="text-2xl font-bold text-cyan-300">{stats.overallCompletion}%</div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredMilestone && (
        <div className="fixed z-50 bg-[#111726] border border-white/20 rounded-lg p-4 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
             style={{ 
               left: '50%', 
               top: '50%',
               maxWidth: '300px'
             }}>
          <div className="text-sm font-medium text-white mb-2">{hoveredMilestone.initiativeName}</div>
          <div className="text-xs text-slate-300 mb-2">{hoveredMilestone.details}</div>
          <div className="text-xs text-slate-400">
            <div>Date: {hoveredMilestone.date}</div>
            {hoveredMilestone.beforeCount !== undefined && (
              <div>Impact: {hoveredMilestone.beforeCount} → {hoveredMilestone.afterCount}</div>
            )}
            {hoveredMilestone.reason && (
              <div className="text-red-400 mt-1">Reason: {hoveredMilestone.reason}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetManagementTables() {
  return (
    <div className="space-y-8">
      {/* Asset Management Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* All CMDB Devices Card */}
        <CMDBDevicesCard />
        
        {/* All Missing Logs Card */}
        <MissingLogsCard />
      </div>
    </div>
  );
}

/* ---------- Generic Asset Table Component ---------- */

interface Column {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode;
}

interface AssetTableProps {
  title: string;
  data: any[];
  columns: Column[];
  exportFileName: string;
}

function AssetTable({ title, data, columns, exportFileName }: AssetTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredData.map(item => {
      const exportItem: any = {};
      columns.forEach(column => {
        exportItem[column.label] = item[column.key];
      });
      return exportItem;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            />
          </div>
          
          {/* Export Button */}
          <button
            onClick={exportToExcel}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {columns.map((column) => (
                <th key={column.key} className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.id || index} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 px-4 text-sm text-white">
                    {column.render ? column.render(item[column.key]) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                      currentPage === pageNum
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No results found</p>
        </div>
      )}
    </div>
  );
}

export default HealthStatus;