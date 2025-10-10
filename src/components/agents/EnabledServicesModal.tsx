import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Agent, AgentService } from '../../types/agent';
import { X, List, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

interface EnabledServicesModalProps {
  agent: Agent;
  onClose: () => void;
}

const EnabledServicesModal: React.FC<EnabledServicesModalProps> = ({ agent, onClose }) => {
  const [services, setServices] = useState<AgentService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [agent.id]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_services')
        .select('*')
        .eq('agent_id', agent.id)
        .order('service_name');

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (serviceId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_services')
        .update({ enabled: !currentState })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(
        services.map((s) =>
          s.id === serviceId ? { ...s, enabled: !currentState } : s
        )
      );
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'log_forwarder':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'discovery':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'forensics':
        return 'bg-[#7C4DFF]/20 text-[#7C4DFF] border-[#7C4DFF]/30';
      case 'monitoring':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scanner':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <List className="w-5 h-5 text-[#14D8C4]" />
              Enabled Services
            </h2>
            <p className="text-sm text-[#A7B0C0] mt-1">
              {agent.hostname} ({agent.ip_address})
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#A7B0C0]" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#14D8C4]/30 border-t-[#14D8C4] rounded-full animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <List className="w-12 h-12 text-[#A7B0C0] mx-auto mb-3 opacity-50" />
              <p className="text-[#A7B0C0]">No services configured</p>
              <p className="text-sm text-[#A7B0C0]/70 mt-1">Add services to this agent to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-[#111726] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-medium text-white">{service.service_name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${getServiceTypeColor(
                            service.service_type
                          )}`}
                        >
                          {service.service_type.replace('_', ' ')}
                        </span>
                      </div>

                      {Object.keys(service.config).length > 0 && (
                        <div className="mt-2 p-2 bg-[#0D1117] rounded border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <Settings className="w-3 h-3 text-[#A7B0C0]" />
                            <span className="text-xs text-[#A7B0C0]">Configuration</span>
                          </div>
                          <pre className="text-xs text-[#A7B0C0] font-mono overflow-x-auto">
                            {JSON.stringify(service.config, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleService(service.id, service.enabled)}
                      className="ml-4 flex items-center gap-2"
                    >
                      {service.enabled ? (
                        <ToggleRight className="w-8 h-8 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-[#A7B0C0]" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnabledServicesModal;
