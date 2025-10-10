import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Search, Filter, Eye, MoreHorizontal, ChevronDown, X, CheckCircle, AlertTriangle, Clock, XCircle, Database, Server, Globe, HardDrive, Shield } from 'lucide-react';

// Types
type AssetKind = 'database' | 'domain_controller' | 'web_server' | 'file_server' | 'firewall';

interface QuestionnaireAsset {
  id: string;
  kind: AssetKind;
  name: string;
  fqdn?: string;
  ip?: string;
  environment?: 'prod' | 'staging' | 'dev' | 'dr' | string;
  owner?: string;
  metadata?: Record<string, any>;
  submittedAt: string;
}

interface CMDBAsset {
  id: string;
  kind: AssetKind;
  name: string;
  fqdn?: string;
  ip?: string;
  environment?: string;
  owner?: string;
  lastSeenAt?: string;
  metadata?: Record<string, any>;
  sourceUrl?: string;
}

type ComparatorStatus = 'match' | 'missing_in_cmdb' | 'missing_in_questionnaire' | 'conflict';

interface ComparatorRow {
  status: ComparatorStatus;
  kind: AssetKind;
  questionnaire?: QuestionnaireAsset | null;
  cmdb?: CMDBAsset | null;
  normalized: {
    key: string;
    name?: string;
    fqdn?: string;
    ip?: string;
    environment?: string;
  };
  diffs?: Array<{ field: string; questionnaire?: any; cmdb?: any }>;
}

interface Client {
  id: number;
  name: string;
}

// Mock clients data
const mockClients: Client[] = [
  { id: 1, name: 'DIFC' },
  { id: 2, name: 'Agthia' },
  { id: 3, name: 'Dana Gas' },
  { id: 4, name: 'GBM' },
  { id: 5, name: 'HouseOfShipping' }
];

