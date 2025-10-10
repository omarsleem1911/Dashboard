import React, { useState } from 'react';
import { Plus, Trash2, Network, Search, Filter, AlertTriangle, CheckCircle, Clock, Edit, Save, X } from 'lucide-react';
import { ClientDetails } from '../../types';

interface AlternativeIP {
  id: string;
  originalIP: string;
  alternativeIP: string;
  description: string;
  addedBy: string;
  addedAt: string;
  isActive: boolean;
}

interface AlternativeIPsProps {
  client: ClientDetails;
}

const AlternativeIPs: React.FC<AlternativeIPsProps> = ({ client }) => {
  const [alternativeIPs, setAlternativeIPs] = useState<AlternativeIP[]>([
    {
      id: 'ip-1',
      originalIP: '192.168.1.100',
      alternativeIP: '10.0.0.100',
      description: 'Load balancer failover IP for main server',
      addedBy: 'Omar Sleem',
      addedAt: '2025-01-15T10:30:00Z',
      isActive: true
    },
    {
      id: 'ip-2',
      originalIP: '192.168.1.50',
      alternativeIP: '172.16.0.50',
      description: 'VPN tunnel endpoint alternative',
      addedBy: 'Sara Ibrahim',
      addedAt: '2025-01-14T14:20:00Z',
      isActive: true
    },
    {
      id: 'ip-3',
      originalIP: '192.168.1.200',
      alternativeIP: '10.1.1.200',
      description: 'Database cluster secondary node',
      addedBy: 'Omar Sleem',
      addedAt: '2025-01-13T09:15:00Z',
      isActive: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newIP, setNewIP] = useState({
    originalIP: '',
    alternativeIP: '',
    description: ''
  });

  const filteredIPs = alternativeIPs.filter(item => {
    const matchesSearch = item.originalIP.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.alternativeIP.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && item.isActive) ||
                         (statusFilter === 'inactive' && !item.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const addAlternativeIP = () => {
    if (!newIP.originalIP.trim() || !newIP.alternativeIP.trim() || !newIP.description.trim()) return;

    const newItem: AlternativeIP = {
      id: `ip-${Date.now()}`,
      originalIP: newIP.originalIP.trim(),
      alternativeIP: newIP.alternativeIP.trim(),
      description: newIP.description.trim(),
      addedBy: 'Current User',
      addedAt: new Date().toISOString(),
      isActive: true
    };

    setAlternativeIPs(prev => [...prev, newItem]);
    setNewIP({ originalIP: '', alternativeIP: '', description: '' });
    setShowAddForm(false);
  };

  const toggleIPStatus = (id: string) => {
    setAlternativeIPs(prev => prev.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const deleteIP = (id: string) => {
    if (confirm('Are you sure you want to delete this alternative IP mapping?')) {
      setAlternativeIPs(prev => prev.filter(item => item.id !== id));
    }
  };

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const saveEdit = (id: string, field: keyof AlternativeIP, value: string) => {
    setAlternativeIPs(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center">
            <Network className="h-6 w-6 mr-3 text-[#14D8C4]" />
            Alternative IPs - {client.companyName}
          </h1>
          <p className="text-slate-400 mt-2">Manage alternative IP addresses for network devices and services</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Alternative IP</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search IPs or descriptions..."
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
            <h2 className="text-xl font-semibold text-white mb-6">Add Alternative IP Mapping</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Original IP Address</label>
                  <input
                    type="text"
                    value={newIP.originalIP}
                    onChange={(e) => setNewIP(prev => ({ ...prev, originalIP: e.target.value }))}
                    placeholder="192.168.1.100"
                    className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Alternative IP Address</label>
                  <input
                    type="text"
                    value={newIP.alternativeIP}
                    onChange={(e) => setNewIP(prev => ({ ...prev, alternativeIP: e.target.value }))}
                    placeholder="10.0.0.100"
                    className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={newIP.description}
                  onChange={(e) => setNewIP(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this alternative IP mapping..."
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
                onClick={addAlternativeIP}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                Add IP Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative IPs Table */}
      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Alternative IP Mappings ({filteredIPs.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Original IP</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Alternative IP</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Added By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Added Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIPs.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200">
                    <td className="py-3 px-4 text-sm text-white font-mono">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          defaultValue={item.originalIP}
                          onBlur={(e) => saveEdit(item.id, 'originalIP', e.target.value)}
                          className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded px-2 py-1 text-sm text-white"
                        />
                      ) : (
                        item.originalIP
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300 font-mono">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          defaultValue={item.alternativeIP}
                          onBlur={(e) => saveEdit(item.id, 'alternativeIP', e.target.value)}
                          className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded px-2 py-1 text-sm text-white"
                        />
                      ) : (
                        item.alternativeIP
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300 max-w-xs">
                      {editingId === item.id ? (
                        <textarea
                          defaultValue={item.description}
                          onBlur={(e) => saveEdit(item.id, 'description', e.target.value)}
                          className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded px-2 py-1 text-sm text-white resize-none"
                          rows={2}
                        />
                      ) : (
                        <div className="truncate" title={item.description}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {item.addedBy}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => toggleIPStatus(item.id)}
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
                      <div className="flex items-center space-x-2">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
                              title="Save changes"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-slate-400 hover:text-slate-300 hover:bg-slate-500/10 rounded transition-colors"
                              title="Cancel editing"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(item.id)}
                              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                              title="Edit IP mapping"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteIP(item.id)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete IP mapping"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredIPs.length === 0 && (
            <div className="text-center py-8">
              <Network className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No alternative IP mappings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlternativeIPs;