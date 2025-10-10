import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Agent, AgentStatusSummary } from '../../types/agent';
import AgentStatusTable from '../../components/agents/AgentStatusTable';
import NetworkTopologyGraph from '../../components/agents/NetworkTopologyGraph';
import AgentStatusSummaryCards from '../../components/agents/AgentStatusSummaryCards';
import { Activity } from 'lucide-react';

const AgentStatusPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AgentStatusSummary>({
    total: 0,
    active: 0,
    disconnected: 0,
    disabled: 0,
    decommissioned: 0,
  });

  useEffect(() => {
    fetchAgents();
  }, [clientId]);

  const fetchAgents = async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const agentData = data || [];
      setAgents(agentData);

      const statusSummary = agentData.reduce(
        (acc, agent) => {
          acc.total++;
          acc[agent.agent_status.toLowerCase() as keyof AgentStatusSummary]++;
          return acc;
        },
        {
          total: 0,
          active: 0,
          disconnected: 0,
          disabled: 0,
          decommissioned: 0,
        }
      );

      setSummary(statusSummary);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAgents();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#14D8C4]/20 to-[#7C4DFF]/20 rounded-lg border border-[#14D8C4]/30">
            <Activity className="w-6 h-6 text-[#14D8C4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Status</h1>
            <p className="text-sm text-[#A7B0C0]">Monitor and manage deployed agents</p>
          </div>
        </div>
      </div>

      <AgentStatusSummaryCards summary={summary} />

      <NetworkTopologyGraph clientId={clientId || ''} agents={agents} />

      <AgentStatusTable
        agents={agents}
        loading={loading}
        onRefresh={handleRefresh}
        clientId={clientId || ''}
      />
    </div>
  );
};

export default AgentStatusPage;