// Mock data for different clients
const mockQuestionnaireAssets: Record<number, QuestionnaireAsset[]> = {
  1: [ // DIFC
    {
      id: 'q1',
      kind: 'database',
      name: 'Trading-Database',
      fqdn: 'trading-db.difc.ae',
      ip: '192.168.1.10',
      environment: 'production',
      owner: 'Database Team',
      submittedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'q2',
      kind: 'web_server',
      name: 'Trading-Portal',
      fqdn: 'portal.difc.ae',
      ip: '192.168.1.20',
      environment: 'prod',
      owner: 'Web Team',
      submittedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'q3',
      kind: 'domain_controller',
      name: 'DIFC-DC01',
      fqdn: 'dc01.difc.local',
      ip: '192.168.1.5',
      environment: 'production',
      owner: 'IT Team',
      submittedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'q4',
      kind: 'firewall',
      name: 'DIFC-FW01',
      ip: '192.168.1.1',
      environment: 'production',
      owner: 'Security Team',
      submittedAt: '2025-01-15T10:00:00Z'
    }
  ],
  2: [ // Agthia
    {
      id: 'q5',
      kind: 'database',
      name: 'Supply-Chain-DB',
      fqdn: 'supply-db.agthia.com',
      ip: '10.0.1.10',
      environment: 'staging',
      owner: 'Database Team',
      submittedAt: '2025-01-14T10:00:00Z'
    },
    {
      id: 'q6',
      kind: 'web_server',
      name: 'Supply-Portal',
      fqdn: 'supply.agthia.com',
      ip: '10.0.1.20',
      environment: 'staging',
      owner: 'Development Team',
      submittedAt: '2025-01-14T10:00:00Z'
    },
    {
      id: 'q7',
      kind: 'file_server',
      name: 'Agthia-Files',
      fqdn: 'files.agthia.com',
      ip: '10.0.1.30',
      environment: 'staging',
      owner: 'IT Operations',
      submittedAt: '2025-01-14T10:00:00Z'
    }
  ],
  3: [ // Dana Gas
    {
      id: 'q8',
      kind: 'database',
      name: 'Energy-Database',
      fqdn: 'energy-db.danagas.com',
      ip: '172.16.1.10',
      environment: 'development',
      owner: 'Data Team',
      submittedAt: '2025-01-13T10:00:00Z'
    },
    {
      id: 'q9',
      kind: 'web_server',
      name: 'Energy-Portal',
      fqdn: 'energy.danagas.com',
      ip: '172.16.1.20',
      environment: 'development',
      owner: 'Dev Team',
      submittedAt: '2025-01-13T10:00:00Z'
    },
    {
      id: 'q10',
      kind: 'domain_controller',
      name: 'DANA-DC01',
      fqdn: 'dc01.danagas.local',
      ip: '172.16.1.5',
      environment: 'development',
      owner: 'Infrastructure',
      submittedAt: '2025-01-13T10:00:00Z'
    },
    {
      id: 'q11',
      kind: 'firewall',
      name: 'Dana-Firewall',
      ip: '172.16.1.1',
      environment: 'development',
      owner: 'Security',
      submittedAt: '2025-01-13T10:00:00Z'
    }
  ],
  4: [ // GBM
    {
      id: 'q12',
      kind: 'web_server',
      name: 'GBM-Portal',
      fqdn: 'portal.gbm.ae',
      ip: '10.1.1.20',
      environment: 'dev',
      owner: 'Development',
      submittedAt: '2025-01-12T10:00:00Z'
    },
    {
      id: 'q13',
      kind: 'database',
      name: 'GBM-Database',
      fqdn: 'db.gbm.ae',
      ip: '10.1.1.10',
      environment: 'dev',
      owner: 'Database Team',
      submittedAt: '2025-01-12T10:00:00Z'
    }
  ],
  5: [ // HouseOfShipping
    {
      id: 'q14',
      kind: 'database',
      name: 'Logistics-DB',
      fqdn: 'logistics-db.houseofshipping.ae',
      ip: '192.168.2.10',
      environment: 'production',
      owner: 'Database Team',
      submittedAt: '2025-01-11T10:00:00Z'
    },
    {
      id: 'q15',
      kind: 'web_server',
      name: 'Shipping-Portal',
      fqdn: 'portal.houseofshipping.ae',
      ip: '192.168.2.20',
      environment: 'production',
      owner: 'Web Team',
      submittedAt: '2025-01-11T10:00:00Z'
    },
    {
      id: 'q16',
      kind: 'domain_controller',
      name: 'HOS-DC01',
      fqdn: 'dc01.houseofshipping.local',
      ip: '192.168.2.5',
      environment: 'production',
      owner: 'IT Team',
      submittedAt: '2025-01-11T10:00:00Z'
    }
  ]
};

const mockCMDBAssets: Record<number, CMDBAsset[]> = {
  1: [ // DIFC
    {
      id: 'c1',
      kind: 'database',
      name: 'DIFC-Trading-System',
      fqdn: 'trading-db.difc.ae',
      ip: '192.168.1.10',
      environment: 'prod',
      owner: 'DB Team',
      lastSeenAt: '2025-01-16T08:00:00Z'
    },
    {
      id: 'c2',
      kind: 'web_server',
      name: 'DIFC-Financial-Gateway',
      fqdn: 'portal.difc.ae',
      ip: '192.168.1.20',
      environment: 'production',
      owner: 'Application Team',
      lastSeenAt: '2025-01-16T08:00:00Z'
    },
    {
      id: 'c3',
      kind: 'domain_controller',
      name: 'DIFC-DC01',
      fqdn: 'dc01.difc.local',
      ip: '192.168.1.5',
      environment: 'production',
      owner: 'IT Team',
      lastSeenAt: '2025-01-16T08:00:00Z'
    }
  ],
  2: [ // Agthia
    {
      id: 'c4',
      kind: 'database',
      name: 'Agthia-Supply-Database',
      fqdn: 'supply-db.agthia.com',
      ip: '10.0.1.10',
      environment: 'staging',
      owner: 'Data Team',
      lastSeenAt: '2025-01-15T08:00:00Z'
    },
    {
      id: 'c5',
      kind: 'web_server',
      name: 'Supply-Portal',
      fqdn: 'supply.agthia.com',
      ip: '10.0.1.20',
      environment: 'staging',
      owner: 'Development Team',
      lastSeenAt: '2025-01-15T08:00:00Z'
    },
    {
      id: 'c6',
      kind: 'domain_controller',
      name: 'AGTHIA-DC01',
      fqdn: 'dc01.agthia.local',
      ip: '10.0.1.5',
      environment: 'staging',
      owner: 'Infrastructure Team',
      lastSeenAt: '2025-01-15T08:00:00Z'
    }
  ],
  3: [ // Dana Gas
    {
      id: 'c7',
      kind: 'database',
      name: 'Energy-Database',
      fqdn: 'energy-db.danagas.com',
      ip: '172.16.1.10',
      environment: 'development',
      owner: 'Data Team',
      lastSeenAt: '2025-01-14T08:00:00Z'
    },
    {
      id: 'c8',
      kind: 'web_server',
      name: 'Energy-Management-Portal',
      fqdn: 'energy.danagas.com',
      ip: '172.16.1.20',
      environment: 'dev',
      owner: 'Development Team',
      lastSeenAt: '2025-01-14T08:00:00Z'
    }
  ],
  4: [ // GBM
    {
      id: 'c9',
      kind: 'domain_controller',
      name: 'GBM-DC01',
      fqdn: 'dc01.gbm.local',
      ip: '10.1.1.5',
      environment: 'dev',
      owner: 'IT Team',
      lastSeenAt: '2025-01-13T08:00:00Z'
    },
    {
      id: 'c10',
      kind: 'firewall',
      name: 'GBM-Firewall',
      ip: '10.1.1.1',
      environment: 'dev',
      owner: 'Security Team',
      lastSeenAt: '2025-01-13T08:00:00Z'
    }
  ],
  5: [ // HouseOfShipping
    {
      id: 'c11',
      kind: 'database',
      name: 'Logistics-DB',
      fqdn: 'logistics-db.houseofshipping.ae',
      ip: '192.168.2.10',
      environment: 'production',
      owner: 'Database Team',
      lastSeenAt: '2025-01-12T08:00:00Z'
    },
    {
      id: 'c12',
      kind: 'web_server',
      name: 'Shipping-Portal',
      fqdn: 'portal.houseofshipping.ae',
      ip: '192.168.2.20',
      environment: 'production',
      owner: 'Web Team',
      lastSeenAt: '2025-01-12T08:00:00Z'
    },
    {
      id: 'c13',
      kind: 'domain_controller',
      name: 'HOS-DC01',
      fqdn: 'dc01.houseofshipping.local',
      ip: '192.168.2.5',
      environment: 'production',
      owner: 'IT Team',
      lastSeenAt: '2025-01-12T08:00:00Z'
    }
  ]
};

