import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Agent, NetworkNode } from '../../types/agent';
import { Network, Server, Laptop, Monitor, HardDrive, Activity, XCircle } from 'lucide-react';

interface NetworkTopologyGraphProps {
  clientId: string;
  agents: Agent[];
}

interface TopologyNode {
  id: string;
  label: string;
  type: 'agent' | 'discovered';
  status?: string;
  subnet?: string;
  vlan?: string;
  x: number;
  y: number;
}

const NetworkTopologyGraph: React.FC<NetworkTopologyGraphProps> = ({ clientId, agents }) => {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);

  useEffect(() => {
    fetchNetworkTopology();
  }, [clientId, agents]);

  const fetchNetworkTopology = async () => {
    try {
      const { data, error } = await supabase
        .from('network_topology')
        .select('*')
        .eq('client_id', clientId);

      if (error) throw error;

      setNetworkNodes(data || []);
      generateTopology(agents, data || []);
    } catch (error) {
      console.error('Error fetching network topology:', error);
      generateTopology(agents, []);
    }
  };

  const generateTopology = (agents: Agent[], discovered: NetworkNode[]) => {
    const subnetMap = new Map<string, TopologyNode[]>();

    agents.forEach((agent, idx) => {
      const subnet = agent.subnet || 'unknown';
      if (!subnetMap.has(subnet)) {
        subnetMap.set(subnet, []);
      }

      subnetMap.get(subnet)?.push({
        id: agent.id,
        label: agent.hostname,
        type: 'agent',
        status: agent.agent_status,
        subnet: agent.subnet,
        vlan: agent.vlan,
        x: 0,
        y: 0,
      });
    });

    discovered.forEach((node) => {
      if (!node.is_managed) {
        const subnet = node.subnet || 'unknown';
        if (!subnetMap.has(subnet)) {
          subnetMap.set(subnet, []);
        }

        subnetMap.get(subnet)?.push({
          id: node.id,
          label: node.discovered_hostname || node.discovered_ip,
          type: 'discovered',
          subnet: node.subnet,
          vlan: node.vlan,
          x: 0,
          y: 0,
        });
      }
    });

    const allNodes: TopologyNode[] = [];
    let yOffset = 0;

    Array.from(subnetMap.entries()).forEach(([subnet, subnetNodes]) => {
      subnetNodes.forEach((node, idx) => {
        allNodes.push({
          ...node,
          x: (idx % 8) * 140 + 70,
          y: yOffset + Math.floor(idx / 8) * 100 + 50,
        });
      });

      yOffset += Math.ceil(subnetNodes.length / 8) * 100 + 80;
    });

    setNodes(allNodes);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'border-green-500 bg-green-500/20';
      case 'Disconnected':
        return 'border-orange-500 bg-orange-500/20';
      case 'Disabled':
        return 'border-yellow-500 bg-yellow-500/20';
      case 'Decommissioned':
        return 'border-red-500 bg-red-500/20';
      default:
        return 'border-gray-500 bg-gray-500/20';
    }
  };

  const getNodeIcon = (node: TopologyNode) => {
    if (node.type === 'agent') {
      if (node.status === 'Active') {
        return <Activity className="w-4 h-4 text-green-400" />;
      }
      return <XCircle className="w-4 h-4 text-orange-400" />;
    }
    return <Monitor className="w-4 h-4 text-gray-400" />;
  };

  const groupedBySubnet = nodes.reduce((acc, node) => {
    const subnet = node.subnet || 'Unknown Subnet';
    if (!acc[subnet]) {
      acc[subnet] = [];
    }
    acc[subnet].push(node);
    return acc;
  }, {} as Record<string, TopologyNode[]>);

  return (
    <div className="bg-[#1A2235]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-[#14D8C4]" />
          <h2 className="text-lg font-semibold text-white">Network Topology</h2>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-green-500/20"></div>
            <span className="text-[#A7B0C0]">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-orange-500/20"></div>
            <span className="text-[#A7B0C0]">Disconnected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-gray-500 bg-gray-500/20"></div>
            <span className="text-[#A7B0C0]">Discovered</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedBySubnet).map(([subnet, subnetNodes]) => (
          <div key={subnet} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[#14D8C4] font-medium">
              <Server className="w-4 h-4" />
              <span>{subnet}</span>
              <span className="text-[#A7B0C0]">({subnetNodes.length} nodes)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {subnetNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200
                    ${getStatusColor(node.status)}
                    ${selectedNode === node.id ? 'ring-2 ring-[#14D8C4] scale-105' : 'hover:scale-105'}
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    {getNodeIcon(node)}
                    <span className="text-xs text-white font-medium truncate w-full text-center">
                      {node.label}
                    </span>
                    {node.type === 'agent' && (
                      <span className="text-xs text-[#A7B0C0] capitalize">
                        {node.status}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {nodes.length === 0 && (
          <div className="text-center py-12">
            <Network className="w-12 h-12 text-[#A7B0C0] mx-auto mb-3 opacity-50" />
            <p className="text-[#A7B0C0]">No network topology data available</p>
            <p className="text-sm text-[#A7B0C0]/70 mt-1">Deploy agents to begin mapping your network</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkTopologyGraph;
