import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, AlertTriangle, Eye, MoreHorizontal, ChevronDown, X, CheckCircle, Clock, XCircle, Database, Server, Globe, HardDrive, Shield, Network, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Types
interface Client {
  id: string;
  label: string;
}

interface DeviceWithUnknown {
  name: string;
  ip: string;
  role: string;
  subrole: string;
  type: string;
  location: string;
  unknown_count: number;
}

interface Summary {
  devices_with_unknown: number;
  total_unknown_events: number;
  parsing_completion_pct: number;
  completed_tasks: number;
  total_tasks: number;
  last_updated: string;
}

interface TimeseriesData {
  unknown_events: Array<{ date: string; count: number }>;
  tasks_created: Array<{ date: string; count: number }>;
  tasks_completed: Array<{ date: string; count: number }>;
}

interface DevicesResponse {
  items: DeviceWithUnknown[];
  total: number;
}

type TimeframeOption = 'last_7_days' | 'last_14_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'quarter_to_date' | 'custom';

// Mock data
const mockClients: Client[] = [
  { id: 'difc', label: 'DIFC' },
  { id: 'agthia', label: 'Agthia' },
  { id: 'danagas', label: 'Dana Gas' },
  { id: 'gbm', label: 'GBM' },
  { id: 'houseofshipping', label: 'HouseOfShipping' }
];

const timeframeOptions = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_14_days', label: 'Last 14 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'quarter_to_date', label: 'Quarter to date' },
  { value: 'custom', label: 'Custom...' }
];

const mockSummaryData: Record<string, Summary> = {
  difc: {
    devices_with_unknown: 4,
    total_unknown_events: 1267,
    parsing_completion_pct: 75,
    completed_tasks: 15,
    total_tasks: 20,
    last_updated: '2025-01-17T14:09:00Z'
  },
  agthia: {
    devices_with_unknown: 2,
    total_unknown_events: 456,
    parsing_completion_pct: 90,
    completed_tasks: 18,
    total_tasks: 20,
    last_updated: '2025-01-17T13:45:00Z'
  },
  danagas: {
    devices_with_unknown: 1,
    total_unknown_events: 123,
    parsing_completion_pct: 60,
    completed_tasks: 12,
    total_tasks: 20,
    last_updated: '2025-01-17T12:30:00Z'
  },
  gbm: {
    devices_with_unknown: 0,
    total_unknown_events: 0,
    parsing_completion_pct: 100,
    completed_tasks: 20,
    total_tasks: 20,
    last_updated: '2025-01-17T11:15:00Z'
  },
  houseofshipping: {
    devices_with_unknown: 3,
    total_unknown_events: 789,
    parsing_completion_pct: 45,
    completed_tasks: 9,
    total_tasks: 20,
    last_updated: '2025-01-17T10:00:00Z'
  }
};

const mockTimeseriesData: Record<string, TimeseriesData> = {
  difc: {
    unknown_events: [
      { date: '2025-01-03', count: 220 },
      { date: '2025-01-04', count: 180 },
      { date: '2025-01-05', count: 195 },
      { date: '2025-01-06', count: 240 },
      { date: '2025-01-07', count: 160 },
      { date: '2025-01-08', count: 210 },
      { date: '2025-01-09', count: 185 },
      { date: '2025-01-10', count: 175 },
      { date: '2025-01-11', count: 190 },
      { date: '2025-01-12', count: 205 },
      { date: '2025-01-13', count: 155 },
      { date: '2025-01-14', count: 170 },
      { date: '2025-01-15', count: 145 },
      { date: '2025-01-16', count: 130 },
      { date: '2025-01-17', count: 120 }
    ],
    tasks_created: [
      { date: '2025-01-03', count: 2 },
      { date: '2025-01-05', count: 1 },
      { date: '2025-01-08', count: 3 },
      { date: '2025-01-10', count: 1 },
      { date: '2025-01-12', count: 2 },
      { date: '2025-01-15', count: 1 }
    ],
    tasks_completed: [
      { date: '2025-01-04', count: 1 },
      { date: '2025-01-07', count: 2 },
      { date: '2025-01-09', count: 1 },
      { date: '2025-01-11', count: 3 },
      { date: '2025-01-14', count: 2 },
      { date: '2025-01-16', count: 1 }
    ]
  },
  agthia: {
    unknown_events: [
      { date: '2025-01-03', count: 45 },
      { date: '2025-01-04', count: 38 },
      { date: '2025-01-05', count: 42 },
      { date: '2025-01-06', count: 35 },
      { date: '2025-01-07', count: 40 },
      { date: '2025-01-08', count: 33 },
      { date: '2025-01-09', count: 28 },
      { date: '2025-01-10', count: 25 },
      { date: '2025-01-11', count: 30 },
      { date: '2025-01-12', count: 22 },
      { date: '2025-01-13', count: 18 },
      { date: '2025-01-14', count: 15 },
      { date: '2025-01-15', count: 12 },
      { date: '2025-01-16', count: 8 },
      { date: '2025-01-17', count: 5 }
    ],
    tasks_created: [
      { date: '2025-01-03', count: 1 },
      { date: '2025-01-06', count: 2 },
      { date: '2025-01-09', count: 1 },
      { date: '2025-01-12', count: 1 }
    ],
    tasks_completed: [
      { date: '2025-01-05', count: 2 },
      { date: '2025-01-08', count: 1 },
      { date: '2025-01-11', count: 3 },
      { date: '2025-01-14', count: 2 },
      { date: '2025-01-17', count: 1 }
    ]
  }
};

const mockDevicesData: Record<string, DevicesResponse> = {
  difc: {
    items: [
      {
        name: 'Trading-Database / DIFC-Trading-System',
        ip: '192.168.1.10',
        role: 'Database',
        subrole: 'Trading',
        type: 'Server',
        location: 'prod',
        unknown_count: 534
      },
      {
        name: 'DIFC-FW01',
        ip: '192.168.1.1',
        role: 'Network',
        subrole: 'Firewall',
        type: 'Firewall',
        location: 'production',
        unknown_count: 233
      },
      {
        name: 'Trading-Portal',
        ip: '192.168.1.20',
        role: 'Application',
        subrole: 'Web Server',
        type: 'Server',
        location: 'prod',
        unknown_count: 345
      },
      {
        name: 'DIFC-DC01',
        ip: '192.168.1.5',
        role: 'Infrastructure',
        subrole: 'Domain Controller',
        type: 'Server',
        location: 'production',
        unknown_count: 155
      }
    ],
    total: 4
  },
  agthia: {
    items: [
      {
        name: 'Supply-Chain-DB',
        ip: '10.0.1.10',
        role: 'Database',
        subrole: 'Supply Chain',
        type: 'Server',
        location: 'staging',
        unknown_count: 278
      },
      {
        name: 'Supply-Portal',
        ip: '10.0.1.20',
        role: 'Application',
        subrole: 'Web Server',
        type: 'Server',
        location: 'staging',
        unknown_count: 178
      }
    ],
    total: 2
  },
  danagas: {
    items: [
      {
        name: 'Energy-Database',
        ip: '172.16.1.10',
        role: 'Database',
        subrole: 'Energy Management',
        type: 'Server',
        location: 'development',
        unknown_count: 123
      }
    ],
    total: 1
  },
  gbm: {
    items: [],
    total: 0
  },
  houseofshipping: {
    items: [
      {
        name: 'Logistics-DB',
        ip: '192.168.2.10',
        role: 'Database',
        subrole: 'Logistics',
        type: 'Server',
        location: 'production',
        unknown_count: 456
      },
      {
        name: 'Shipping-Portal',
        ip: '192.168.2.20',
        role: 'Application',
        subrole: 'Web Server',
        type: 'Server',
        location: 'production',
        unknown_count: 233
      },
      {
        name: 'HOS-DC01',
        ip: '192.168.2.5',
        role: 'Infrastructure',
        subrole: 'Domain Controller',
        type: 'Server',
        location: 'production',
        unknown_count: 100
      }
    ],
    total: 3
  }
};

