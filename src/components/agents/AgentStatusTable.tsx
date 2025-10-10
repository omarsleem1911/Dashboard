import React, { useState } from 'react';
import { Agent } from '../../types/agent';
import {
  Search,
  RefreshCw,
  Eye,
  Network,
  Stethoscope,
  List,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ForensicsSessionModal from './ForensicsSessionModal';
import DiagnoseAgentModal from './DiagnoseAgentModal';
import EnabledServicesModal from './EnabledServicesModal';
import DiscoverSubnetModal from './DiscoverSubnetModal';

interface AgentStatusTableProps {
  agents: Agent[];
  loading: boolean;
  onRefresh: () => void;
  clientId: string;
}

const AgentStatusTable: React.FC<AgentStatusTableProps> = ({
  agents,
  loading,
  onRefresh,
  clientId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [showForensics, setShowForensics] = useState<Agent | null>(null);
  const [showDiagnose, setShowDiagnose] = useState<Agent | null>(null);
  const [showServices, setShowServices] = useState<Agent | null>(null);
  const [showDiscoverSubnet, setShowDiscoverSubnet] = useState<Agent | null>(null);

  const itemsPerPage = 10;

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.ip_address.includes(searchTerm) ||
      agent.event_types.some((type) => type.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || agent.agent_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgents = filteredAgents.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Active: 'bg-green-500/20 text-green-400 border-green-500/30',
      Disconnected: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      Disabled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Decommissioned: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium border ${
          styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}
      >
        {status}
      </span>
    );
  };

  const toggleSelectAgent = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedAgents.size === paginatedAgents.length) {
      setSelectedAgents(new Set());
    } else {
      setSelectedAgents(new Set(paginatedAgents.map((a) => a.id)));
    }
  };

  return (
    <div className="bg-[#1A2235]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Agent Management</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
            <input
              type="text"
              placeholder="Search hostname, IP, or event type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#111726] border border-white/10 rounded-lg text-sm text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#14D8C4]/50 w-80"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#111726] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#14D8C4]/50"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Disconnected">Disconnected</option>
            <option value="Disabled">Disabled</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-[#111726] border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#14D8C4] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {selectedAgents.size > 0 && (
        <div className="mb-4 p-3 bg-[#14D8C4]/10 border border-[#14D8C4]/30 rounded-lg flex items-center justify-between">
          <span className="text-sm text-white">
            {selectedAgents.size} agent{selectedAgents.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-md text-xs hover:bg-blue-500/30 transition-colors">
              Diagnose All
            </button>
            <button className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-md text-xs hover:bg-red-500/30 transition-colors">
              Remove Selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedAgents.size === paginatedAgents.length && paginatedAgents.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-white/20 bg-[#111726]"
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Hostname</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">IP Address</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Agent Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Event Types</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Last Heartbeat</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Forensics</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-[#14D8C4] animate-spin mx-auto mb-2" />
                  <p className="text-[#A7B0C0]">Loading agents...</p>
                </td>
              </tr>
            ) : paginatedAgents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <p className="text-[#A7B0C0]">No agents found</p>
                </td>
              </tr>
            ) : (
              paginatedAgents.map((agent) => (
                <tr key={agent.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedAgents.has(agent.id)}
                      onChange={() => toggleSelectAgent(agent.id)}
                      className="rounded border-white/20 bg-[#111726]"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{agent.hostname}</span>
                      {agent.os_info && (
                        <span className="text-xs text-[#A7B0C0]">{agent.os_info}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{agent.ip_address}</span>
                      {agent.subnet && (
                        <span className="text-xs text-[#A7B0C0]">Subnet: {agent.subnet}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(agent.agent_status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {agent.event_types.length > 0 ? (
                        agent.event_types.slice(0, 3).map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#A7B0C0]">None</span>
                      )}
                      {agent.event_types.length > 3 && (
                        <span className="text-xs text-[#A7B0C0]">+{agent.event_types.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-[#A7B0C0]">
                      {new Date(agent.last_heartbeat).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setShowForensics(agent)}
                      className="px-3 py-1 bg-[#7C4DFF]/20 text-[#7C4DFF] border border-[#7C4DFF]/30 rounded-md text-xs hover:bg-[#7C4DFF]/30 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Open Session
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDiscoverSubnet(agent)}
                        title="Discover Subnet"
                        className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        <Network className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDiagnose(agent)}
                        title="Diagnose Agent"
                        className="p-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors"
                      >
                        <Stethoscope className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowServices(agent)}
                        title="Show Enabled Services"
                        className="p-1.5 bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 rounded hover:bg-[#14D8C4]/30 transition-colors"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        title="Remove Agent"
                        className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[#A7B0C0]">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAgents.length)} of{' '}
            {filteredAgents.length} agents
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-[#111726] border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <span className="text-sm text-white px-3">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-[#111726] border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {showForensics && (
        <ForensicsSessionModal
          agent={showForensics}
          onClose={() => setShowForensics(null)}
        />
      )}

      {showDiagnose && (
        <DiagnoseAgentModal
          agent={showDiagnose}
          onClose={() => setShowDiagnose(null)}
        />
      )}

      {showServices && (
        <EnabledServicesModal
          agent={showServices}
          onClose={() => setShowServices(null)}
        />
      )}

      {showDiscoverSubnet && (
        <DiscoverSubnetModal
          agent={showDiscoverSubnet}
          clientId={clientId}
          onClose={() => setShowDiscoverSubnet(null)}
        />
      )}
    </div>
  );
};

export default AgentStatusTable;