const AssetComparator: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<AssetKind | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComparatorStatus | 'all'>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAsset, setSelectedAsset] = useState<ComparatorRow | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Asset categories with icons
  const assetCategories = [
    { id: 'database' as AssetKind, label: 'Databases', icon: Database },
    { id: 'domain_controller' as AssetKind, label: 'Domain Controllers', icon: Server },
    { id: 'web_server' as AssetKind, label: 'Web Servers', icon: Globe },
    { id: 'file_server' as AssetKind, label: 'File Servers', icon: HardDrive },
    { id: 'firewall' as AssetKind, label: 'Firewalls', icon: Shield }
  ];

  // Normalize asset name for comparison
  const normalizeAssetName = (name: string): string => {
    return name.toLowerCase()
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b(srv|server|prod|production|dev|development|stg|staging)\b/g, '')
      .trim();
  };

  // Generate comparison data
  const generateComparatorRows = (): ComparatorRow[] => {
    const questionnaireAssets = mockQuestionnaireAssets[selectedClient] || [];
    const cmdbAssets = mockCMDBAssets[selectedClient] || [];
    const rows: ComparatorRow[] = [];
    const processedCMDBIds = new Set<string>();

    // Process questionnaire assets
    questionnaireAssets.forEach(qAsset => {
      // Find matching CMDB asset by IP first, then by normalized name
      const matchingCMDB = cmdbAssets.find(cAsset => 
        cAsset.kind === qAsset.kind && (
          (qAsset.ip && cAsset.ip && qAsset.ip === cAsset.ip) ||
          (qAsset.fqdn && cAsset.fqdn && qAsset.fqdn.toLowerCase() === cAsset.fqdn.toLowerCase()) ||
          (normalizeAssetName(qAsset.name) === normalizeAssetName(cAsset.name))
        )
      );

      if (matchingCMDB) {
        processedCMDBIds.add(matchingCMDB.id);
        
        // Check for conflicts (same IP but different names)
        const hasNameConflict = qAsset.ip && matchingCMDB.ip && 
          qAsset.ip === matchingCMDB.ip && 
          normalizeAssetName(qAsset.name) !== normalizeAssetName(matchingCMDB.name);

        // Check for other field differences
        const diffs: Array<{ field: string; questionnaire?: any; cmdb?: any }> = [];
        
        if (hasNameConflict) {
          diffs.push({
            field: 'name',
            questionnaire: qAsset.name,
            cmdb: matchingCMDB.name
          });
        }

        // Normalize environments for comparison
        const normalizeEnv = (env?: string) => {
          if (!env) return '';
          return env.toLowerCase().replace(/production/g, 'prod').replace(/development/g, 'dev');
        };

        if (normalizeEnv(qAsset.environment) !== normalizeEnv(matchingCMDB.environment)) {
          diffs.push({
            field: 'environment',
            questionnaire: qAsset.environment,
            cmdb: matchingCMDB.environment
          });
        }

        if (qAsset.owner?.toLowerCase() !== matchingCMDB.owner?.toLowerCase()) {
          diffs.push({
            field: 'owner',
            questionnaire: qAsset.owner,
            cmdb: matchingCMDB.owner
          });
        }

        rows.push({
          status: diffs.length > 0 ? 'conflict' : 'match',
          kind: qAsset.kind,
          questionnaire: qAsset,
          cmdb: matchingCMDB,
          normalized: {
            key: qAsset.ip || qAsset.fqdn || qAsset.name,
            name: qAsset.name,
            fqdn: qAsset.fqdn,
            ip: qAsset.ip,
            environment: qAsset.environment
          },
          diffs: diffs.length > 0 ? diffs : undefined
        });
      } else {
        rows.push({
          status: 'missing_in_cmdb',
          kind: qAsset.kind,
          questionnaire: qAsset,
          cmdb: null,
          normalized: {
            key: qAsset.ip || qAsset.fqdn || qAsset.name,
            name: qAsset.name,
            fqdn: qAsset.fqdn,
            ip: qAsset.ip,
            environment: qAsset.environment
          }
        });
      }
    });

    // Process remaining CMDB assets
    cmdbAssets.forEach(cAsset => {
      if (!processedCMDBIds.has(cAsset.id)) {
        rows.push({
          status: 'missing_in_questionnaire',
          kind: cAsset.kind,
          questionnaire: null,
          cmdb: cAsset,
          normalized: {
            key: cAsset.ip || cAsset.fqdn || cAsset.name,
            name: cAsset.name,
            fqdn: cAsset.fqdn,
            ip: cAsset.ip,
            environment: cAsset.environment
          }
        });
      }
    });

    return rows;
  };

  const comparatorRows = generateComparatorRows();

  // Filter rows
  const filteredRows = comparatorRows.filter(row => {
    if (selectedCategory !== 'all' && row.kind !== selectedCategory) return false;
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    if (environmentFilter !== 'all' && row.normalized.environment !== environmentFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        row.normalized.name,
        row.normalized.fqdn,
        row.normalized.ip,
        row.questionnaire?.name,
        row.cmdb?.name
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }
    
    return true;
  });

  // Calculate summary stats
  const summaryStats = {
    matched: comparatorRows.filter(r => r.status === 'match').length,
    missingInCMDB: comparatorRows.filter(r => r.status === 'missing_in_cmdb').length,
    missingInQuestionnaire: comparatorRows.filter(r => r.status === 'missing_in_questionnaire').length,
    conflicts: comparatorRows.filter(r => r.status === 'conflict').length
  };

  // Get issue counts per category
  const getCategoryIssues = (kind: AssetKind) => {
    return comparatorRows.filter(r => 
      r.kind === kind && (r.status === 'missing_in_cmdb' || r.status === 'missing_in_questionnaire' || r.status === 'conflict')
    ).length;
  };

  // Status configuration
  const statusConfig = {
    match: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle, label: 'Match' },
    missing_in_cmdb: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertTriangle, label: 'Missing in CMDB' },
    missing_in_questionnaire: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock, label: 'Missing in Questionnaire' },
    conflict: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, label: 'Conflict' }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Handle export
  const handleExport = () => {
    const selectedClientName = mockClients.find(c => c.id === selectedClient)?.name || 'Unknown';
    const csvData = filteredRows.map(row => ({
      'Client': selectedClientName,
      'Status': statusConfig[row.status].label,
      'Asset Type': row.kind.replace('_', ' '),
      'Name (Questionnaire)': row.questionnaire?.name || '',
      'Name (CMDB)': row.cmdb?.name || '',
      'FQDN': row.normalized.fqdn || '',
      'IP': row.normalized.ip || '',
      'Environment': row.normalized.environment || '',
      'Owner (Questionnaire)': row.questionnaire?.owner || '',
      'Owner (CMDB)': row.cmdb?.owner || '',
      'Last Seen': row.cmdb?.lastSeenAt ? new Date(row.cmdb.lastSeenAt).toLocaleDateString() : '',
      'Submitted': row.questionnaire?.submittedAt ? new Date(row.questionnaire.submittedAt).toLocaleDateString() : ''
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-comparison-${selectedClientName.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedClientName = mockClients.find(c => c.id === selectedClient)?.name || 'Unknown Client';

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#E9EEF6]">Asset Comparator</h1>
          <p className="text-[#A7B0C0] mt-2">
            Compare questionnaire submissions with CMDB records for{' '}
            <span className="text-[#14D8C4] font-medium">{selectedClientName}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Client Selector */}
          <div className="relative">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(Number(e.target.value))}
              className="appearance-none bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-4 py-2 pr-10 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            >
              {mockClients.map(client => (
                <option key={client.id} value={client.id} className="bg-[#111726] text-white">
                  {client.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A7B0C0] pointer-events-none" />
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A7B0C0]">Matched</p>
              <p className="text-2xl font-bold text-emerald-400">{summaryStats.matched}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A7B0C0]">Missing in CMDB</p>
              <p className="text-2xl font-bold text-amber-400">{summaryStats.missingInCMDB}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A7B0C0]">Missing in Questionnaire</p>
              <p className="text-2xl font-bold text-blue-400">{summaryStats.missingInQuestionnaire}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A7B0C0]">Conflicts</p>
              <p className="text-2xl font-bold text-red-400">{summaryStats.conflicts}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30'
                : 'text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-white/5'
            }`}
          >
            All Categories
            <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
              {comparatorRows.length}
            </span>
          </button>
          
          {assetCategories.map(category => {
            const Icon = category.icon;
            const issueCount = getCategoryIssues(category.id);
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30'
                    : 'text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
                {issueCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {issueCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <input
              type="text"
              placeholder="Search by name, FQDN, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0B0F1A]/50 border border-white/8 rounded-2xl text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-white/70" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ComparatorStatus | 'all')}
                className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="match">Match</option>
                <option value="missing_in_cmdb">Missing in CMDB</option>
                <option value="missing_in_questionnaire">Missing in Questionnaire</option>
                <option value="conflict">Conflict</option>
              </select>
            </div>

            <select
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="prod">Prod</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="dev">Dev</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#E9EEF6]">Comparison Results ({filteredRows.length})</h2>
            {selectedRows.size > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#A7B0C0]">{selectedRows.size} selected</span>
                <button className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-3 py-1 rounded-lg hover:bg-[#14D8C4]/30 transition-colors text-sm">
                  Create CMDB Records
                </button>
                <button className="bg-[#7C4DFF]/20 text-[#7C4DFF] border border-[#7C4DFF]/30 px-3 py-1 rounded-lg hover:bg-[#7C4DFF]/30 transition-colors text-sm">
                  Mark as Expected
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 rounded focus:ring-[#14D8C4]/50"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">FQDN</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">IP</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Environment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => {
                  const StatusIcon = statusConfig[row.status].icon;
                  const displayName = row.status === 'conflict' && row.questionnaire && row.cmdb
                    ? `${row.questionnaire.name} / ${row.cmdb.name}`
                    : row.normalized.name;
                  
                  return (
                    <tr key={index} className="border-b border-white/5 hover:bg-[#0B0F1A]/30 transition-colors duration-200">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 rounded focus:ring-[#14D8C4]/50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[row.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[row.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#E9EEF6] font-medium">{displayName}</td>
                      <td className="py-3 px-4 text-sm text-[#A7B0C0] font-mono">{row.normalized.fqdn || '—'}</td>
                      <td className="py-3 px-4 text-sm text-[#A7B0C0] font-mono">{row.normalized.ip || '—'}</td>
                      <td className="py-3 px-4 text-sm text-[#A7B0C0]">{row.normalized.environment || '—'}</td>
                      <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                        {row.questionnaire?.owner || row.cmdb?.owner || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          {row.questionnaire && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Q
                            </span>
                          )}
                          {row.cmdb && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                              C
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedAsset(row)}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                            title="View details"
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E9EEF6] mb-2">No differences found</h3>
              <p className="text-[#A7B0C0]">Everything's in sync! All assets match between sources.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Drawer */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="w-full max-w-2xl h-full bg-[#111726]/95 backdrop-blur-md border-l border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col">
            <div className="p-6 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#E9EEF6]">Asset Details</h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto space-y-6">
              {/* Unified View */}
              <div>
                <h4 className="text-sm font-medium text-[#E9EEF6] mb-4">Unified Asset View</h4>
                <div className="bg-[#0B0F1A]/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#A7B0C0]">Name:</span>
                    <span className="text-[#E9EEF6]">{selectedAsset.normalized.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B0C0]">Type:</span>
                    <span className="text-[#E9EEF6]">{selectedAsset.kind.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B0C0]">FQDN:</span>
                    <span className="text-[#E9EEF6] font-mono">{selectedAsset.normalized.fqdn || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B0C0]">IP:</span>
                    <span className="text-[#E9EEF6] font-mono">{selectedAsset.normalized.ip || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B0C0]">Environment:</span>
                    <span className="text-[#E9EEF6]">{selectedAsset.normalized.environment || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Field-by-Field Diff */}
              {selectedAsset.diffs && selectedAsset.diffs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[#E9EEF6] mb-4">Field Differences</h4>
                  <div className="space-y-3">
                    {selectedAsset.diffs.map((diff, index) => (
                      <div key={index} className="bg-[#0B0F1A]/50 rounded-lg p-4">
                        <div className="text-sm font-medium text-[#E9EEF6] mb-2 capitalize">
                          {diff.field}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-[#A7B0C0] mb-1">Questionnaire</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[#E9EEF6]">{diff.questionnaire || '—'}</span>
                              {diff.questionnaire !== diff.cmdb && (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-[#A7B0C0] mb-1">CMDB</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[#E9EEF6]">{diff.cmdb || '—'}</span>
                              {diff.questionnaire !== diff.cmdb && (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedAsset.questionnaire && (
                  <div>
                    <h4 className="text-sm font-medium text-[#E9EEF6] mb-4">Questionnaire Source</h4>
                    <div className="bg-blue-500/10 rounded-lg p-4 space-y-2">
                      <div className="text-xs text-blue-400">Submitted: {new Date(selectedAsset.questionnaire.submittedAt).toLocaleString()}</div>
                      <div className="text-sm text-[#E9EEF6]">Owner: {selectedAsset.questionnaire.owner || '—'}</div>
                    </div>
                  </div>
                )}

                {selectedAsset.cmdb && (
                  <div>
                    <h4 className="text-sm font-medium text-[#E9EEF6] mb-4">CMDB Source</h4>
                    <div className="bg-green-500/10 rounded-lg p-4 space-y-2">
                      <div className="text-xs text-green-400">Last Seen: {selectedAsset.cmdb.lastSeenAt ? new Date(selectedAsset.cmdb.lastSeenAt).toLocaleString() : '—'}</div>
                      <div className="text-sm text-[#E9EEF6]">Owner: {selectedAsset.cmdb.owner || '—'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetComparator;