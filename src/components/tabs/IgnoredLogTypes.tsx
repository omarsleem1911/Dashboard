import React, { useState } from 'react';
import { Plus, Trash2, FileX, Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ClientDetails } from '../../types';

interface IgnoredLogType {
  id: string;
  logType: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  isActive: boolean;
}

interface IgnoredLogTypesProps {
  client: ClientDetails;
}

const IgnoredLogTypes: React.FC<IgnoredLogTypesProps> = ({ client }) => {
  const [ignoredLogTypes, setIgnoredLogTypes] = useState<IgnoredLogType[]>([
    {
      id: 'log-1',
      logType: 'Windows Event ID 4624',
      reason: 'Too many successful login events causing noise',
      addedBy: 'Omar Sleem',
      addedAt: '2025-01-15T10:30:00Z',
      isActive: true
    },
    {
      id: 'log-2',
      logType: 'IIS Access Logs - /health',
      reason: 'Health check endpoints generate excessive logs',
      addedBy: 'Sara Ibrahim',
      addedAt: '2025-01-14T14:20:00Z',
      isActive: true
    },
    {
      id: 'log-3',
      logType: 'Firewall Allow Rules - Port 443',
      reason: 'Standard HTTPS traffic, not security relevant',
      addedBy: 'Omar Sleem',
      addedAt: '2025-01-13T09:15:00Z',
      isActive: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLogType, setNewLogType] = useState({
    logType: '',
    reason: ''
  });

  const filteredLogTypes = ignoredLogTypes.filter(item => {
    const matchesSearch = item.logType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && item.isActive) ||
                         (statusFilter === 'inactive' && !item.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const addIgnoredLogType = () => {
    if (!newLogType.logType.trim() || !newLogType.reason.trim()) return;

    const newItem: IgnoredLogType = {
      id: `log-${Date.now()}`,
      logType: newLogType.logType.trim(),
      reason: newLogType.reason.trim(),
      addedBy: 'Current User',
      addedAt: new Date().toISOString(),
      isActive: true
    };

    setIgnoredLogTypes(prev => [...prev, newItem]);
    setNewLogType({ logType: '', reason: '' });
    setShowAddForm(false);
  };

  const toggleLogTypeStatus = (id: string) => {
    setIgnoredLogTypes(prev => prev.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const deleteLogType = (id: string) => {
    if (confirm('Are you sure you want to delete this ignored log type?')) {
      setIgnoredLogTypes(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center">
            <FileX className="h-6 w-6 mr-3 text-[#14D8C4]" />
            Ignored Log Types - {client.companyName}
          </h1>
          <p className="text-slate-400 mt-2">Manage log types that are excluded from monitoring and alerting</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Ignored Log Type</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search log types or reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0B0F1A]/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Add Ignored Log Type</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Log Type</label>
                <input
                  type="text"
                  value={newLogType.logType}
                  onChange={(e) => setNewLogType(prev => ({ ...prev, logType: e.target.value }))}
                  placeholder="e.g., Windows Event ID 4624, IIS Access Logs"
                  className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Ignoring</label>
                <textarea
                  rows={3}
                  value={newLogType.reason}
                  onChange={(e) => setNewLogType(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why this log type should be ignored..."
                  className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addIgnoredLogType}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                Add Log Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ignored Log Types Table */}
      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Ignored Log Types ({filteredLogTypes.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Log Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Added By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Added Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogTypes.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200">
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {item.logType}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300 max-w-xs">
                      <div className="truncate" title={item.reason}>
                        {item.reason}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {item.addedBy}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => toggleLogTypeStatus(item.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                          item.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => deleteLogType(item.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete ignored log type"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogTypes.length === 0 && (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No ignored log types found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IgnoredLogTypes;