const UnknownTracer: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('last_14_days');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesData | null>(null);
  const [devices, setDevices] = useState<DeviceWithUnknown[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithUnknown | null>(null);
  const [chartLegend, setChartLegend] = useState({
    unknown_events: true,
    tasks_created: false,
    tasks_completed: false
  });

  // Calculate date range based on timeframe
  const getDateRange = (timeframe: TimeframeOption) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeframe) {
      case 'last_7_days':
        return {
          from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      case 'last_14_days':
        return {
          from: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      case 'last_30_days':
        return {
          from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      case 'last_90_days':
        return {
          from: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      case 'this_month':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          from: lastMonth.toISOString().split('T')[0],
          to: lastMonthEnd.toISOString().split('T')[0]
        };
      case 'quarter_to_date':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return {
          from: quarterStart.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      case 'custom':
        return customDateRange;
      default:
        return {
          from: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
    }
  };

  // Fetch data when client or timeframe changes
  useEffect(() => {
    if (selectedClient) {
      fetchClientData(selectedClient);
    } else {
      setSummary(null);
      setTimeseries(null);
      setDevices([]);
    }
  }, [selectedClient, timeframe, customDateRange]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedClient) {
        fetchDevices();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, environmentFilter, roleFilter, typeFilter, selectedClient]);

  const fetchClientData = async (clientId: string) => {
    const dateRange = getDateRange(timeframe);
    
    // Mock API calls with date range
    setSummary(mockSummaryData[clientId] || null);
    setTimeseries(mockTimeseriesData[clientId] || null);
    fetchDevices();
  };

  const fetchDevices = () => {
    if (!selectedClient) return;
    
    const clientDevices = mockDevicesData[selectedClient]?.items || [];
    const filtered = clientDevices.filter(device => {
      const matchesSearch = !searchQuery || 
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.ip.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEnvironment = environmentFilter === 'all' || device.location === environmentFilter;
      const matchesRole = roleFilter === 'all' || device.role === roleFilter;
      const matchesType = typeFilter === 'all' || device.type === typeFilter;
      
      return matchesSearch && matchesEnvironment && matchesRole && matchesType;
    });
    
    setDevices(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (selectedClient) {
      await fetchClientData(selectedClient);
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const exportToCSV = () => {
    if (!selectedClient || devices.length === 0) return;
    
    const dateRange = getDateRange(timeframe);
    const timeframeLabel = timeframeOptions.find(opt => opt.value === timeframe)?.label || timeframe;
    
    const csvData = devices.map(device => ({
      'Client': mockClients.find(c => c.id === selectedClient)?.label || selectedClient,
      'Device Name': device.name,
      'IP Address': device.ip,
      'Role': device.role,
      'Subrole': device.subrole,
      'Type': device.type,
      'Location': device.location,
      'Unknown Events Count': device.unknown_count,
      'Timeframe': timeframeLabel,
      'From Date': dateRange.from,
      'To Date': dateRange.to
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unknown-tracer-${selectedClient}-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get unique filter values
  const getUniqueValues = (field: keyof DeviceWithUnknown) => {
    return [...new Set(devices.map(device => device[field]))].filter(Boolean);
  };

  // Prepare chart data
  const getChartData = () => {
    if (!timeseries) return [];
    
    const dates = timeseries.unknown_events.map(item => item.date);
    return dates.map(date => {
      const unknownEvent = timeseries.unknown_events.find(item => item.date === date);
      const taskCreated = timeseries.tasks_created.find(item => item.date === date);
      const taskCompleted = timeseries.tasks_completed.find(item => item.date === date);
      
      return {
        date,
        unknown_events: unknownEvent?.count || 0,
        tasks_created: taskCreated?.count || 0,
        tasks_completed: taskCompleted?.count || 0
      };
    });
  };

  const chartData = getChartData();
  const timeframeLabel = timeframeOptions.find(opt => opt.value === timeframe)?.label || 'Selected Period';

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#E9EEF6] flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3 text-[#14D8C4]" />
            Unknown Tracer
          </h1>
          <p className="text-[#A7B0C0] mt-2">Track devices with unknown events and parsing progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !selectedClient}
            className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            disabled={!selectedClient || devices.length === 0}
            className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Client Selector and Timeframe */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-[#E9EEF6] whitespace-nowrap">Client:</label>
            <div className="relative">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="appearance-none bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-4 py-2 pr-10 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200 min-w-[200px]"
              >
                <option value="">Select client...</option>
                {mockClients.map(client => (
                  <option key={client.id} value={client.id} className="bg-[#111726] text-white">
                    {client.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A7B0C0] pointer-events-none" />
            </div>

            <label className="text-sm font-medium text-[#E9EEF6] whitespace-nowrap">Timeframe:</label>
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as TimeframeOption)}
                disabled={!selectedClient}
                className="appearance-none bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-4 py-2 pr-10 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200 min-w-[160px] disabled:opacity-50"
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#111726] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A7B0C0] pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <input
              type="text"
              placeholder="Search by name, FQDN, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedClient}
              className="w-full pl-10 pr-4 py-3 bg-[#0B0F1A]/50 border border-white/8 rounded-2xl text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <select
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              disabled={!selectedClient}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] text-sm focus:ring-2 focus:ring-[#14D8C4]/50 disabled:opacity-50"
            >
              <option value="all">All Environments</option>
              {getUniqueValues('location').map(env => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              disabled={!selectedClient}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] text-sm focus:ring-2 focus:ring-[#14D8C4]/50 disabled:opacity-50"
            >
              <option value="all">All Roles</option>
              {getUniqueValues('role').map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              disabled={!selectedClient}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] text-sm focus:ring-2 focus:ring-[#14D8C4]/50 disabled:opacity-50"
            >
              <option value="all">All Types</option>
              {getUniqueValues('type').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {timeframe === 'custom' && (
          <div className="mt-4 pt-4 border-t border-white/8">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-[#E9EEF6]">Custom Range:</label>
              <input
                type="date"
                value={customDateRange.from}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50"
              />
              <span className="text-[#A7B0C0]">to</span>
              <input
                type="date"
                value={customDateRange.to}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!selectedClient && (
        <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <AlertTriangle className="h-16 w-16 text-[#14D8C4] mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-[#E9EEF6] mb-2">Pick a client to trace unknowns</h3>
          <p className="text-[#A7B0C0]">Select a client from the dropdown above to view their devices with unknown events and parsing progress.</p>
        </div>
      )}

      {/* Content when client is selected */}
      {selectedClient && summary && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A7B0C0]">Devices with Unknown Events</p>
                  <p className="text-2xl font-bold text-[#E9EEF6]">{summary.devices_with_unknown}</p>
                </div>
                <Server className="h-8 w-8 text-amber-400" />
              </div>
            </div>

            <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A7B0C0]">Total Unknown Events</p>
                  <p className="text-2xl font-bold text-[#E9EEF6]">{summary.total_unknown_events.toLocaleString()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>

            <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A7B0C0]">Parsing Completion</p>
                  <p className="text-2xl font-bold text-[#E9EEF6]">{summary.parsing_completion_pct}%</p>
                  <p className="text-xs text-[#A7B0C0] mt-1">{summary.completed_tasks} of {summary.total_tasks} tasks</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-600">
                    <div 
                      className="w-12 h-12 rounded-full border-4 border-[#14D8C4] border-t-transparent"
                      style={{
                        background: `conic-gradient(#14D8C4 ${summary.parsing_completion_pct * 3.6}deg, transparent 0deg)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A7B0C0]">Last Updated</p>
                  <p className="text-sm font-bold text-[#E9EEF6]">{new Date(summary.last_updated).toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#E9EEF6]">Parsing Progress Timeline</h2>
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as TimeframeOption)}
                  disabled={!selectedClient}
                  className="appearance-none bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-4 py-2 pr-10 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200 disabled:opacity-50"
                >
                  {timeframeOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-[#111726] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A7B0C0] pointer-events-none" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-[#A7B0C0] mb-2">
                <span>Overall Progress — {summary.completed_tasks} of {summary.total_tasks} tasks in period</span>
                <span>{summary.parsing_completion_pct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] transition-all duration-1000 ease-out"
                  style={{ width: `${summary.parsing_completion_pct}%` }}
                ></div>
              </div>
              {summary.total_tasks === 0 && (
                <p className="text-xs text-[#A7B0C0] mt-2">No parsing tasks in this period.</p>
              )}
            </div>

            {/* Chart */}
            <div className="h-64">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[#E9EEF6]">Unknown Events Trend ({timeframeLabel})</h3>
                
                {/* Chart Legend */}
                <div className="flex items-center space-x-4 text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={chartLegend.unknown_events}
                      onChange={(e) => setChartLegend(prev => ({ ...prev, unknown_events: e.target.checked }))}
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 rounded focus:ring-[#14D8C4]/50"
                    />
                    <span className="text-[#14D8C4]">Unknown Events</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={chartLegend.tasks_created}
                      onChange={(e) => setChartLegend(prev => ({ ...prev, tasks_created: e.target.checked }))}
                      className="w-4 h-4 text-[#7C4DFF] bg-[#0B0F1A] border-white/20 rounded focus:ring-[#7C4DFF]/50"
                    />
                    <span className="text-[#7C4DFF]">Tasks Created</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={chartLegend.tasks_completed}
                      onChange={(e) => setChartLegend(prev => ({ ...prev, tasks_completed: e.target.checked }))}
                      className="w-4 h-4 text-emerald-400 bg-[#0B0F1A] border-white/20 rounded focus:ring-emerald-400/50"
                    />
                    <span className="text-emerald-400">Tasks Completed</span>
                  </label>
                </div>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111726', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '8px',
                        color: '#E9EEF6'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    
                    {chartLegend.unknown_events && (
                      <Area 
                        type="monotone" 
                        dataKey="unknown_events" 
                        stroke="#14D8C4" 
                        fill="url(#unknownGradient)" 
                        strokeWidth={2}
                        name="Unknown Events"
                      />
                    )}
                    
                    {chartLegend.tasks_created && (
                      <Area 
                        type="monotone" 
                        dataKey="tasks_created" 
                        stroke="#7C4DFF" 
                        fill="url(#tasksCreatedGradient)" 
                        strokeWidth={2}
                        name="Tasks Created"
                      />
                    )}
                    
                    {chartLegend.tasks_completed && (
                      <Area 
                        type="monotone" 
                        dataKey="tasks_completed" 
                        stroke="#10B981" 
                        fill="url(#tasksCompletedGradient)" 
                        strokeWidth={2}
                        name="Tasks Completed"
                      />
                    )}
                    
                    <defs>
                      <linearGradient id="unknownGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14D8C4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14D8C4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="tasksCreatedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="tasksCompletedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-[#A7B0C0] mx-auto mb-4" />
                    <p className="text-[#A7B0C0]">No activity in this period.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Devices Table */}
          <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#E9EEF6] mb-6">
                Devices with Unknown Events ({devices.length})
              </h2>

              {devices.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[280px]" />   {/* Device Name */}
                      <col className="w-[140px]" />   {/* Device IP */}
                      <col className="w-[120px]" />   {/* Device Role */}
                      <col className="w-[140px]" />   {/* Device Subrole */}
                      <col className="w-[100px]" />   {/* Device Type */}
                      <col className="w-[120px]" />   {/* Location */}
                      <col className="w-[140px]" />   {/* Unknown Events Count */}
                      <col className="w-[120px]" />   {/* Actions */}
                    </colgroup>
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Device Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Device IP</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Device Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Device Subrole</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Device Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Unknown Events</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices
                        .sort((a, b) => b.unknown_count - a.unknown_count)
                        .map((device, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-[#0B0F1A]/30 transition-colors duration-200">
                          <td className="py-3 px-4 text-sm text-[#E9EEF6] font-medium">
                            <div className="truncate" title={device.name}>
                              {device.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-[#A7B0C0] font-mono">
                            {device.ip}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                            {device.role}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                            {device.subrole}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                            {device.type}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                            {device.location}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              {device.unknown_count.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedDevice(device)}
                                className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                title="View device details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-white/5 rounded transition-colors"
                                title="More actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#E9EEF6] mb-2">No devices with unknown events</h3>
                  <p className="text-[#A7B0C0]">All events are being parsed successfully for this client in the selected timeframe.</p>
                  <button className="mt-4 text-[#14D8C4] hover:text-[#14D8C4]/80 underline">
                    View All Devices
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-xl font-semibold text-[#E9EEF6]">Device Details</h2>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Device Name</label>
                  <p className="text-[#E9EEF6]">{selectedDevice.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">IP Address</label>
                  <p className="text-[#E9EEF6] font-mono">{selectedDevice.ip}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Role</label>
                  <p className="text-[#E9EEF6]">{selectedDevice.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Subrole</label>
                  <p className="text-[#E9EEF6]">{selectedDevice.subrole}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Type</label>
                  <p className="text-[#E9EEF6]">{selectedDevice.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Location</label>
                  <p className="text-[#E9EEF6]">{selectedDevice.location}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Unknown Events Count</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  {selectedDevice.unknown_count.toLocaleString()} events in {timeframeLabel.toLowerCase()}
                </span>
              </div>

              <div className="pt-4 border-t border-white/8">
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200">
                    View Raw Events
                  </button>
                  <button className="bg-[#7C4DFF]/20 text-[#7C4DFF] border border-[#7C4DFF]/30 px-4 py-2 rounded-lg hover:bg-[#7C4DFF]/30 transition-colors duration-200">
                    Assign Owner
                  </button>
                  <button className="bg-[#F4A814]/20 text-[#F4A814] border border-[#F4A814]/30 px-4 py-2 rounded-lg hover:bg-[#F4A814]/30 transition-colors duration-200">
                    Mark as Parsing
                  </button>
                  <button className="bg-[#2EA8FF]/20 text-[#2EA8FF] border border-[#2EA8FF]/30 px-4 py-2 rounded-lg hover:bg-[#2EA8FF]/30 transition-colors duration-200">
                    Open in CMDB
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnknownTracer;