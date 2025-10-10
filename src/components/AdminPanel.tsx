import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Eye, MessageSquare, Filter, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AdminPanelData, DailyUpdateTicket } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

// Mock data for demonstration
const mockAdminData: AdminPanelData[] = [
  {
    client_id: 'difc',
    client_name: 'X',
    collectors_status: 'DONE',
    missing_logs_status: 'PENDING',
    engineer_name: 'Omar Sleem',
    last_update_time: '2025-01-17T14:30:00Z',
    collectors_ticket: {
      id: 'ticket-1',
      client_id: 'difc',
      client_name: 'X',
      date: '2025-01-17',
      category: 'COLLECTORS',
      informed: true,
      email_subject: 'DIFC – Critical Collectors (Jan 17)',
      engineer_name: 'Omar Sleem',
      engineer_id: 'omar.sleem',
      affected_count: 1,
      snapshot_ids: ['coll-risk'],
      created_at: '2025-01-17T14:30:00Z',
      updated_at: '2025-01-17T14:30:00Z'
    }
  },
  {
    client_id: 'agthia',
    client_name: 'Y',
    collectors_status: 'NOT_INFORMED',
    missing_logs_status: 'DONE',
    engineer_name: 'Khalid Ahmed',
    last_update_time: '2025-01-17T13:15:00Z',
    missing_logs_ticket: {
      id: 'ticket-2',
      client_id: 'agthia',
      client_name: 'Y',
      date: '2025-01-17',
      category: 'MISSING_LOGS',
      informed: false,
      reason_code: 'CLIENT_MAINTENANCE',
      engineer_name: 'Khalid Ahmed',
      engineer_id: 'khalid.ahmed',
      affected_count: 3,
      snapshot_ids: ['log-1', 'log-2', 'log-3'],
      created_at: '2025-01-17T13:15:00Z',
      updated_at: '2025-01-17T13:15:00Z'
    }
  },
  {
    client_id: 'yas',
    client_name: 'Yas Holding',
    collectors_status: 'PENDING',
    missing_logs_status: 'PENDING',
    engineer_name: 'Sara Ibrahim',
    last_update_time: undefined
  }
];

