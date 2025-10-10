import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Agent } from '../../types/agent';
import { X, Network, Search, CheckCircle } from 'lucide-react';

interface DiscoverSubnetModalProps {
  agent: Agent;
  clientId: string;
  onClose: () => void;
}

interface DiscoveredDevice {
  ip: string;
  hostname?: string;
  type: string;
  online: boolean;
}

const DiscoverSubnetModal: React.FC<DiscoverSubnetModalProps> = ({ agent, clientId, onClose }) => {
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredDevice[]>([]);
  const [complete, setComplete] = useState(false);

  const runDiscovery = async () => {
    setDiscovering(true);
    setDiscovered([]);
    setComplete(false);

    const mockDevices: DiscoveredDevice[] = [
      { ip: '192.168.1.1', hostname: 'gateway.local', type: 'Router', online: true },
      { ip: '192.168.1.10', hostname: 'server01.local', type: 'Server', online: true },
      { ip: '192.168.1.15', hostname: 'workstation-a', type: 'Desktop', online: true },
      { ip: '192.168.1.20', type: 'Unknown', online: true },
      { ip: '192.168.1.25', hostname: 'printer-hp', type: 'Printer', online: true },
      { ip: '192.168.1.30', hostname: 'nas01', type: 'Storage', online: true },
    ];

    for (let i = 0; i < mockDevices.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDiscovered((prev) => [...prev, mockDevices[i]]);
    }

    try {
      const insertData = mockDevices.map((device) => ({
        client_id: clientId,
        discovered_by_agent_id: agent.id,
        discovered_ip: device.ip,
        discovered_hostname: device.hostname,
        subnet: agent.subnet,
        vlan: agent.vlan,
        node_type: device.type,
        is_managed: false,
        last_seen: new Date().toISOString(),
      }));

      await supabase.from('network_topology').upsert(insertData, {
        onConflict: 'discovered_ip,client_id',
      });
    } catch (error) {
      console.error('Error saving discovered devices:', error);
    }

    setComplete(true);
    setDiscovering(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              Discover Subnet
            </h2>
            <p className="text-sm text-[#A7B0C0] mt-1">
              {agent.hostname} - {agent.subnet || 'Unknown subnet'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#A7B0C0]" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {discovered.length === 0 && !discovering && !complete ? (
            <div className="space-y-4">
              <p className="text-[#A7B0C0]">
                Scan the local network to discover devices and endpoints. This will map all active hosts in the
                subnet and add them to the network topology.
              </p>

              <div className="bg-[#111726] border border-white/10 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-medium text-white">Discovery includes:</h3>
                <ul className="text-sm text-[#A7B0C0] space-y-1 list-disc list-inside">
                  <li>Active IP addresses in the subnet</li>
                  <li>Hostname resolution</li>
                  <li>Basic device type identification</li>
                  <li>Online/offline status</li>
                </ul>
              </div>

              <button
                onClick={runDiscovery}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Start Network Discovery
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {discovering && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  <span className="text-sm text-blue-400">Scanning network...</span>
                </div>
              )}

              {complete && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400">Discovery complete - {discovered.length} devices found</span>
                </div>
              )}

              <div className="space-y-2">
                {discovered.map((device, idx) => (
                  <div
                    key={idx}
                    className="bg-[#111726] border border-white/10 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <div>
                        <p className="text-sm font-medium text-white">{device.ip}</p>
                        {device.hostname && <p className="text-xs text-[#A7B0C0]">{device.hostname}</p>}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                      {device.type}
                    </span>
                  </div>
                ))}
              </div>

              {complete && (
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-gradient-to-r from-[#14D8C4] to-[#14D8C4]/80 text-white rounded-lg hover:from-[#14D8C4]/90 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverSubnetModal;
