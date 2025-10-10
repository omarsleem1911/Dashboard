import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, XCircle, Clock, AlertTriangle, Server, FileText, Search as SearchIcon, ClipboardList, X, Plus, Edit, Eye, Calendar, User, Filter } from 'lucide-react';

// Types
interface Occurrence {
  id: string;
  initiativeId: string;
  period: string; // "2025-09" for monthly, "2025-Q3" for quarterly
  startDate: string; // ISO date
  status: 'upcoming' | 'pending' | 'delivered' | 'missed' | 'na';
  deliveredAt?: string;
}

interface Ticket {
  id: string;
  occurrenceId: string;
  initiativeId: string;
  period: string;
  date: string;
  delivered: boolean;
  reason?: string;
  newDate?: string;
  deliveredNow?: boolean;
  currentStatus?: 'Pending' | 'Blocked' | 'In Progress' | 'Deferred';
  // Assets Clean Up
  missingAttrBefore?: number;
  missingAttrAfter?: number;
  // Missing Logs
  missingLogsBefore?: number;
  missingLogsAfter?: number;
  // Manual Health Check
  updatedCount?: number;
  notUpdatedCount?: number;
  // Asset List Review
  notOnboardedBefore?: number;
  notOnboardedAfter?: number;
  createdAt: string;
  updatedAt: string;
}

interface Initiative {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: 'emerald' | 'amber' | 'cyan' | 'violet';
  cadence: 'monthly' | 'quarterly';
  progress: number;
}

// Mock data
const initiatives: Initiative[] = [
  {
    id: 'assets-cleanup',
    name: 'Assets Clean Up',
    icon: Server,
    color: 'emerald',
    cadence: 'monthly',
    progress: 0
  },
  {
    id: 'missing-logs',
    name: 'Missing Logs',
    icon: FileText,
    color: 'amber',
    cadence: 'monthly',
    progress: 0
  },
  {
    id: 'manual-health-check',
    name: 'Manual Health Check',
    icon: SearchIcon,
    color: 'cyan',
    cadence: 'quarterly',
    progress: 0
  },
  {
    id: 'asset-list-review',
    name: 'Asset List Review',
    icon: ClipboardList,
    color: 'violet',
    cadence: 'quarterly',
    progress: 0
  }
];

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', progress: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', progress: 'bg-amber-500' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', progress: 'bg-cyan-500' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', progress: 'bg-violet-500' }
};

const PeriodicInitiatives: React.FC = () => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [hoveredOccurrence, setHoveredOccurrence] = useState<Occurrence | null>(null);
  const [ticketFilters, setTicketFilters] = useState<Record<string, {
    period: string;
    status: string;
    dateRange: string;
  }>>({
    'assets-cleanup': { period: 'all', status: 'all', dateRange: 'all' },
    'missing-logs': { period: 'all', status: 'all', dateRange: 'all' },
    'manual-health-check': { period: 'all', status: 'all', dateRange: 'all' },
    'asset-list-review': { period: 'all', status: 'all', dateRange: 'all' }
  });

  // Generate occurrences for the current year
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const generatedOccurrences: Occurrence[] = [];

    initiatives.forEach(initiative => {
      if (initiative.cadence === 'monthly') {
        // Generate monthly occurrences
        for (let month = 1; month <= 12; month++) {
          const startDate = new Date(currentYear, month - 1, 1);
          const period = `${currentYear}-${month.toString().padStart(2, '0')}`;
          const now = new Date();
          
          let status: Occurrence['status'] = 'upcoming';
          if (startDate <= now) {
            const endOfMonth = new Date(currentYear, month, 0);
            if (now > endOfMonth) {
              status = 'missed';
            } else {
              status = 'pending';
            }
          }

          // Check for overlap rule: Asset List Review suppresses Assets Clean Up
          if (initiative.id === 'assets-cleanup') {
            const quarterlyOccurrence = getQuarterlyOccurrenceForMonth(month, currentYear);
            if (quarterlyOccurrence) {
              status = 'na';
            }
          }

          generatedOccurrences.push({
            id: `${initiative.id}-${period}`,
            initiativeId: initiative.id,
            period,
            startDate: startDate.toISOString(),
            status
          });
        }
      } else if (initiative.cadence === 'quarterly') {
        // Generate quarterly occurrences
        const quarters = [
          { q: 'Q1', month: 0 }, // January
          { q: 'Q2', month: 3 }, // April
          { q: 'Q3', month: 6 }, // July
          { q: 'Q4', month: 9 }  // October
        ];

        quarters.forEach(({ q, month }) => {
          const startDate = new Date(currentYear, month, 1);
          const period = `${currentYear}-${q}`;
          const now = new Date();
          
          let status: Occurrence['status'] = 'upcoming';
          if (startDate <= now) {
            const endOfQuarter = new Date(currentYear, month + 3, 0);
            if (now > endOfQuarter) {
              status = 'missed';
            } else {
              status = 'pending';
            }
          }

          generatedOccurrences.push({
            id: `${initiative.id}-${period}`,
            initiativeId: initiative.id,
            period,
            startDate: startDate.toISOString(),
            status
          });
        });
      }
    });

    setOccurrences(generatedOccurrences);
  }, []);

  // Helper function to check if a month has a quarterly occurrence
  const getQuarterlyOccurrenceForMonth = (month: number, year: number) => {
    const quarterlyMonths = [1, 4, 7, 10]; // Jan, Apr, Jul, Oct
    return quarterlyMonths.includes(month) ? `${year}-Q${Math.ceil(month / 3)}` : null;
  };

  // Calculate progress for each initiative
  const getInitiativeProgress = (initiativeId: string) => {
    const initiativeOccurrences = occurrences.filter(o => o.initiativeId === initiativeId && o.status !== 'na');
    const deliveredCount = initiativeOccurrences.filter(o => o.status === 'delivered').length;
    const totalCount = initiativeOccurrences.length;
    return totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0;
  };

  // Get countdown to next occurrence
  const getCountdown = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `Starts in ${days}d ${hours}h`;
  };

  // Get periods for timeline header
  const getTimelinePeriods = () => {
    const currentYear = new Date().getFullYear();
    const periods = [];
    
    // Add monthly periods
    for (let month = 1; month <= 12; month++) {
      periods.push({
        label: new Date(currentYear, month - 1, 1).toLocaleDateString('en-US', { month: 'short' }),
        value: `${currentYear}-${month.toString().padStart(2, '0')}`,
        type: 'month'
      });
    }
    
    return periods;
  };

  // Handle occurrence click
  const handleOccurrenceClick = (occurrence: Occurrence) => {
    if (occurrence.status === 'na') return; // Disabled for N/A occurrences
    
    setSelectedOccurrence(occurrence);
    setShowTicketForm(true);
  };

  // Handle ticket form submit
  const handleTicketSubmit = (ticketData: Partial<Ticket>) => {
    if (!selectedOccurrence) return;

    const existingTicket = tickets.find(t => t.occurrenceId === selectedOccurrence.id);
    const now = new Date().toISOString();

    if (existingTicket) {
      // Update existing ticket
      const updatedTicket: Ticket = {
        ...existingTicket,
        ...ticketData,
        updatedAt: now
      };
      setTickets(prev => prev.map(t => t.id === existingTicket.id ? updatedTicket : t));
    } else {
      // Create new ticket
      const newTicket: Ticket = {
        id: `ticket-${selectedOccurrence.initiativeId}-${Date.now()}`,
        occurrenceId: selectedOccurrence.id,
        initiativeId: selectedOccurrence.initiativeId,
        period: selectedOccurrence.period,
        date: selectedOccurrence.startDate,
        delivered: false,
        ...ticketData,
        createdAt: now,
        updatedAt: now
      };
      setTickets(prev => [...prev, newTicket]);
    }

    // Update occurrence status if delivered
    if (ticketData.delivered || ticketData.deliveredNow) {
      setOccurrences(prev => prev.map(o => 
        o.id === selectedOccurrence.id 
          ? { ...o, status: 'delivered', deliveredAt: now }
          : o
      ));
    }

    setShowTicketForm(false);
    setSelectedOccurrence(null);
  };

  // Get summary stats
  const getSummaryStats = () => {
    const validOccurrences = occurrences.filter(o => o.status !== 'na' && o.status !== 'upcoming');
    const totalDelivered = validOccurrences.filter(o => o.status === 'delivered').length;
    const totalPending = validOccurrences.filter(o => o.status === 'pending').length;
    const totalMissed = validOccurrences.filter(o => o.status === 'missed').length;
    const totalScheduled = validOccurrences.length;
    const overallProgress = totalScheduled > 0 ? Math.round((totalDelivered / totalScheduled) * 100) : 0;

    return { totalDelivered, totalPending, totalMissed, overallProgress };
  };

  const stats = getSummaryStats();
  const timelinePeriods = getTimelinePeriods();

  // Filter tickets for a specific initiative
  const getFilteredTickets = (initiativeId: string) => {
    const filters = ticketFilters[initiativeId];
    return tickets.filter(ticket => {
      if (ticket.initiativeId !== initiativeId) return false;
      if (filters.period !== 'all' && ticket.period !== filters.period) return false;
      if (filters.status !== 'all') {
        if (filters.status === 'delivered' && !ticket.delivered) return false;
        if (filters.status === 'not-delivered' && ticket.delivered) return false;
      }
      return true;
    });
  };

  // Get metric pair display for different initiatives
  const getMetricPair = (ticket: Ticket) => {
    switch (ticket.initiativeId) {
      case 'assets-cleanup':
        return ticket.missingAttrBefore !== undefined && ticket.missingAttrAfter !== undefined
          ? `${ticket.missingAttrBefore} → ${ticket.missingAttrAfter}`
          : '—';
      case 'missing-logs':
        return ticket.missingLogsBefore !== undefined && ticket.missingLogsAfter !== undefined
          ? `${ticket.missingLogsBefore} → ${ticket.missingLogsAfter}`
          : '—';
      case 'manual-health-check':
        return ticket.updatedCount !== undefined && ticket.notUpdatedCount !== undefined
          ? `${ticket.updatedCount} / ${ticket.notUpdatedCount}`
          : '—';
      case 'asset-list-review':
        return ticket.notOnboardedBefore !== undefined && ticket.notOnboardedAfter !== undefined
          ? `${ticket.notOnboardedBefore} → ${ticket.notOnboardedAfter}`
          : '—';
      default:
        return '—';
    }
  };

  // Get metric label for different initiatives
  const getMetricLabel = (initiativeId: string) => {
    switch (initiativeId) {
      case 'assets-cleanup':
        return 'Missing Attr';
      case 'missing-logs':
        return 'Missing Logs';
      case 'manual-health-check':
        return 'Updated / Not Updated';
      case 'asset-list-review':
        return 'Not Onboarded';
      default:
        return 'Metric';
    }
  };

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Initiatives Timeline Card */}
      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-12"></div>
            <h2 className="text-xl font-semibold text-white mx-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#14D8C4]" style={{ filter: 'drop-shadow(0 0 8px rgba(20, 216, 196, 0.4))' }} />
              Initiatives Timeline
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="w-48"></div>
            {timelinePeriods.map((period) => (
              <div key={period.value} className="flex-1 text-center">
                <div className="text-sm font-medium text-slate-300">{period.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-6 mb-8">
          {initiatives.map((initiative) => {
            const Icon = initiative.icon;
            const colors = colorMap[initiative.color];
            const progress = getInitiativeProgress(initiative.id);
            const initiativeOccurrences = occurrences.filter(o => o.initiativeId === initiative.id);
            
            return (
              <div key={initiative.id} className="relative">
                {/* Initiative Info */}
                <div className="flex items-center mb-3">
                  <div className="w-48 flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                      <Icon className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    <div>
                      <div className={`font-medium ${colors.text}`} style={{ whiteSpace: 'nowrap' }}>
                        {initiative.name}
                      </div>
                      <div className="text-xs text-slate-400 mb-1">{initiative.cadence}</div>
                      <div className="w-32 bg-slate-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors.progress} transition-all duration-1000 ease-out`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{progress}% complete</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 flex justify-between items-center relative">
                    {/* Background line */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-0.5 bg-slate-700/50"></div>
                    </div>

                    {timelinePeriods.map((period) => {
                      const occurrence = initiativeOccurrences.find(o => {
                        if (initiative.cadence === 'monthly') {
                          return o.period === period.value;
                        } else {
                          // For quarterly, match the quarter
                          const month = parseInt(period.value.split('-')[1]);
                          if (month === 1) return o.period.endsWith('-Q1');
                          if (month === 4) return o.period.endsWith('-Q2');
                          if (month === 7) return o.period.endsWith('-Q3');
                          if (month === 10) return o.period.endsWith('-Q4');
                          return false;
                        }
                      });
                      
                      return (
                        <div key={period.value} className="flex-1 flex justify-center relative">
                          {occurrence ? (
                            <div
                              className={`relative z-10 transform transition-transform duration-200 ${
                                occurrence.status === 'na' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                              }`}
                              onClick={() => handleOccurrenceClick(occurrence)}
                              onMouseEnter={() => setHoveredOccurrence(occurrence)}
                              onMouseLeave={() => setHoveredOccurrence(null)}
                              data-occurrence-id={occurrence.id}
                            >
                              {occurrence.status === 'delivered' && (
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                              )}
                              {occurrence.status === 'pending' && (
                                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Clock className="h-4 w-4 text-white" />
                                </div>
                              )}
                              {occurrence.status === 'missed' && (
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                  <XCircle className="h-4 w-4 text-white" />
                                </div>
                              )}
                              {occurrence.status === 'upcoming' && (
                                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center shadow-lg opacity-50">
                                  <Clock className="h-4 w-4 text-white" />
                                </div>
                              )}
                              {occurrence.status === 'na' && (
                                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center shadow-lg opacity-30 relative">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-0.5 bg-slate-400 rotate-45"></div>
                                    <div className="w-4 h-0.5 bg-slate-400 -rotate-45 absolute"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Ticket indicator */}
                              {tickets.some(t => t.occurrenceId === occurrence.id) && occurrence.status !== 'na' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <FileText className="h-2 w-2 text-white" />
                                </div>
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
              <div className="text-2xl font-bold text-red-300">{stats.totalMissed}</div>
            </div>
            
            <div className="bg-[#0E1525] border border-cyan-700/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Overall Progress</span>
              </div>
              <div className="text-2xl font-bold text-cyan-300">{stats.overallProgress}%</div>
            </div>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredOccurrence && (
          <div className="fixed z-50 bg-[#111726] border border-white/20 rounded-lg p-4 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
               style={{ 
                 left: '50%', 
                 top: '50%',
                 maxWidth: '300px'
               }}>
            <div className="text-sm font-medium text-white mb-2">
              {initiatives.find(i => i.id === hoveredOccurrence.initiativeId)?.name}
            </div>
            <div className="text-xs text-slate-300 mb-2">
              Period: {hoveredOccurrence.period}
            </div>
            <div className="text-xs text-slate-400">
              <div>Status: {hoveredOccurrence.status}</div>
              <div>Start: {new Date(hoveredOccurrence.startDate).toLocaleDateString()}</div>
              {hoveredOccurrence.status === 'upcoming' && (
                <div className="text-amber-400">{getCountdown(hoveredOccurrence.startDate)}</div>
              )}
              {hoveredOccurrence.status === 'na' && (
                <div className="text-slate-400">Included in Asset List Review this period</div>
              )}
              {tickets.find(t => t.occurrenceId === hoveredOccurrence.id) && (
                <div className="text-blue-400 mt-1">
                  Ticket: {tickets.find(t => t.occurrenceId === hoveredOccurrence.id)?.delivered ? 'Delivered' : 'Not Delivered'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tickets Cards for each initiative */}
      {initiatives.map(initiative => {
        const initiativeTickets = getFilteredTickets(initiative.id);
        const hasTickets = tickets.some(t => t.initiativeId === initiative.id);
        
        if (!hasTickets) return null;

        const Icon = initiative.icon;
        const colors = colorMap[initiative.color];

        return (
          <div key={`tickets-${initiative.id}`} className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Icon className={`h-5 w-5 mr-2 ${colors.text}`} />
                {initiative.name} — Tickets
              </h2>
              
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={ticketFilters[initiative.id].period}
                  onChange={(e) => setTicketFilters(prev => ({
                    ...prev,
                    [initiative.id]: { ...prev[initiative.id], period: e.target.value }
                  }))}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="all">All Periods</option>
                  {timelinePeriods.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
                
                <select
                  value={ticketFilters[initiative.id].status}
                  onChange={(e) => setTicketFilters(prev => ({
                    ...prev,
                    [initiative.id]: { ...prev[initiative.id], status: e.target.value }
                  }))}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="delivered">Delivered</option>
                  <option value="not-delivered">Not Delivered</option>
                </select>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Period</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Delivered?</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">New Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Current Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{getMetricLabel(initiative.id)}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created At</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Updated At</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initiativeTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200">
                      <td className="py-3 px-4 text-sm text-white font-medium">{ticket.period}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          ticket.delivered 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {ticket.delivered ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300 max-w-xs truncate">
                        {ticket.reason || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {ticket.newDate ? new Date(ticket.newDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {ticket.currentStatus || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {getMetricPair(ticket)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const occurrence = occurrences.find(o => o.id === ticket.occurrenceId);
                              if (occurrence) {
                                setSelectedOccurrence(occurrence);
                                setShowTicketForm(true);
                              }
                            }}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                            title="Edit ticket"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const element = document.querySelector(`[data-occurrence-id="${ticket.occurrenceId}"]`);
                              element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="p-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors"
                            title="Link to occurrence"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {initiativeTickets.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No tickets yet. Click a checkpoint to create one.</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Ticket Form Modal */}
      {showTicketForm && selectedOccurrence && (
        <TicketFormModal
          occurrence={selectedOccurrence}
          existingTicket={tickets.find(t => t.occurrenceId === selectedOccurrence.id)}
          onSubmit={handleTicketSubmit}
          onClose={() => {
            setShowTicketForm(false);
            setSelectedOccurrence(null);
          }}
        />
      )}
    </div>
  );
};

// Ticket Form Modal Component
// Ticket Form Modal Component (UPDATED)
interface TicketFormModalProps {
  occurrence: Occurrence;
  existingTicket?: Ticket;
  onSubmit: (ticketData: Partial<Ticket>) => void;
  onClose: () => void;
}

const TicketFormModal: React.FC<TicketFormModalProps> = ({ occurrence, existingTicket, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    delivered: existingTicket?.delivered ?? false,
    reason: existingTicket?.reason ?? '',
    newDate: existingTicket?.newDate ?? '',
    deliveredNow: false,
    currentStatus: (existingTicket?.currentStatus ?? 'Pending') as 'Pending' | 'Blocked' | 'In Progress' | 'Deferred',
    // Assets Clean Up
    missingAttrBefore: existingTicket?.missingAttrBefore ?? 0,
    missingAttrAfter: existingTicket?.missingAttrAfter ?? 0,
    // Missing Logs
    missingLogsBefore: existingTicket?.missingLogsBefore ?? 0,
    missingLogsAfter: existingTicket?.missingLogsAfter ?? 0,
    // Manual Health Check
    updatedCount: existingTicket?.updatedCount ?? 0,
    notUpdatedCount: existingTicket?.notUpdatedCount ?? 0,
    // Asset List Review
    notOnboardedBefore: existingTicket?.notOnboardedBefore ?? 0,
    notOnboardedAfter: existingTicket?.notOnboardedAfter ?? 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isInt = (v: any) => Number.isInteger(v) && v >= 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Conditional (only when NOT delivered)
    if (!formData.delivered) {
      if (!formData.reason.trim()) newErrors.reason = 'Reason is required when not delivered';
      if (!formData.currentStatus) newErrors.currentStatus = 'Current status is required';
      if (formData.newDate && new Date(formData.newDate) < new Date(occurrence.startDate)) {
        newErrors.newDate = 'New date must be after start date';
      }
    }

    // Always-required numeric metrics (regardless of Delivered)
    switch (occurrence.initiativeId) {
      case 'assets-cleanup': {
        const b = formData.missingAttrBefore;
        const a = formData.missingAttrAfter;
        if (!isInt(b)) newErrors.missingAttrBefore = 'Enter a non-negative integer';
        if (!isInt(a)) newErrors.missingAttrAfter = 'Enter a non-negative integer';
        if (isInt(b) && isInt(a) && a > b) newErrors.missingAttrAfter = 'After cannot exceed Before';
        break;
      }
      case 'missing-logs': {
        const b = formData.missingLogsBefore;
        const a = formData.missingLogsAfter;
        if (!isInt(b)) newErrors.missingLogsBefore = 'Enter a non-negative integer';
        if (!isInt(a)) newErrors.missingLogsAfter = 'Enter a non-negative integer';
        if (isInt(b) && isInt(a) && a > b) newErrors.missingLogsAfter = 'After cannot exceed Before';
        break;
      }
      case 'manual-health-check': {
        const u = formData.updatedCount;
        const n = formData.notUpdatedCount;
        if (!isInt(u)) newErrors.updatedCount = 'Enter a non-negative integer';
        if (!isInt(n)) newErrors.notUpdatedCount = 'Enter a non-negative integer';
        break;
      }
      case 'asset-list-review': {
        const b = formData.notOnboardedBefore;
        const a = formData.notOnboardedAfter;
        if (!isInt(b)) newErrors.notOnboardedBefore = 'Enter a non-negative integer';
        if (!isInt(a)) newErrors.notOnboardedAfter = 'Enter a non-negative integer';
        if (isInt(b) && isInt(a) && a > b) newErrors.notOnboardedAfter = 'After cannot exceed Before';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const ticketData: Partial<Ticket> = {
      delivered: formData.delivered || formData.deliveredNow,
      // only these are conditional
      ...(formData.delivered || formData.deliveredNow
        ? {}
        : {
            reason: formData.reason,
            newDate: formData.newDate || undefined,
            currentStatus: formData.currentStatus
          }),
      deliveredNow: formData.deliveredNow
    };

    // ALWAYS include numeric metrics, regardless of delivered status
    switch (occurrence.initiativeId) {
      case 'assets-cleanup':
        ticketData.missingAttrBefore = formData.missingAttrBefore;
        ticketData.missingAttrAfter = formData.missingAttrAfter;
        break;
      case 'missing-logs':
        ticketData.missingLogsBefore = formData.missingLogsBefore;
        ticketData.missingLogsAfter = formData.missingLogsAfter;
        break;
      case 'manual-health-check':
        ticketData.updatedCount = formData.updatedCount;
        ticketData.notUpdatedCount = formData.notUpdatedCount;
        break;
      case 'asset-list-review':
        ticketData.notOnboardedBefore = formData.notOnboardedBefore;
        ticketData.notOnboardedAfter = formData.notOnboardedAfter;
        break;
    }

    onSubmit(ticketData);
  };

  const initiativeName = initiatives.find(i => i.id === occurrence.initiativeId)?.name || '';

  // Always render numeric section; keep “reason/new date/status” conditional
  const renderNumericFields = () => {
    const numberInput = (value: number, onChange: (n: number) => void, errorKey?: string) => (
      <>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(Number.isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
          className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
            errorKey && errors[errorKey] ? 'border-red-500/50' : 'border-white/8'
          }`}
        />
        {errorKey && errors[errorKey] && <p className="text-red-400 text-xs mt-1">{errors[errorKey]}</p>}
      </>
    );

    switch (occurrence.initiativeId) {
      case 'assets-cleanup':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Missing Attributes Before <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.missingAttrBefore, n => setFormData(p => ({ ...p, missingAttrBefore: n })), 'missingAttrBefore')}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Missing Attributes After <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.missingAttrAfter, n => setFormData(p => ({ ...p, missingAttrAfter: n })), 'missingAttrAfter')}
            </div>
          </div>
        );
      case 'missing-logs':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Missing Logs Before <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.missingLogsBefore, n => setFormData(p => ({ ...p, missingLogsBefore: n })), 'missingLogsBefore')}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Missing Logs After <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.missingLogsAfter, n => setFormData(p => ({ ...p, missingLogsAfter: n })), 'missingLogsAfter')}
            </div>
          </div>
        );
      case 'manual-health-check':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Last Log Updated <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.updatedCount, n => setFormData(p => ({ ...p, updatedCount: n })), 'updatedCount')}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Last Log Not Updated <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.notUpdatedCount, n => setFormData(p => ({ ...p, notUpdatedCount: n })), 'notUpdatedCount')}
            </div>
          </div>
        );
      case 'asset-list-review':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Not Onboarded Before <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.notOnboardedBefore, n => setFormData(p => ({ ...p, notOnboardedBefore: n })), 'notOnboardedBefore')}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                No. Not Onboarded After <span className="text-[#FF2D78]">*</span>
              </label>
              {numberInput(formData.notOnboardedAfter, n => setFormData(p => ({ ...p, notOnboardedAfter: n })), 'notOnboardedAfter')}
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <h2 className="text-xl font-semibold text-[#E9EEF6]">
            {initiativeName} — Ticket for {occurrence.period}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Read-only pills */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20">
              Initiative: {initiativeName}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20">
              Period: {occurrence.period}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20">
              Start: {new Date(occurrence.startDate).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20">
              ID: {occurrence.id}
            </span>
          </div>

          {/* Date field */}
          <div>
            <label className="block text-sm font-medium text-[#E9EEF6] mb-2">Date</label>
            <input
              type="date"
              value={new Date(occurrence.startDate).toISOString().split('T')[0]}
              readOnly
              className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#A7B0C0] cursor-not-allowed"
            />
          </div>

          {/* Delivered */}
          <div>
            <label className="block text-sm font-medium text-[#E9EEF6] mb-3">
              Delivered? <span className="text-[#FF2D78]">*</span>
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="delivered"
                  checked={formData.delivered === true}
                  onChange={() => setFormData(prev => ({ ...prev, delivered: true }))}
                  className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50"
                />
                <span className="text-[#E9EEF6]">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="delivered"
                  checked={formData.delivered === false}
                  onChange={() => setFormData(prev => ({ ...prev, delivered: false }))}
                  className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50"
                />
                <span className="text-[#E9EEF6]">No</span>
              </label>
            </div>
          </div>

          {/* CONDITIONAL (only when NOT delivered): reason/new date/status/delivered now */}
          {!formData.delivered && (
            <div className="space-y-4 p-4 bg-[#0B0F1A]/30 rounded-lg border border-white/5">
              <div>
                <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                  Reason <span className="text-[#FF2D78]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                    errors.reason ? 'border-red-500/50' : 'border-white/8'
                  }`}
                  placeholder="Explain why not delivered..."
                />
                {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E9EEF6] mb-2">New Date</label>
                <input
                  type="date"
                  value={formData.newDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, newDate: e.target.value }))}
                  className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                    errors.newDate ? 'border-red-500/50' : 'border-white/8'
                  }`}
                />
                {errors.newDate && <p className="text-red-400 text-xs mt-1">{errors.newDate}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveredNow}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveredNow: e.target.checked }))}
                    className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 rounded focus:ring-[#14D8C4]/50"
                  />
                  <span className="text-[#E9EEF6]">Delivered Now?</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                  Current Status <span className="text-[#FF2D78]">*</span>
                </label>
                <select
                  value={formData.currentStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value as any }))}
                  className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                    errors.currentStatus ? 'border-red-500/50' : 'border-white/8'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Blocked">Blocked</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Deferred">Deferred</option>
                </select>
                {errors.currentStatus && <p className="text-red-400 text-xs mt-1">{errors.currentStatus}</p>}
              </div>
            </div>
          )}

          {/* ALWAYS-REQUIRED NUMERIC SECTION */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-[#E9EEF6]">Progress Metrics</div>
            {renderNumericFields()}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              {existingTicket ? 'Update Ticket' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default PeriodicInitiatives