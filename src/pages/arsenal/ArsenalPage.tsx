import React, { useState } from 'react';
import { Upload, Download, Search, Filter, Terminal, Code, Settings, Eye, Edit, Trash2, Copy, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

type ArsenalType = 'Tool' | 'Script' | 'Integration';
type Risk = 'Low' | 'Medium' | 'High';

interface ArsenalItem {
  id: string;
  name: string;
  type: ArsenalType;
  language?: string;
  platform?: string;
  usage?: string;
  paramsSchema?: string;
  permissions?: string;
  risk: Risk;
  fileUrl: string;
  checksum: string;
  owner: string;
  updatedAt: string;
  tags?: string[];
  description?: string;
}

const mockArsenalItems: ArsenalItem[] = [
  {
    id: 'arsenal-1',
    name: 'Windows Agent Installer',
    type: 'Tool',
    platform: 'Windows',
    usage: 'install-agent.exe --silent --config=default.json',
    permissions: 'Administrator',
    risk: 'Medium',
    fileUrl: '/arsenal/install-agent.exe',
    checksum: 'sha256:a1b2c3d4e5f6...',
    owner: 'Omar Sleem',
    updatedAt: '2025-01-15T10:30:00Z',
    tags: ['installer', 'windows', 'agent'],
    description: 'Automated installer for Windows security agents with silent deployment options'
  },
  {
    id: 'arsenal-2',
    name: 'Log Collection Script',
    type: 'Script',
    language: 'PowerShell',
    platform: 'Windows',
    usage: '.\\collect-logs.ps1 -Path "C:\\Logs" -Days 7',
    paramsSchema: '{"Path": "string", "Days": "number", "Compress": "boolean"}',
    permissions: 'Read access to log directories',
    risk: 'Low',
    fileUrl: '/arsenal/collect-logs.ps1',
    checksum: 'sha256:b2c3d4e5f6g7...',
    owner: 'Sara Ibrahim',
    updatedAt: '2025-01-14T14:20:00Z',
    tags: ['logs', 'collection', 'powershell'],
    description: 'PowerShell script to collect and compress system logs for analysis'
  },
  {
    id: 'arsenal-3',
    name: 'SIEM Integration Module',
    type: 'Integration',
    language: 'Python',
    platform: 'Linux',
    usage: 'python siem_connector.py --config siem.yaml',
    paramsSchema: '{"endpoint": "string", "api_key": "string", "batch_size": "number"}',
    permissions: 'Network access, API credentials',
    risk: 'High',
    fileUrl: '/arsenal/siem_connector.py',
    checksum: 'sha256:c3d4e5f6g7h8...',
    owner: 'Khalid Ahmed',
    updatedAt: '2025-01-13T09:15:00Z',
    tags: ['siem', 'integration', 'python'],
    description: 'Python module for integrating with various SIEM platforms'
  },
  {
    id: 'arsenal-4',
    name: 'Network Scanner',
    type: 'Tool',
    platform: 'Linux',
    usage: './netscan --range 192.168.1.0/24 --ports 22,80,443',
    permissions: 'Network access, raw sockets',
    risk: 'Medium',
    fileUrl: '/arsenal/netscan',
    checksum: 'sha256:d4e5f6g7h8i9...',
    owner: 'Omar Sleem',
    updatedAt: '2025-01-12T16:45:00Z',
    tags: ['network', 'scanner', 'security'],
    description: 'Fast network scanner for discovering open ports and services'
  },
  {
    id: 'arsenal-5',
    name: 'Config Backup Script',
    type: 'Script',
    language: 'Bash',
    platform: 'Linux',
    usage: './backup-config.sh /etc/myapp /backup/location',
    paramsSchema: '{"source": "string", "destination": "string", "compress": "boolean"}',
    permissions: 'Read access to config files, write access to backup location',
    risk: 'Low',
    fileUrl: '/arsenal/backup-config.sh',
    checksum: 'sha256:e5f6g7h8i9j0...',
    owner: 'John Smith',
    updatedAt: '2025-01-11T11:30:00Z',
    tags: ['backup', 'config', 'bash'],
    description: 'Bash script for backing up application configurations'
  }
];

const ArsenalPage: React.FC = () => {
  const [items, setItems] = useState<ArsenalItem[]>(mockArsenalItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArsenalItem | null>(null);

  // Get unique values for filters
  const allPlatforms = [...new Set(items.map(item => item.platform).filter(Boolean))];
  const allLanguages = [...new Set(items.map(item => item.language).filter(Boolean))];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
    const matchesRisk = riskFilter === 'all' || item.risk === riskFilter;
    
    return matchesSearch && matchesType && matchesPlatform && matchesRisk;
  });

  // Get type icon
  const getTypeIcon = (type: ArsenalType) => {
    switch (type) {
      case 'Tool':
        return <Terminal className="h-5 w-5 text-blue-400" />;
      case 'Script':
        return <Code className="h-5 w-5 text-green-400" />;
      case 'Integration':
        return <Settings className="h-5 w-5 text-purple-400" />;
      default:
        return <Terminal className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get risk color
  const getRiskColor = (risk: Risk) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Get risk icon
  const getRiskIcon = (risk: Risk) => {
    switch (risk) {
      case 'Low':
        return <CheckCircle className="h-4 w-4" />;
      case 'Medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'High':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredItems.map(item => ({
      'Name': item.name,
      'Type': item.type,
      'Language': item.language || '',
      'Platform': item.platform || '',
      'Risk Level': item.risk,
      'Owner': item.owner,
      'Updated': new Date(item.updatedAt).toLocaleDateString(),
      'Usage': item.usage || '',
      'Permissions': item.permissions || '',
      'Tags': item.tags?.join(', ') || '',
      'Description': item.description || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Arsenal');
    XLSX.writeFile(wb, `deployment-arsenal-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#E9EEF6]">Deployment Arsenal</h1>
          <p className="text-[#A7B0C0] mt-2">Collection of deployment tools, scripts, and integrations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToExcel}
            className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Upload className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <input
              type="text"
              placeholder="Search tools, scripts, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0B0F1A]/50 border border-white/8 rounded-2xl text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-white/70" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="Tool">Tools</option>
                <option value="Script">Scripts</option>
                <option value="Integration">Integrations</option>
              </select>
            </div>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            >
              <option value="all">All Platforms</option>
              {allPlatforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Arsenal Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="min-w-0 bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 hover:shadow-[0_20px_60px_rgba(20,216,196,0.15)] transition-all duration-300 hover:border-[#14D8C4]/30 hover:bg-[#111726] hover:scale-[1.02] group shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(item.type)}
                  <div>
                    <h3 className="font-semibold text-[#E9EEF6] group-hover:text-[#14D8C4] transition-colors duration-200">{item.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-[#A7B0C0]">{item.type}</span>
                      {item.language && (
                        <>
                          <span className="text-xs text-[#A7B0C0]">•</span>
                          <span className="text-xs text-[#A7B0C0]">{item.language}</span>
                        </>
                      )}
                      {item.platform && (
                        <>
                          <span className="text-xs text-[#A7B0C0]">•</span>
                          <span className="text-xs text-[#A7B0C0]">{item.platform}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(item.risk)}`}>
                  {getRiskIcon(item.risk)}
                  <span className="ml-1">{item.risk}</span>
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-[#A7B0C0] mb-4 line-clamp-2">{item.description}</p>
              )}

              {/* Usage */}
              {item.usage && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-[#A7B0C0] mb-2">Usage:</p>
                  <div className="bg-[#0B0F1A]/50 rounded-lg p-3 border border-white/8">
                    <code className="text-xs text-[#14D8C4] font-mono break-all">{item.usage}</code>
                    <button
                      onClick={() => copyToClipboard(item.usage)}
                      className="ml-2 p-1 text-white/70 hover:text-[#14D8C4] transition-colors"
                      title="Copy command"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-[#A7B0C0]">+{item.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-white/8">
                <div className="text-xs text-[#A7B0C0]">
                  <div>Owner: {item.owner}</div>
                  <div>Updated: {new Date(item.updatedAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Terminal className="h-12 w-12 text-white/70 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#E9EEF6] mb-2">No arsenal items found</h3>
          <p className="text-[#A7B0C0]">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6">
            <h2 className="text-xl font-semibold text-[#E9EEF6] mb-4">Add Arsenal Item</h2>
            <p className="text-[#A7B0C0] mb-4">Upload functionality will be implemented here.</p>
            <button
              onClick={() => setShowUploadModal(false)}
              className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedItem.type)}
                <h2 className="text-xl font-semibold text-[#E9EEF6]">{selectedItem.name}</h2>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(selectedItem.risk)}`}>
                  {getRiskIcon(selectedItem.risk)}
                  <span className="ml-1">{selectedItem.risk} Risk</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Type</label>
                  <p className="text-[#E9EEF6]">{selectedItem.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Owner</label>
                  <p className="text-[#E9EEF6]">{selectedItem.owner}</p>
                </div>
                {selectedItem.language && (
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Language</label>
                    <p className="text-[#E9EEF6]">{selectedItem.language}</p>
                  </div>
                )}
                {selectedItem.platform && (
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Platform</label>
                    <p className="text-[#E9EEF6]">{selectedItem.platform}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Description</label>
                  <p className="text-[#E9EEF6]">{selectedItem.description}</p>
                </div>
              )}

              {/* Usage */}
              {selectedItem.usage && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Usage</label>
                  <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-white/8">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-[#14D8C4] font-mono">{selectedItem.usage}</code>
                      <button
                        onClick={() => copyToClipboard(selectedItem.usage)}
                        className="p-2 text-white/70 hover:text-[#14D8C4] hover:bg-[#14D8C4]/10 rounded-lg transition-colors"
                        title="Copy command"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Parameters Schema */}
              {selectedItem.paramsSchema && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Parameters Schema</label>
                  <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-white/8">
                    <pre className="text-sm text-[#E9EEF6] font-mono whitespace-pre-wrap">{selectedItem.paramsSchema}</pre>
                  </div>
                </div>
              )}

              {/* Permissions */}
              {selectedItem.permissions && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Required Permissions</label>
                  <p className="text-[#E9EEF6]">{selectedItem.permissions}</p>
                </div>
              )}

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Info */}
              <div className="bg-[#0B0F1A]/30 rounded-lg p-4 border border-white/8">
                <h3 className="text-sm font-medium text-[#E9EEF6] mb-3">Security Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-[#A7B0C0] mb-1">Checksum</label>
                    <code className="text-[#14D8C4] font-mono text-xs break-all">{selectedItem.checksum}</code>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A7B0C0] mb-1">Last Updated</label>
                    <p className="text-[#E9EEF6]">{new Date(selectedItem.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArsenalPage;