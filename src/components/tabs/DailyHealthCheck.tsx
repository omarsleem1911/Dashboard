// DailyHealthCheck.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Copy, Download,
  Mail, X, ChevronDown, ChevronUp, Eye, Filter
} from 'lucide-react';
import { ClientDetails } from '../../types';
import * as XLSX from 'xlsx';

interface DailyHealthCheckProps {
  client: ClientDetails;
}

type CollectorStatus = 'healthy' | 'warning' | 'critical' | 'not_connected';

const StatusChip = ({ status }: { status: CollectorStatus }) => {
  const classes: Record<CollectorStatus, string> = {
    healthy:       'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20',
    warning:       'bg-amber-500/10   text-amber-300   border border-amber-400/20',
    critical:      'bg-rose-500/10    text-rose-300    border border-rose-400/20',
    not_connected: 'bg-slate-600/15   text-slate-300   border border-slate-400/20',
  };
  const label = status === 'not_connected'
    ? 'Not Connected'
    : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classes[status]}`}>
      {label}
    </span>
  );
};

interface Collector {
  id: string;
  name: string;
  ip: string;
  status: CollectorStatus;
  lastEventAt?: string;
  lastFileAt?: string;
  lastUpdatedAt?: string;
}

// Mock data for collectors
const mockCollectors: Collector[] = [
  {
    id: 'coll-risk',
    name: 'CollMain',
    ip: '192.168.1.15',
    status: 'critical',
    lastEventAt: '2025-01-17T08:30:00Z',
    lastFileAt: '2025-01-17T07:45:00Z',
    lastUpdatedAt: '2025-01-17T09:15:00Z'
  },
  {
    id: 'collAin',
    name: 'collAin',
    ip: '192.168.1.12',
    status: 'healthy',
    lastEventAt: '2025-01-17T10:25:00Z',
    lastFileAt: '2025-01-17T10:20:00Z',
    lastUpdatedAt: '2025-01-17T10:30:00Z'
  },
  {
    id: 'collNabil',
    name: 'CollNabil',
    ip: '192.168.1.18',
    status: 'warning',
    lastEventAt: '2025-01-17T09:45:00Z',
    lastFileAt: '2025-01-17T08:30:00Z',
    lastUpdatedAt: '2025-01-17T10:00:00Z'
  },
  {
    id: 'collKw',
    name: 'CollKw',
    ip: '192.168.1.25',
    status: 'not_connected',
    lastEventAt: undefined,
    lastFileAt: '2025-01-16T23:45:00Z',
    lastUpdatedAt: '2025-01-17T06:00:00Z'
  },
];

// Critical Missing Logs (realistic dataset)
const missingLogs = [
  { hostname: "aao-ir-frw-01", ip: "10.116.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" },
  { hostname: "art-ir-frw-01", ip: "10.119.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" },
  { hostname: "edp-ir-frw-01", ip: "10.131.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" },
  { hostname: "fw-001-mrc", ip: "10.224.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" },
  { hostname: "git-ir-frw-0001", ip: "10.118.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" },
  { hostname: "hfd-ir-frw-01", ip: "10.115.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" },
  { hostname: "kch-ir-frw-01", ip: "10.117.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" },
  { hostname: "scr-ir-frw-01", ip: "10.114.200.254", criticality: "Critical", location: "-", missingEvents: '(FortiGate-) + (Fortigate-Traffic-Close"  AND  subtype="local)', missingTypes: "(FW-FG:1) + (FW-FG-Local:12)", deviceType: "Fortinet FortiOS" }
];

const statusDotColors = {
  healthy: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-red-400',
  not_connected: 'bg-slate-500'
};

const DailyHealthCheck: React.FC<DailyHealthCheckProps> = ({ client }) => {
  // Collectors state
  const [collectors] = useState<Collector[]>(mockCollectors);

  // Filters and UI state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals (kept, triggered from headers now)
  const [showCollectorsModal, setShowCollectorsModal] = useState(false);
  const [showMissingLogsModal, setShowMissingLogsModal] = useState(false);

  // Shared form state
  const [informed, setInformed] = useState<'yes' | 'no'>('yes');
  const [emailSubject, setEmailSubject] = useState('');
  const [reasonCode, setReasonCode] = useState('NO_CHANGE');
  const [reasonText, setReasonText] = useState('');
  const [notes, setNotes] = useState('');

  // Status Overview
  const [uptimeRange, setUptimeRange] = useState<'24h' | '7d'>('24h');
  const [statusUpdates, setStatusUpdates] = useState<Record<string, {
    status: 'pending' | 'done';
    lastUpdatedBy?: string;
    lastUpdatedTime?: string;
  }>>({
    decommissioned: { status: 'pending' },
    disconnected: { status: 'pending' },
    stopped: { status: 'pending' }
  });
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showAffectedItems, setShowAffectedItems] = useState<string | null>(null);

  // Mock counts
  const statusCounts = {
    device: { approved: 124, pending: 18, decommissioned: 7, unmanaged: 11 },
    windowsAgent: { runningActive: 96, runningInactive: 14, registered: 132, disconnected: 9, stopped: 3 },
    lastUpdated: new Date().toISOString()
  };

  // Affected items for actionable KPI cards
  const affectedItems = {
    disconnected: [
      { id: 'srv-001', name: 'SRV-WEB-001', ip: '192.168.1.10', lastSeen: '2025-01-16T14:30:00Z' },
      { id: 'srv-002', name: 'SRV-APP-002', ip: '192.168.1.11', lastSeen: '2025-01-16T13:45:00Z' },
      { id: 'srv-003', name: 'SRV-DB-003', ip: '192.168.1.12', lastSeen: '2025-01-16T12:20:00Z' }
    ],
    decommissioned: [
      { id: 'old-001', name: 'OLD-SRV-001', ip: '192.168.1.100', decommissionedDate: '2025-01-15' },
      { id: 'old-002', name: 'OLD-SRV-002', ip: '192.168.1.101', decommissionedDate: '2025-01-14' }
    ],
    stopped: [
      { id: 'stop-001', name: 'STOP-SRV-001', ip: '192.168.1.200', stoppedDate: '2025-01-16T10:00:00Z' },
      { id: 'stop-002', name: 'STOP-SRV-002', ip: '192.168.1.201', stoppedDate: '2025-01-16T09:30:00Z' }
    ]
  };

  const filteredCollectors = collectors.filter(c => filterStatus === 'all' || c.status === filterStatus);

  const filteredMissingLogs = missingLogs.filter(log => {
    const searchText = [log.hostname, log.ip, log.location, log.missingTypes, log.deviceType]
      .join(' ').toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  const exportToExcel = () => {
    const data = filteredMissingLogs.map(log => ({
      'Host Name': log.hostname,
      'IP Address': log.ip,
      'Criticality Flag': log.criticality,
      'Location': log.location,
      'Missing Events': log.missingEvents,
      'Missing Log Types': log.missingTypes,
      'Device Type': log.deviceType
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Critical Missing Logs');
    XLSX.writeFile(wb, 'critical-missing-logs.xlsx');
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const getCriticalCounts = () => ({
    criticalCollectors: collectors.filter(c => c.status === 'critical').length,
    criticalMissingLogs: missingLogs.length
  });

  const handleSubmitUpdate = async (type: 'collectors' | 'missingLogs') => {
    if (informed === 'yes' && !emailSubject.trim()) return alert('Email Subject is required.');
    if (informed === 'no' && !reasonCode) return alert('Please select a reason.');
    if (informed === 'no' && reasonCode === 'OTHER' && !reasonText.trim())
      return alert('Please provide details for "Other".');

    const counts = getCriticalCounts();
    const updateData = {
      date: new Date().toISOString().slice(0, 10),
      type,
      informed: informed === 'yes',
      email_subject: informed === 'yes' ? emailSubject : null,
      reason_code: informed === 'no' ? reasonCode : null,
      reason_text: informed === 'no' && reasonCode === 'OTHER' ? reasonText : null,
      notes: notes || null,
      critical_collectors_count: type === 'collectors' ? counts.criticalCollectors : 0,
      critical_missing_logs_count: type === 'missingLogs' ? counts.criticalMissingLogs : 0
    };
    console.log(`Submitting ${type} update:`, updateData);

    if (type === 'collectors') setShowCollectorsModal(false);
    else setShowMissingLogsModal(false);

    setEmailSubject(''); setReasonText(''); setNotes('');
    alert(`${type === 'collectors' ? 'Collectors' : 'Missing Logs'} update recorded successfully!`);
  };

  const handleStatusUpdate = async (cardType: string, subStatus: string, data: any) => {
    const updateData = {
      date: new Date().toISOString().slice(0, 10),
      category: cardType === 'device' ? 'DEVICE_STATUS' : 'WINDOWS_AGENT_STATUS',
      sub_status: subStatus.toUpperCase(),
      informed: data.informed === 'yes',
      email_subject: data.informed === 'yes' ? data.emailSubject : null,
      reason_code: data.informed === 'no' ? data.reasonCode : null,
      reason_text: data.informed === 'no' && data.reasonCode === 'OTHER' ? data.reasonText : null,
      affected_count: getAffectedCount(subStatus)
    };
    console.log(`Submitting ${subStatus} status update:`, updateData);

    setStatusUpdates(prev => ({
      ...prev,
      [subStatus]: {
        status: 'done',
        lastUpdatedBy: 'Omar Sleem',
        lastUpdatedTime: new Date().toISOString()
      }
    }));
    setExpandedCard(null);
    alert(`${subStatus} status update recorded successfully!`);
  };

  const getAffectedCount = (subStatus: string) => {
    switch (subStatus) {
      case 'disconnected': return statusCounts.windowsAgent.disconnected;
      case 'decommissioned': return statusCounts.device.decommissioned;
      case 'stopped': return statusCounts.windowsAgent.stopped;
      default: return 0;
    }
  };

  const exportAffectedItems = (subStatus: string) => {
    const items = (affectedItems as any)[subStatus] || [];
    const data = items.map((item: any) => ({
      Name: item.name, 'IP Address': item.ip, 'Last Seen': item.lastSeen ? new Date(item.lastSeen).toLocaleString() : 'N/A', Status: subStatus
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${subStatus}-items`);
    XLSX.writeFile(wb, `${subStatus}-affected-items.xlsx`);
  };

  const resetModal = () => {
    setInformed('yes'); setEmailSubject(''); setReasonCode('NO_CHANGE'); setReasonText(''); setNotes('');
  };

  const formatTime = (isoString?: string | null) =>
    isoString ? new Date(isoString).toLocaleString() : '—';

  // ---------- Small UI helpers (kept INSIDE the component) ----------
  const InfoRow = ({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) => (
    <div className="space-y-1">
      <div className="text-xs text-slate-400">{label}</div>
      {children || <div className="text-sm font-medium text-slate-100">{value || '—'}</div>}
    </div>
  );

  const KVp = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
      <dt className="text-[#A7B0C0] text-xs">{label}</dt>
      <dd className="text-[#E9EEF6] truncate">{children}</dd>
    </div>
  );

  const Copyable = ({ children }: { children: React.ReactNode }) => (
    <span className="cursor-copy hover:text-[#14D8C4] transition-colors">{children}</span>
  );

  // --------------------------- RENDER ---------------------------
  return (
    <>
      <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">

        {/* 1) COLLECTOR HEALTH STATUS */}
        <section className="bg-[#111726]/90 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Header: title + filters (left), meta + action (right) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Left: title + filters */}
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-[#E9EEF6] flex items-center">
                <Activity className="h-5 w-5 mr-2 text-[#14D8C4]" style={{ filter: 'drop-shadow(0 0 8px rgba(20, 216, 196, 0.4))' }} />
                Collector Health Status
              </h2>
              <div className="flex space-x-2">
                {(['all','healthy','warning','critical','not_connected'] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filterStatus === key
                        ? 'bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] text-white'
                        : 'bg-[#0B0F1A]/50 text-[#A7B0C0] hover:bg-[#0B0F1A]/70'
                    }`}
                  >
                    {key === 'not_connected' ? 'Not Connected' : key[0].toUpperCase()+key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: status chip + last action + Mark as Informed */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
                Pending
              </span>
              <span className="text-[#A7B0C0] text-sm whitespace-nowrap">
                Last action: Omar Hassan • 2 hours ago
              </span>
              <button
                onClick={() => { resetModal(); setShowCollectorsModal(true); }}
                className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Mark as Informed</span>
              </button>
            </div>
          </div>

          {/* Grid of square cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCollectors.map(collector => (
              <article
                key={collector.id}
                className="bg-[#0E1525] border border-white/10 rounded-2xl p-5 shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:border-[#14D8C4]/30 transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Title row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDotColors[collector.status as keyof typeof statusDotColors]}`} />
                    <div className="text-base font-semibold text-white">{collector.name}</div>
                  </div>
                  <StatusChip status={collector.status} />
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="IP Address">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-100">{collector.ip}</span>
                      <button
                        onClick={() => copyToClipboard(collector.ip)}
                        className="p-1 text-white/70 hover:text-[#14D8C4] transition-colors"
                        title="Copy IP address"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </InfoRow>
                  <InfoRow label="Status" value={
                    collector.status === 'not_connected' ? 'Not Connected' :
                    collector.status.charAt(0).toUpperCase() + collector.status.slice(1)
                  } />
                  <InfoRow label="Last Event Received" value={formatTime(collector.lastEventAt)} />
                  <InfoRow label="Last File Received" value={formatTime(collector.lastFileAt)} />
                  <InfoRow label="Last Updated Time" value={formatTime(collector.lastUpdatedAt)} />
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {filteredCollectors.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-white/70 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E9EEF6] mb-2">No collectors found</h3>
              <p className="text-[#A7B0C0]">
                {collectors.length === 0 
                  ? "No collectors configured for this client yet." 
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          )}
        </section>

        {/* 2) CRITICAL MISSING LOGS */}
        <section className="bg-[#111726]/90 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Header row with inline update controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-[#E9EEF6] flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-[#FF2D78]"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 45, 120, 0.4))' }} />
              Critical Missing Logs
            </h2>

            {/* Right cluster: pending + last action + Mark as Informed + search + export */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
                Pending
              </span>
              <span className="text-[#A7B0C0] text-sm whitespace-nowrap">
                Last action: Omar Hassan • 3 hours ago
              </span>
              <button
                onClick={() => { resetModal(); setShowMissingLogsModal(true); }}
                className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Mark as Informed</span>
              </button>

              {/* Search + Export (kept) */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
                />
                <button
                  onClick={exportToExcel}
                  className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/8">
                  <th className="py-3 pr-6 text-[#A7B0C0] font-medium">Host Name</th>
                  <th className="py-3 pr-6 text-[#A7B0C0] font-medium">IP Address</th>
                  <th className="py-3 pr-6 text-[#A7B0C0] font-medium">Criticality Flag</th>
                  <th className="py-3 pr-6 text-[#A7B0C0] font-medium">Location</th>
                  <th className="py-3 pr-6 text-[#A7B0C0] font-medium">Missing Events</th>
                  <th className="py-3 pr-6 text-[#A7B0C0] font-medium">Missing Log Types</th>
                  <th className="py-3 pr-6 text-[#A7B0C0] font-medium">Device Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissingLogs.map((log, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-[#0B0F1A]/30 transition-colors duration-200">
                    <td className="py-3 pr-6 text-[#E9EEF6] font-medium">{log.hostname}</td>
                    <td className="py-3 pr-6 text-[#E9EEF6]">{log.ip}</td>
                    <td className="py-3 pr-6 text-[#FF2D78] font-medium">{log.criticality}</td>
                    <td className="py-3 pr-6 text-[#E9EEF6]">{log.location}</td>
                    <td className="py-3 pr-6 text-[#E9EEF6] max-w-xs truncate">{log.missingEvents}</td>
                    <td className="py-3 pr-6 text-[#E9EEF6]">{log.missingTypes}</td>
                    <td className="py-3 pr-6 text-[#E9EEF6]">{log.deviceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMissingLogs.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm text-[#A7B0C0]">No critical missing logs found</p>
            </div>
          )}
        </section>

        {/* 3) STATUS OVERVIEW (moved to bottom) */}
        <section className="bg-[#111726]/90 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#E9EEF6]">Status Overview</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setUptimeRange('24h')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  uptimeRange === '24h' ? 'bg-cyan-600 text-white' : 'bg-[#0B0F1A]/50 text-[#A7B0C0] hover:bg-[#0B0F1A]/70'
                }`}
              >24h</button>
              <button
                onClick={() => setUptimeRange('7d')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  uptimeRange === '7d' ? 'bg-cyan-600 text-white' : 'bg-[#0B0F1A]/50 text-[#A7B0C0] hover:bg-[#0B0F1A]/70'
                }`}
              >7d</button>
            </div>
          </div>

          {/* Device Status */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-[1px] w-5 bg-white/15 rounded"></div>
            <div className="text-[#A7B0C0] font-medium">Device Status</div>
          </div>
          <div className="mt-3 -mx-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 mb-6">
            <div className="px-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-w-max md:min-w-0">
              <StatusKpiCard label="Approved" value={statusCounts.device.approved} tone="emerald" />
              <StatusKpiCard label="Pending" value={statusCounts.device.pending} tone="amber" />
              <StatusKpiCard
                label="Decommissioned" value={statusCounts.device.decommissioned} tone="rose"
                actionable cardKey="decommissioned"
                expandedCard={expandedCard} setExpandedCard={setExpandedCard}
                statusUpdates={statusUpdates} onStatusUpdate={handleStatusUpdate}
                affectedItems={affectedItems.decommissioned}
                onExportItems={() => exportAffectedItems('decommissioned')}
                showAffectedItems={showAffectedItems} setShowAffectedItems={setShowAffectedItems}
              />
              <StatusKpiCard label="Unmanaged" value={statusCounts.device.unmanaged} tone="slate" />
            </div>
          </div>

          {/* Windows Agent Status */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-[1px] w-5 bg-white/15 rounded"></div>
            <div className="text-[#A7B0C0] font-medium">Windows Agent Status</div>
          </div>
          <div className="mt-3 -mx-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
            <div className="px-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-w-max md:min-w-0">
              <StatusKpiCard label="Running Active" value={statusCounts.windowsAgent.runningActive} tone="emerald" />
              <StatusKpiCard label="Running Inactive" value={statusCounts.windowsAgent.runningInactive} tone="amber" />
              <StatusKpiCard label="Registered" value={statusCounts.windowsAgent.registered} tone="cyan" />
              <StatusKpiCard
                label="Disconnected" value={statusCounts.windowsAgent.disconnected} tone="violet"
                actionable cardKey="disconnected"
                expandedCard={expandedCard} setExpandedCard={setExpandedCard}
                statusUpdates={statusUpdates} onStatusUpdate={handleStatusUpdate}
                affectedItems={affectedItems.disconnected}
                onExportItems={() => exportAffectedItems('disconnected')}
                showAffectedItems={showAffectedItems} setShowAffectedItems={setShowAffectedItems}
              />
              <StatusKpiCard
                label="Stopped" value={statusCounts.windowsAgent.stopped} tone="rose"
                actionable cardKey="stopped"
                expandedCard={expandedCard} setExpandedCard={setExpandedCard}
                statusUpdates={statusUpdates} onStatusUpdate={handleStatusUpdate}
                affectedItems={affectedItems.stopped}
                onExportItems={() => exportAffectedItems('stopped')}
                showAffectedItems={showAffectedItems} setShowAffectedItems={setShowAffectedItems}
              />
            </div>
          </div>
        </section>
      </div>

      {/* COLLECTORS UPDATE MODAL (unchanged, triggered from header button) */}
      {showCollectorsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-xl font-semibold text-[#E9EEF6]">Confirm Collectors Update (Today)</h2>
              <button onClick={() => setShowCollectorsModal(false)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Yes/No */}
              <div>
                <label className="block text-sm font-medium text-[#E9EEF6] mb-3">Did you inform the client?</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="informed" checked={informed === 'yes'} onChange={() => setInformed('yes')}
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50" />
                    <span className="text-[#E9EEF6]">Yes, informed</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="informed" checked={informed === 'no'} onChange={() => setInformed('no')}
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50" />
                    <span className="text-[#E9EEF6]">Not informed</span>
                  </label>
                </div>
              </div>

              {informed === 'yes' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                      Email Subject <span className="text-[#FF2D78]">*</span>
                    </label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="DIFC – Critical Collectors (Aug 13)"
                      className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#E9EEF6] mb-2">Notes</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes or context..."
                      className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                      Reason <span className="text-[#FF2D78]">*</span>
                    </label>
                    <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}
                      className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200">
                      <option value="ON_LEAVE">On leave</option>
                      <option value="AWAITING_APPROVAL">Awaiting approval</option>
                      <option value="CLIENT_MAINTENANCE">Client maintenance window</option>
                      <option value="NO_CHANGE">No change since yesterday</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  {reasonCode === 'OTHER' && (
                    <div>
                      <label className="block text-sm font-medium text-[#E9EEF6] mb-2">Details</label>
                      <textarea rows={3} value={reasonText} onChange={(e) => setReasonText(e.target.value)}
                        placeholder="Please provide details..."
                        className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#0B0F1A]/50 rounded-xl p-4 border border-white/8">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-[#A7B0C0]">Applies to:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                    {getCriticalCounts().criticalCollectors} Critical Collectors
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-white/8">
              <button onClick={() => setShowCollectorsModal(false)}
                className="px-4 py-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors duration-200">
                Cancel
              </button>
              <button onClick={() => handleSubmitUpdate('collectors')}
                className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium">
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MISSING LOGS UPDATE MODAL (unchanged, triggered from header button) */}
      {showMissingLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-xl font-semibold text-[#E9EEF6]">Confirm Missing Logs Update (Today)</h2>
              <button onClick={() => setShowMissingLogsModal(false)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#E9EEF6] mb-3">Did you inform the client?</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="informed" checked={informed === 'yes'} onChange={() => setInformed('yes')}
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50" />
                    <span className="text-[#E9EEF6]">Yes, informed</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="informed" checked={informed === 'no'} onChange={() => setInformed('no')}
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50" />
                    <span className="text-[#E9EEF6]">Not informed</span>
                  </label>
                </div>
              </div>

              {informed === 'yes' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                      Email Subject <span className="text-[#FF2D78]">*</span>
                    </label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="DIFC – Critical Missing Logs (Aug 13)"
                      className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#E9EEF6] mb-2">Notes</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes or context..."
                      className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                      Reason <span className="text-[#FF2D78]">*</span>
                    </label>
                    <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}
                      className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200">
                      <option value="ON_LEAVE">On leave</option>
                      <option value="AWAITING_APPROVAL">Awaiting approval</option>
                      <option value="CLIENT_MAINTENANCE">Client maintenance window</option>
                      <option value="NO_CHANGE">No change since yesterday</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  {reasonCode === 'OTHER' && (
                    <div>
                      <label className="block text-sm font-medium text-[#E9EEF6] mb-2">Details</label>
                      <textarea rows={3} value={reasonText} onChange={(e) => setReasonText(e.target.value)}
                        placeholder="Please provide details..."
                        className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#0B0F1A]/50 rounded-xl p-4 border border-white/8">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-[#A7B0C0]">Applies to:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                    {getCriticalCounts().criticalMissingLogs} Critical Missing Logs
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-white/8">
              <button onClick={() => setShowMissingLogsModal(false)}
                className="px-4 py-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors duration-200">
                Cancel
              </button>
              <button onClick={() => handleSubmitUpdate('missingLogs')}
                className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium">
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Status KPI Card (unchanged)
interface StatusKpiCardProps {
  label: string;
  value: number | string;
  tone: "emerald" | "amber" | "rose" | "slate" | "cyan" | "violet";
  actionable?: boolean;
  cardKey?: string;
  expandedCard?: string | null;
  setExpandedCard?: (key: string | null) => void;
  statusUpdates?: Record<string, any>;
  onStatusUpdate?: (cardType: string, subStatus: string, data: any) => void;
  affectedItems?: any[];
  onExportItems?: () => void;
  showAffectedItems?: string | null;
  setShowAffectedItems?: (key: string | null) => void;
}

const StatusKpiCard: React.FC<StatusKpiCardProps> = ({
  label, value, tone, actionable = false, cardKey = '',
  expandedCard, setExpandedCard, statusUpdates = {}, onStatusUpdate,
  affectedItems = [], onExportItems, showAffectedItems, setShowAffectedItems
}) => {
  const [informed, setInformed] = useState<'yes' | 'no'>('yes');
  const [emailSubject, setEmailSubject] = useState('');
  const [reasonCode, setReasonCode] = useState('NO_CHANGE');
  const [reasonText, setReasonText] = useState('');

  const toneMap: Record<string, {dot:string; ring:string; text:string; border:string}> = {
    emerald: { dot:"bg-emerald-400", ring:"ring-emerald-400/30", text:"text-emerald-300", border:"border-emerald-700/30" },
    amber:   { dot:"bg-amber-400",   ring:"ring-amber-400/30",   text:"text-amber-300",   border:"border-amber-700/30" },
    rose:    { dot:"bg-rose-400",    ring:"ring-rose-400/30",    text:"text-rose-300",    border:"border-rose-700/30" },
    cyan:    { dot:"bg-cyan-400",    ring:"ring-cyan-400/30",    text:"text-cyan-300",    border:"border-cyan-700/30" },
    violet:  { dot:"bg-violet-400",  ring:"ring-violet-400/30",  text:"text-violet-300",  border:"border-violet-700/30" },
    slate:   { dot:"bg-slate-400",   ring:"ring-white/20",       text:"text-slate-300",   border:"border-white/10" },
  };
  const c = toneMap[tone];

  const isExpanded = expandedCard === cardKey;
  const update = statusUpdates[cardKey];
  const hasItems = typeof value === 'number' && value > 0;

  // Status chip styles
  const chipStyles = update?.status === 'done'
    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    : 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  const chipLabel = update?.status === 'done' ? 'Done' : 'Pending';

  const handleSave = () => {
    if (informed === 'yes' && !emailSubject.trim()) return alert('Email Subject is required.');
    if (informed === 'no' && !reasonCode) return alert('Please select a reason.');
    if (informed === 'no' && reasonCode === 'OTHER' && !reasonText.trim())
      return alert('Please provide details for "Other".');

    onStatusUpdate?.('device', cardKey, {
      informed,
      emailSubject: informed === 'yes' ? emailSubject : '',
      reasonCode: informed === 'no' ? reasonCode : '',
      reasonText: informed === 'no' && reasonCode === 'OTHER' ? reasonText : ''
    });
    setEmailSubject(''); setReasonText('');
  };

  return (
    <div className={`min-w-[140px] bg-[#0E1525] border ${c.border} rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:border-white/20 hover:ring-2 ${c.ring} transition-all duration-200 hover:scale-[1.02] flex flex-col`}>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`}></span>
          <span className="text-[#A7B0C0] text-sm font-medium">{label}</span>
        </div>
        <div className={`text-3xl font-semibold ${c.text} mb-2`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>

      {actionable && (
        <div className="border-t border-white/8 p-3">
          {/* Status and Last Action Info */}
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${chipStyles}`}>
              {chipLabel}
            </span>
            {update?.lastUpdatedTime && (
              <span className="text-[10px] text-[#A7B0C0]">
                Last action: {update.lastUpdatedBy ?? '—'} • {new Date(update.lastUpdatedTime).toLocaleTimeString()}
              </span>
            )}
          </div>

          {hasItems ? (
            <button
              onClick={() => setExpandedCard?.(isExpanded ? null : cardKey)}
              className="w-full bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-3 py-1.5 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
            >
              <Mail className="h-3 w-3" />
              <span>Mark as Informed</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          ) : (
            <button disabled className="w-full bg-[#0B0F1A]/50 text-[#A7B0C0]/50 border border-white/5 px-3 py-1.5 rounded-lg cursor-not-allowed text-xs">
              No items
            </button>
          )}

          {showAffectedItems === cardKey && (
            <div className="mt-3 bg-[#0B0F1A]/80 border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#E9EEF6]">Affected Items ({affectedItems.length})</span>
                <div className="flex space-x-1">
                  <button onClick={onExportItems}
                    className="p-1 text-[#14D8C4] hover:text-[#14D8C4]/80 hover:bg-[#14D8C4]/10 rounded transition-colors" title="Export Excel">
                    <Download className="h-3 w-3" />
                  </button>
                  <button onClick={() => setShowAffectedItems?.(null)}
                    className="p-1 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {affectedItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="text-xs text-[#A7B0C0] flex justify-between">
                    <span>{item.name}</span><span>{item.ip}</span>
                  </div>
                ))}
                {affectedItems.length > 5 && (
                  <div className="text-xs text-[#A7B0C0] text-center pt-1">+{affectedItems.length - 5} more items</div>
                )}
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="mt-3 bg-[#0B0F1A]/80 border border-white/10 rounded-lg p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#E9EEF6]">Mark as Informed</span>
                <button onClick={() => setExpandedCard?.(null)}
                  className="p-1 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E9EEF6] mb-2">Did you inform the client?</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1">
                    <input type="radio" name={`informed-${cardKey}`} checked={informed === 'yes'} onChange={() => setInformed('yes')}
                      className="w-3 h-3 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50" />
                    <span className="text-xs text-[#E9EEF6]">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="radio" name={`informed-${cardKey}`} checked={informed === 'no'} onChange={() => setInformed('no')}
                      className="w-3 h-3 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50" />
                    <span className="text-xs text-[#E9EEF6]">No</span>
                  </label>
                </div>
              </div>

              {informed === 'yes' ? (
                <div>
                  <label className="block text-xs font-medium text-[#E9EEF6] mb-2">Email Subject <span className="text-[#FF2D78]">*</span></label>
                  <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder={`DIFC – ${label} (Today)`}
                    className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-[#E9EEF6] mb-2">Reason <span className="text-[#FF2D78]">*</span></label>
                    <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}
                      className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200">
                      <option value="ON_LEAVE">On leave</option>
                      <option value="AWAITING_APPROVAL">Awaiting approval</option>
                      <option value="CLIENT_MAINTENANCE">Client maintenance window</option>
                      <option value="NO_CHANGE">No change since yesterday</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  {reasonCode === 'OTHER' && (
                    <div>
                      <label className="block text-xs font-medium text-[#E9EEF6] mb-2">Details</label>
                      <textarea rows={2} value={reasonText} onChange={(e) => setReasonText(e.target.value)}
                        placeholder="Please provide details..."
                        className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200" />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#0B0F1A]/50 rounded-lg p-2 border border-white/8">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A7B0C0]">Snapshot:</span>
                  <span className="text-[#E9EEF6]">{value} {label.toLowerCase()}</span>
                </div>
              </div>

              <button onClick={handleSave}
                className="w-full bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs">
                Save Update
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyHealthCheck;