const statusConfig = {
  DONE: { 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
    icon: CheckCircle, 
    label: 'Done' 
  },
  PENDING: { 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', 
    icon: Clock, 
    label: 'Pending' 
  },
  NOT_INFORMED: { 
    color: 'bg-red-500/10 text-red-400 border-red-500/20', 
    icon: XCircle, 
    label: 'Not Informed' 
  }
};

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [data, setData] = useState<AdminPanelData[]>(mockAdminData);
  const [selectedTicket, setSelectedTicket] = useState<DailyUpdateTicket | null>(null);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: 'all',
    status: 'all',
    client: 'all',
    engineer: 'all'
  });

  const cutoffTime = '16:00'; // 4 PM cutoff
  const currentTime = new Date();
  const cutoffDateTime = new Date();
  cutoffDateTime.setHours(16, 0, 0, 0);

  const filteredData = data.filter(item => {
    if (filters.client !== 'all' && item.client_id !== filters.client) return false;
    if (filters.engineer !== 'all' && item.engineer_name !== filters.engineer) return false;
    if (filters.category !== 'all') {
      if (filters.category === 'COLLECTORS' && item.collectors_status === 'PENDING') return true;
      if (filters.category === 'MISSING_LOGS' && item.missing_logs_status === 'PENDING') return true;
      return false;
    }
    if (filters.status !== 'all') {
      return item.collectors_status === filters.status || item.missing_logs_status === filters.status;
    }
    return true;
  });

  const getOverallStatus = (item: AdminPanelData) => {
    if (item.collectors_status === 'PENDING' || item.missing_logs_status === 'PENDING') {
      return currentTime > cutoffDateTime ? 'OVERDUE' : 'PENDING';
    }
    if (item.collectors_status === 'NOT_INFORMED' || item.missing_logs_status === 'NOT_INFORMED') {
      return 'NOT_INFORMED';
    }
    return 'DONE';
  };

  const exportToCSV = () => {
    const csvData = filteredData.map(item => ({
      'Client': item.client_name,
      'Collectors Status': item.collectors_status,
      'Missing Logs Status': item.missing_logs_status,
      'Engineer': item.engineer_name,
      'Last Update': item.last_update_time ? new Date(item.last_update_time).toLocaleString() : 'Never',
      'Overall Status': getOverallStatus(item)
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-updates-${filters.date}.csv`;
    a.click();
  };

  const sendNudge = (clientName: string, engineerName: string) => {
    // In real app, this would send a Slack/email notification
    alert(`Nudge sent to ${engineerName} for ${clientName} updates`);
  };

  const StatusChip: React.FC<{ status: keyof typeof statusConfig }> = ({ status }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative">
      {/* Hero gradient overlay */}
      <div className="fixed inset-0 bg-gradient-radial from-[#FF2D78]/8 via-[#7C4DFF]/4 to-[#2EA8FF]/4 pointer-events-none" />
      
      {/* Header */}
      <header className="bg-[#111726]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sticky top-0 z-50 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-[#E9EEF6]">Daily Updates Admin Panel</h1>
                <p className="text-[#A7B0C0]">Track client communication confirmations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-[#A7B0C0]">
                SLA Cutoff: <span className="text-[#E9EEF6] font-medium">{cutoffTime}</span>
              </div>
              <button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8">
        {/* Filters */}
        <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 mb-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-white/70" />
              <span className="text-[#E9EEF6] font-medium">Filters:</span>
            </div>
            
            <select
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50"
            >
              <option value={new Date().toISOString().slice(0, 10)}>Today</option>
              <option value={new Date(Date.now() - 86400000).toISOString().slice(0, 10)}>Yesterday</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50"
            >
              <option value="all">All Categories</option>
              <option value="COLLECTORS">Collectors Only</option>
              <option value="MISSING_LOGS">Missing Logs Only</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50"
            >
              <option value="all">All Statuses</option>
              <option value="DONE">Done</option>
              <option value="PENDING">Pending</option>
              <option value="NOT_INFORMED">Not Informed</option>
            </select>
          </div>
        </div>

        {/* Overview Table */}
        <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#E9EEF6] mb-6">Today's Overview</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Collectors Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Missing Logs Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Engineer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Last Update</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => {
                    const overallStatus = getOverallStatus(item);
                    const isOverdue = overallStatus === 'OVERDUE';
                    
                    return (
                      <tr 
                        key={item.client_id} 
                        className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200 ${
                          isOverdue ? 'bg-red-500/5 border-red-500/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-white font-medium">
                          <div className="flex items-center space-x-2">
                            {isOverdue && <AlertTriangle className="h-4 w-4 text-red-400" />}
                            {item.client_name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <StatusChip status={item.collectors_status} />
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <StatusChip status={item.missing_logs_status} />
                        </td>
                        <td className="py-3 px-4 text-sm text-white">{item.engineer_name}</td>
                        <td className="py-3 px-4 text-sm text-slate-300">
                          {item.last_update_time 
                            ? new Date(item.last_update_time).toLocaleTimeString()
                            : 'Never'
                          }
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center space-x-2">
                            {(item.collectors_ticket || item.missing_logs_ticket) && (
                              <button
                                onClick={() => setSelectedTicket(item.collectors_ticket || item.missing_logs_ticket!)}
                                className="p-1 text-[#14D8C4] hover:text-[#14D8C4]/80 hover:bg-[#14D8C4]/10 rounded transition-colors"
                                title="View Ticket"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {(item.collectors_status === 'PENDING' || item.missing_logs_status === 'PENDING') && (
                              <button
                                onClick={() => sendNudge(item.client_name, item.engineer_name)}
                                className="p-1 text-[#F4A814] hover:text-[#F4A814]/80 hover:bg-[#F4A814]/10 rounded transition-colors"
                                title="Send Nudge"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-xl font-semibold text-[#E9EEF6]">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Client</label>
                  <p className="text-[#E9EEF6]">{selectedTicket.client_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Category</label>
                  <p className="text-[#E9EEF6]">{selectedTicket.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Date</label>
                  <p className="text-[#E9EEF6]">{selectedTicket.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Engineer</label>
                  <p className="text-[#E9EEF6]">{selectedTicket.engineer_name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Client Informed</label>
                <p className={`text-sm font-medium ${selectedTicket.informed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedTicket.informed ? 'Yes' : 'No'}
                </p>
              </div>

              {selectedTicket.informed && selectedTicket.email_subject && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Email Subject</label>
                  <p className="text-[#E9EEF6]">{selectedTicket.email_subject}</p>
                </div>
              )}

              {!selectedTicket.informed && selectedTicket.reason_code && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Reason</label>
                  <p className="text-[#E9EEF6]">{selectedTicket.reason_code.replace('_', ' ')}</p>
                  {selectedTicket.reason_text && (
                    <p className="text-[#A7B0C0] text-sm mt-1">{selectedTicket.reason_text}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Affected Items</label>
                <p className="text-[#E9EEF6]">{selectedTicket.affected_count} items</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Created</label>
                  <p className="text-[#E9EEF6]">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Updated</label>
                  <p className="text-[#E9EEF6]">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;